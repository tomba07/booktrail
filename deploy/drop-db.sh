#!/usr/bin/env bash
set -euo pipefail

VM_HOST="${VM_HOST:-root@165.227.2.163}"

echo "==> Dropping database on $VM_HOST"
ssh "$VM_HOST" "docker exec booktrail-app rm -f /data/booktrail.sqlite && docker restart booktrail-app"

echo "==> Done"
