# Deploy SMCS on a Hostinger VPS

This deployment runs SMCS in bridge mode with persistent Docker volumes for the SQLite database and generated assets. Traefik runs separately in host network mode and discovers SMCS through the Docker provider and the external `traefik_default` bridge network.

## 1. VPS prerequisites

Install Docker and Docker Compose on the VPS, then clone or upload this repository:

```bash
git clone <your-repository-url> smcs
cd smcs
```

If you use Hostinger’s Docker Manager, upload the repository and use the same compose file and environment values below.

## 2. Production environment

Create the production environment file. Do not commit it:

```bash
cp .env.production.example .env.production
openssl rand -base64 32
openssl rand -hex 32
nano .env.production
```

Set at least:

- `APP_URL` to the final HTTPS URL.
- `SMCS_HOST` to the public hostname routed by Traefik.
- `TRAEFIK_NETWORK_NAME` to the actual external Docker network used by Traefik, normally `traefik_default`.
- `TRAEFIK_ENTRYPOINT` and `TRAEFIK_CERTRESOLVER` to the names configured in your Traefik container.
- `SESSION_SECRET` to a long random value.
- `TOKEN_ENCRYPTION_KEY` to the output of `openssl rand -base64 32`.
- `N8N_INGESTION_TOKEN` to a separate long random value if n8n will be used.
- Keep `CONTENT_STUDIO_PUBLISH_MODE=simulated` until LinkedIn OAuth is configured and tested.

For live LinkedIn publishing, set the callback URL in the LinkedIn developer app to:

```text
https://your-domain.example/api/linkedin/callback
```

Before starting SMCS, confirm that the external Traefik network exists:

```bash
docker network inspect traefik_default >/dev/null
```

If your Traefik stack uses a different network name, set `TRAEFIK_NETWORK_NAME` accordingly in `.env.production`. Do not create a second network when the Traefik stack already owns the correct one.

## 3. Build and start

```bash
docker compose --env-file .env.production -f docker-compose.production.yml up -d --build
docker compose --env-file .env.production -f docker-compose.production.yml ps
curl http://127.0.0.1:3000/api/health
```

The first container start applies the checked-in Prisma migration. Demo data is not created unless `SEED_DEMO_DATA=true`; create the first owner account through the registration screen.

The database and generated visuals survive container replacement through these named volumes:

- `smcs_data` → `/app/data`
- `smcs_assets` → `/app/storage/assets`

## 4. Traefik routing

The compose file attaches SMCS to the external Traefik network and adds these routing labels:

- `traefik.http.routers.smcs.rule=Host(...)`
- `traefik.http.routers.smcs.entrypoints=websecure`
- `traefik.http.routers.smcs.tls.certresolver=myresolver`
- `traefik.http.services.smcs.loadbalancer.server.port=3000`
- `traefik.docker.network=traefik_default`

The `127.0.0.1:3000:3000` mapping remains intentionally enabled so host-mode Traefik and local health checks can reach the service. If Traefik returns `502`, verify that the label network name exactly matches the external network name and inspect both containers:

```bash
docker inspect smcs --format '{{json .NetworkSettings.Networks}}'
docker logs traefik --tail 100
docker compose --env-file .env.production -f docker-compose.production.yml logs --tail 100 smcs
```

After HTTPS is active, update `APP_URL` and `LINKEDIN_REDIRECT_URI`, then restart:

```bash
docker compose --env-file .env.production -f docker-compose.production.yml up -d
```

## 5. Operations

View logs:

```bash
docker compose -f docker-compose.production.yml logs -f smcs
```

Restart after configuration changes:

```bash
docker compose --env-file .env.production -f docker-compose.production.yml up -d --build
```

Back up the persistent data:

```bash
mkdir -p backups
docker run --rm \
  -v smcs_smcs_data:/data:ro \
  -v "$PWD/backups":/backup \
  alpine:3.20 tar czf /backup/smcs-data-$(date +%Y%m%d-%H%M%S).tgz -C /data .
```

Do not run `docker compose down -v` unless you intentionally want to delete the SQLite database and generated assets.

## 6. Security checklist

- Keep `.env.production` outside Git and restrict it with `chmod 600`.
- Keep the Docker port bound to `127.0.0.1`; expose only Traefik’s ports 80/443 publicly.
- Use HTTPS before enabling LinkedIn OAuth or live publishing.
- Keep `CONTENT_STUDIO_PUBLISH_MODE=simulated` until the full approval flow is validated.
- Rotate `SESSION_SECRET`, `TOKEN_ENCRYPTION_KEY`, AI keys, and n8n tokens if exposed.
- Back up the Docker volumes before upgrades.
