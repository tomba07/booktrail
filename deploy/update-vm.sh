#!/usr/bin/env bash
set -euo pipefail

VM_HOST="${VM_HOST:-root@165.227.2.163}"
REMOTE_DIR="/opt/apps/booktrail"
PROXY_DIR="/opt/apps/proxy"

REPO_ROOT="$(git -C "$(dirname "$0")/.." rev-parse --show-toplevel)"

echo "==> Syncing booktrail to $VM_HOST:$REMOTE_DIR"
rsync -az --exclude='.git' --exclude='node_modules' --exclude='deploy/.env' \
  "$REPO_ROOT/" "$VM_HOST:$REMOTE_DIR/"

echo "==> Syncing proxy to $VM_HOST:$PROXY_DIR"
rsync -az "$REPO_ROOT/deploy/proxy/" "$VM_HOST:$PROXY_DIR/"

echo "==> Reloading proxy"
ssh "$VM_HOST" "cd $PROXY_DIR && docker compose up -d"

echo "==> Rebuilding booktrail"
ssh "$VM_HOST" "cd $REMOTE_DIR/deploy && docker compose up -d --build && docker compose ps"

echo "==> Done"
