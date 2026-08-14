# Booktrail

A SAP CAP and Fiori Elements app for personal book tracking.

## Development

```bash
npm run watch-booktrail
```

## Deployment

VM deployment is managed from the sibling `mteschke-vm-infra` repo. This app repo only contains the runtime pieces needed to build and run the Booktrail container, such as `Dockerfile`, `entrypoint.sh`, and the CAP/UI5 source.

Use `mteschke-vm-infra` for VM orchestration, compose configuration, proxy routes, deployment workflows, and any production database maintenance tasks.
