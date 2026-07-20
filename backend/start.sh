#!/bin/sh
# start.sh — Production startup script
# Runs on every Render deploy before the server starts.
set -e  # Exit immediately on any error

echo "==> Running database migrations..."
npx prisma migrate deploy

echo "==> Starting server..."
exec node server.js
