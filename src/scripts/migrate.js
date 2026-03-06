const { getPool, closeDatabase } = require('../config/database');
const { listMigrationFiles, readMigration } = require('./migrationUtils');

async function ensureMigrationsTable(pool) {
  await pool.query(`
    create table if not exists schema_migrations (
      name text primary key,
      checksum text not null,
      applied_at timestamptz not null default now()
    )
  `);
}

async function getAppliedMigrations(pool) {
  const { rows } = await pool.query('select name, checksum from schema_migrations');
  return new Map(rows.map((row) => [row.name, row.checksum]));
}

async function applyMigration(pool, migration) {
  const client = await pool.connect();

  try {
    await client.query('begin');
    await client.query(migration.sql);
    await client.query('insert into schema_migrations(name, checksum) values ($1, $2)', [
      migration.fileName,
      migration.checksum,
    ]);
    await client.query('commit');
    console.log(`Applied: ${migration.fileName}`);
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    client.release();
  }
}

async function run() {
  const pool = getPool();
  await ensureMigrationsTable(pool);

  const applied = await getAppliedMigrations(pool);
  const files = await listMigrationFiles();

  let appliedCount = 0;

  for (const fileName of files) {
    const migration = await readMigration(fileName);
    const existingChecksum = applied.get(fileName);

    if (existingChecksum && existingChecksum !== migration.checksum) {
      throw new Error(
        `Migration checksum mismatch for ${fileName}. Create a new migration instead of editing applied files.`,
      );
    }

    if (existingChecksum) {
      continue;
    }

    await applyMigration(pool, migration);
    appliedCount += 1;
  }

  if (appliedCount === 0) {
    console.log('No pending migrations.');
  } else {
    console.log(`Done. ${appliedCount} migration(s) applied.`);
  }
}

run()
  .catch((error) => {
    console.error(`Migration failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDatabase();
  });
