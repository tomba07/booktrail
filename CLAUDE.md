# Booktrail

A SAP Fiori Elements app built with CAP (Node.js) for personal book tracking.

## Stack

- **Backend**: SAP CAP (`@sap/cds`), SQLite
- **Frontend**: SAP Fiori Elements (List Report + Object Page)
- **Deployment**: VM orchestration lives in the sibling `mteschke-vm-infra` repo

## Development

```bash
npm run watch-booktrail   # start local dev server with live reload
```

## Fiori / Annotations

Before making any changes to annotations, UI layout, or OData service definitions, **always use the Fiori MCP `search_docs` tool first** to look up the correct pattern. Do not guess annotation syntax — the MCP docs are the authoritative source.

## Deployment

- VM compose configuration, proxy routes, deployment workflows, and production database maintenance live in `mteschke-vm-infra`
- This repo keeps only app runtime files such as `Dockerfile`, `entrypoint.sh`, and CAP/UI5 source
- The entrypoint initializes a missing SQLite DB and runs non-destructive SQLite migrations for existing DBs
- `cds-plugin-ui5`, `@sap/cds-dk` are prod dependencies (needed at runtime in the container)

## server.js

Uses `require.main === module` to handle both `cds watch` (module import) and `node server.js` (direct execution).
