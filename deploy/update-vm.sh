#!/usr/bin/env bash
set -euo pipefail

VM_HOST="${VM_HOST:-root@165.227.2.163}"
REMOTE_DIR="/opt/apps/booktrail"

echo "==> Syncing to $VM_HOST:$REMOTE_DIR"
rsync -az --exclude='.git' --exclude='node_modules' --exclude='deploy/.env' \
  "$(git -C "$(dirname "$0")/.." rev-parse --show-toplevel)/" \
  "$VM_HOST:$REMOTE_DIR/"

echo "==> Rebuilding and restarting"
ssh "$VM_HOST" bash -s <<'ENDSSH'
  set -euo pipefail
  cd /opt/apps/booktrail/deploy
  docker compose up -d --build
  docker compose ps
ENDSSH

echo "==> Done"
