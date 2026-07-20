#!/bin/sh
# start.sh — Production startup script
# Runs automatically on every Render deploy.
set -e  # Exit immediately on any error

echo "==> Running database migrations..."
npx prisma migrate deploy

echo "==> Applying core SQL extensions (triggers, views, functions)..."
node scripts/applyExtensions.js

echo "==> Starting server..."
exec node server.js
