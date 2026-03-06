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

async function run() {
  const pool = getPool();
  await ensureMigrationsTable(pool);

  const { rows } = await pool.query('select name, checksum, applied_at from schema_migrations order by name');
  const appliedMap = new Map(rows.map((row) => [row.name, row]));
  const files = await listMigrationFiles();

  if (files.length === 0) {
    console.log('No migration files found.');
    return;
  }

  for (const fileName of files) {
    const file = await readMigration(fileName);
    const applied = appliedMap.get(fileName);

    if (!applied) {
      console.log(`[PENDING] ${fileName}`);
      continue;
    }

    const checksumOk = applied.checksum === file.checksum;
    const status = checksumOk ? 'APPLIED' : 'DRIFT';
    console.log(`[${status}] ${fileName} at ${applied.applied_at.toISOString()}`);
  }
}

run()
  .catch((error) => {
    console.error(`Status check failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDatabase();
  });
