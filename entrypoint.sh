#!/bin/sh
set -e

DB_PATH="/data/booktrail.sqlite"

if [ ! -f "$DB_PATH" ]; then
  echo "No database found, deploying schema..."
  npx cds deploy --to sqlite:"$DB_PATH"
else
  echo "Database exists, skipping deploy."
fi

exec npm start
