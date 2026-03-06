const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');

const migrationsDir = path.resolve(__dirname, '../db/migrations');

async function listMigrationFiles() {
  const entries = await fs.readdir(migrationsDir, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.sql'))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));
}

async function readMigration(fileName) {
  const filePath = path.join(migrationsDir, fileName);
  const sql = await fs.readFile(filePath, 'utf8');
  const checksum = crypto.createHash('sha256').update(sql).digest('hex');

  return {
    fileName,
    sql,
    checksum,
  };
}

module.exports = {
  listMigrationFiles,
  readMigration,
};
