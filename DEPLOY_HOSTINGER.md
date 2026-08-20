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

## VK.1. SMCS Container Environment (.env.production)
Since SMCS needs to communicate with n8n directly over the internal Docker network as well as accept public requests via Traefik, update or verify the following variables:

**A. Traefik Routing & Host Variables**
SMCS_HOST: Set this to the public domain or subdomain assigned to SMCS (e.g., smcs2.srv1738397.hstgr.cloud). The Docker Compose file relies on this to configure Traefik's Host() rule:

```
Code snippet
SMCS_HOST=smcs2.srv1738397.hstgr.cloud
```
**B. Inter-Container Communication with n8n**
Internal n8n Endpoint URL: Since SMCS and n8n are both on the traefik_net Docker network, SMCS should not send internal API requests through the public Traefik domain (which would unnecessarily route out to the internet and back).
Instead, configure SMCS to call n8n using its Docker service name / container hostname:

Code snippet
# Use the container's service name or explicit container name on traefik_net
```
N8N_API_URL=http://n8n-with-ai-assistant-emty-n8n-1:5678
```
or
```
N8N_API_URL=http://n8n:5678 if n8n service is aliased as n8n on traefik_net
```
Authentication Tokens: Ensure shared keys/tokens match between both services for API requests (e.g., webhook signatures or ingestion tokens):

Code snippet
```
SMCS_N8N_INGESTION_TOKEN=2248610a46f2c41561e06c800f41c8ab8b99730f9eadcbddce15bc7dcd7ec2c8
```
C. Application Binding & Port Settings
Host Binding: Ensure node/app binds to 0.0.0.0 inside the container so Traefik can reach it over the Docker bridge interface.

Code snippet
```
PORT=3000
HOSTNAME=0.0.0.0
NODE_ENV=production
```
**2. Traefik Container Environment (.env or Compose Environment)**
To ensure Let's Encrypt certificates generate properly and Traefik correctly routes to all containers on the host, consider the following:

**A. ACME / Let's Encrypt Email**
ACME_EMAIL: Let's Encrypt requires a valid email address to register your account and send SSL expiration/renewal notices.

Code snippet
```
ACME_EMAIL=your-email@example.com
```
**B. Shared Docker Network Name**
Standardize the network name across all docker-compose files. Avoid relying on dynamic default overrides that could create separate networks.

Code snippet
```
TRAEFIK_NETWORK_NAME=traefik_net
```
**C. Wildcard / Host Base Domain (If applicable)**
TRAEFIK_HOST: Used by n8n or other services to dynamically derive host rules (e.g., COMPOSE_PROJECT_NAME.TRAEFIK_HOST):

Code snippet
```
TRAEFIK_HOST=srv1738397.hstgr.cloud
```
**3. Key Summary Checklist**
Certificate Resolver Consistency: Ensure .env.production or compose labels specify certresolver=letsencrypt to match --certificatesresolvers.letsencrypt... declared in Traefik.

Docker Network Alignment: Make sure traefik.docker.network=traefik_net is set in labels for both smcs and n8n, and that both compose files join traefik_net with external: true.

Use Internal Service Names: For communication between SMCS and n8n, use http://<n8n-container-name>:5678 in .env.production rather than the external HTTPS URL to avoid firewall blockages or hairpin NAT issues on the host.

## 3. Step-by-step commands to build and deploy SMCS on your VPS using Docker Compose 
Here are the step-by-step commands to build and deploy SMCS on your VPS using Docker Compose.

**Step 1: Navigate to the SMCS Directory**
Ensure you are in the project folder where docker-compose.production.yml and .env.production are located:

```Bash
cd ~/SMCS-CG
```
**Step 2: Ensure the Traefik Network Exists**
Since the Docker Compose file references traefik_net as an external network, make sure it exists on your host:

```Bash
docker network create traefik_net || true
```
**Step 3: Build and Start SMCS**
Run Docker Compose using your production file to build the image and bring the container up in detached mode:

```Bash
docker compose -f docker-compose.production.yml up -d --build
```

**Step 4: Verify Deployment Status**
Check if the container is running and healthy:

```Bash
docker compose -f docker-compose.production.yml ps
```
**Step 5: Check Logs for Troubleshooting**
To monitor startup logs or troubleshoot any routing or database issues:

```Bash
docker compose -f docker-compose.production.yml logs -f smcs
```
Quick Management Snippets
Stop the service:

```Bash
docker compose -f docker-compose.production.yml down
```
Restart the service:

```Bash
docker compose -f docker-compose.production.yml restart smcs
```
Test network connection from SMCS to n8n:

```Bash
docker exec -it smcs-cg-smcs-1 curl -v http://n8n-with-ai-assistant-emty-n
```


The error may occurs while testign with curl, because the curl utility isn't installed inside the smcs container image (which is standard for minimal Node.js base images).

**Here are alternative ways to test the network connection between smcs and n8n:**

Method 1: Use node (Built-in to your Node.js container)
Since Node.js is installed in your SMCS container, you can use Node's fetch API directly from the command line:

```Bash
docker exec -it smcs-cg-smcs-1 node -e "fetch('http://n8n-with-ai-assistant-emty-n8n-1:5678').then(r => console.log('HTTP Status:', r.status)).catch(e => console.error('Connection failed:', e.message))"
```
Success response: You should see HTTP Status: 200 or HTTP Status: 302 (if n8n redirects).

Failure response: You will see Connection failed: fetch failed or a DNS lookup error.

Method 2: Test TCP connection via /dev/tcp
You can test network-level reachability directly using standard shell features:

```Bash
docker exec -it smcs-cg-smcs-1 sh -c "nc -zv n8n-with-ai-assistant-emty-n8n-1 5678"
```
Or using Node's network socket:

```Bash
docker exec -it smcs-cg-smcs-1 node -e "require('net').connect(5678, 'n8n-with-ai-assistant-emty-n8n-1').on('connect', () => { console.log('Port 5678 is OPEN!'); process.exit(0); }).on('error', (err) => { console.error('Connection FAILED:', err.message); process.exit(1); })"
```
Method 3: Run curl from a temporary container on traefik_net
Instead of running curl inside smcs, launch a tiny temporary Alpine container attached to the same traefik_net network:

```Bash
docker run --rm --network traefik_net curlimages/curl -v http://n8n-with-ai-assistant-emty-n8n-1:5678
```
