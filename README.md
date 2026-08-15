# SMCS · Social Media Content Studio

SMCS is a local, single-owner LinkedIn content studio for source-backed AI and enterprise insights.

> Agents propose. Humans review. Humans approve. Humans publish.

## Local setup

Prerequisites: Node.js 20+ and npm 10+.

```bash
npm install
cp .env.example .env
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The seed command creates a demo account:

- Email: `demo@smcs.local`
- Password: `demo1234`

Change the password or create a new account for anything beyond local demonstration.

## Environment

The app works without provider credentials. In that mode it uses a deterministic content fallback and simulated LinkedIn publishing.

- `AI_BASE_URL`, `AI_API_KEY`, `AI_MODEL`: optional OpenAI-compatible chat-completions endpoint.
- `CONTENT_STUDIO_PUBLISH_MODE=live`: enables the LinkedIn adapter; it still requires an OAuth connection.
- `TOKEN_ENCRYPTION_KEY`: base64-encoded 32-byte key required for encrypted LinkedIn tokens.
- `N8N_INGESTION_TOKEN`: protects the n8n ingestion endpoint.

Generate a token encryption key with:

```bash
openssl rand -base64 32
```

## Workflow

1. Sign in or create the owner account.
2. Ingest a source-backed signal from **Signal queue**.
3. Generate a draft; the provider adapter or deterministic fallback creates an insight packet, three variants, and a branded card.
4. Review the source ledger and edit the post.
5. Mark reviewed, then approve.
6. Press Publish and confirm the exact text and hashtags.

Publishing in simulated mode records a local `PublishLog` and never contacts LinkedIn.

## n8n

Import `n8n/workflows/smcs-rss-ingestion.json` into n8n. Configure these n8n environment variables:

- `SMCS_APP_URL`
- `SMCS_RSS_URL`
- `SMCS_SOURCE_ID`
- `SMCS_N8N_INGESTION_TOKEN`
- `SMCS_NOTIFY_WEBHOOK_URL`

n8n orchestrates ingestion and notification only. It must not handle LinkedIn OAuth tokens or client secrets.

## Verification commands

```bash
npm run typecheck
npm test
npm run build
```

The test suite covers URL canonicalization, scoring, variant generation, SVG escaping, and publish checksum helpers. Live AI and LinkedIn behavior should be validated with mocked provider endpoints before enabling production credentials.

## Hostinger VPS Docker deployment

For a persistent production container, use [DEPLOY_HOSTINGER.md](./DEPLOY_HOSTINGER.md), `Dockerfile`, and `docker-compose.production.yml`. The compose setup persists the SQLite database and generated assets and binds the app to `127.0.0.1:3000` for an Nginx/HTTPS reverse proxy.

To create an uploadable deployment archive locally:

```bash
npm run package:docker
```

This creates a dated archive under `dist/` without local dependencies, secrets, build output, or the local SQLite database.
