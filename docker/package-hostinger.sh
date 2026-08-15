#!/bin/sh
set -eu

release_dir="${1:-dist}"
mkdir -p "$release_dir"
archive="$release_dir/smcs-hostinger-vps-$(date +%Y%m%d).tar.gz"

tar \
  --exclude="./node_modules" \
  --exclude="./.next" \
  --exclude="./coverage" \
  --exclude="./tsconfig.tsbuildinfo" \
  --exclude="./dist" \
  --exclude="./.git" \
  --exclude="./.env" \
  --exclude="./.env.production" \
  --exclude="./prisma/*.db" \
  --exclude="./prisma/*.db-journal" \
  --exclude="./storage/assets/*" \
  -czf "$archive" .

echo "Created $archive"
