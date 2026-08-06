# Booktrail

A SAP Fiori Elements app built with CAP (Node.js) for personal book tracking.

## Stack

- **Backend**: SAP CAP (`@sap/cds`), SQLite
- **Frontend**: SAP Fiori Elements (List Report + Object Page)
- **Deployment**: Docker on a VM via `deploy/update-vm.sh`

## Development

```bash
npm run watch-booktrail   # start local dev server with live reload
```

## Fiori / Annotations

Before making any changes to annotations, UI layout, or OData service definitions, **always use the Fiori MCP `search_docs` tool first** to look up the correct pattern. Do not guess annotation syntax — the MCP docs are the authoritative source.

## Deployment

- `deploy/update-vm.sh` — rsync + rebuild Docker image on the VM
- `deploy/drop-db.sh` — delete the SQLite DB on the VM and restart (destructive, wipes all data)
- The entrypoint runs `npx cds deploy` on every start to apply schema migrations
- `cds-plugin-ui5`, `@sap/cds-dk` are prod dependencies (needed at runtime in the container)

## server.js

Uses `require.main === module` to handle both `cds watch` (module import) and `node server.js` (direct execution).
