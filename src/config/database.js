const dns = require('node:dns');
const { Pool } = require('pg');
const env = require('./env');

let pool;

function getPool() {
  if (!env.database.isConfigured) {
    throw new Error('Database variables are not fully configured in .env');
  }

  if (!pool) {
    pool = new Pool({
      host: env.database.host,
      port: env.database.port,
      database: env.database.name,
      user: env.database.user,
      password: env.database.password,
      lookup: env.database.forceIPv4
        ? (hostname, options, callback) => dns.lookup(hostname, { ...options, family: 4 }, callback)
        : undefined,
      ssl: env.database.sslEnabled
        ? { rejectUnauthorized: env.database.sslRejectUnauthorized }
        : false,
    });
  }

  return pool;
}

async function testDatabaseConnection() {
  const dbPool = getPool();
  const client = await dbPool.connect();

  try {
    const { rows } = await client.query(
      'select now() as server_time, current_database() as database_name, version() as postgres_version',
    );

    return rows[0];
  } finally {
    client.release();
  }
}

async function closeDatabase() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

module.exports = {
  getPool,
  testDatabaseConnection,
  closeDatabase,
};
