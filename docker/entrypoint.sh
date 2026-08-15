#!/bin/sh
set -eu

echo "Applying database migrations..."
npx prisma migrate deploy

if [ "${SEED_DEMO_DATA:-false}" = "true" ]; then
  echo "Seeding demo data because SEED_DEMO_DATA=true..."
  npm run db:seed
fi

exec "$@"
