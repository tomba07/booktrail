# Booktrail

A SAP CAP and Fiori Elements app for personal book tracking.

## Development

```bash
npm run watch-booktrail
```

## Deployment

Booktrail owns only its app container and persistent app data.

```bash
deploy/update-vm.sh
```

The script syncs this repo to `/opt/apps/booktrail` on the VM, rebuilds the Booktrail image, and restarts the Booktrail stack.

Shared VM infrastructure, including Caddy routes and the external Docker network named `web`, lives in the sibling `mteschke-vm-infra` repo.

## GitHub Actions

The deploy workflow expects these repository secrets:

```text
VM_HOST
VM_USER
VM_SSH_KEY
```

On each push to `main`, GitHub syncs this repo to `/opt/apps/booktrail`, rebuilds the Booktrail Docker image on the VM, and restarts the app.

Use `deploy/drop-db.sh` only when intentionally wiping the production SQLite database.
