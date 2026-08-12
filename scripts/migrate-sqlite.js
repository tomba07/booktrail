const { DatabaseSync } = require('node:sqlite');

const dbPath = process.env.DB_PATH || '/data/booktrail.sqlite';
const db = new DatabaseSync(dbPath);

function tableExists(name) {
  return !!db.prepare("select 1 from sqlite_master where name = ? and type in ('table', 'view')").get(name);
}

function hasColumn(table, column) {
  return db.prepare(`pragma table_info('${table}')`).all().some((row) => row.name === column);
}

function addColumnIfMissing(table, column, definition) {
  if (!tableExists(table) || hasColumn(table, column)) return;
  console.log(`Adding missing column ${table}.${column}`);
  db.exec(`alter table ${table} add column ${column} ${definition}`);
}

db.exec('begin');
try {
  addColumnIfMissing('booktrail_Books', 'finishedAt', 'DATE_TEXT');
  addColumnIfMissing('CatalogService_Books_drafts', 'finishedAt', 'DATE_TEXT');

  if (tableExists('booktrail_Books')) {
    db.exec(`
      drop view if exists CatalogService_Books;
      create view CatalogService_Books as select
        Books_0.ID,
        Books_0.title,
        Books_0.author,
        Books_0.read,
        Books_0.listened,
        Books_0.finishedAt,
        Books_0.read or Books_0.listened as finished,
        Books_0.rating,
        Books_0.priority,
        Books_0.coverUrl
      from booktrail_Books as Books_0;
    `);
  }

  db.exec('commit');
  console.log('SQLite migrations complete.');
} catch (error) {
  db.exec('rollback');
  throw error;
}
