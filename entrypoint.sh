#!/bin/sh
set -e

DB_PATH="/data/booktrail.sqlite"

echo "Deploying schema..."
npx cds deploy --to sqlite:"$DB_PATH"

exec npm start
