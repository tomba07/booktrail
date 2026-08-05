#!/bin/sh
set -e

DB_PATH="/data/booktrail.sqlite"

if [ ! -f "$DB_PATH" ]; then
  echo "Database not found, deploying schema..."
  npx cds deploy --to sqlite:"$DB_PATH"
fi

exec npm start
