const env = require('../config/env');
const { testDatabaseConnection, closeDatabase } = require('../config/database');

function getMissingVars() {
  const required = ['DATABASE_HOST', 'DATABASE_PORT', 'DATABASE_NAME', 'DATABASE_USER'];
  return required.filter((name) => !process.env[name]);
}

async function run() {
  if (!env.database.isConfigured) {
    const missing = getMissingVars();
    throw new Error(`Database not configured. Missing variables: ${missing.join(', ')}`);
  }

  const result = await testDatabaseConnection();

  console.log('Database connection: OK');
  console.log(`database: ${result.database_name}`);
  console.log(`server_time: ${result.server_time}`);
}

run()
  .catch((error) => {
    console.error(`Database connection: ERROR - ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDatabase();
  });
