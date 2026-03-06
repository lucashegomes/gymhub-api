const { getPool, closeDatabase } = require('../config/database');
const { hashPassword } = require('../utils/password');

async function run() {
  const pool = getPool();
  const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'Admin@123';

  const roleRes = await pool.query(`select id from roles where name='admin' limit 1`);
  const adminRole = roleRes.rows[0];
  if (!adminRole) {
    throw new Error('Role admin nao encontrada. Rode as migrations primeiro.');
  }

  const userCount = await pool.query('select count(*)::int as total from users');
  if (userCount.rows[0].total > 0) {
    console.log('Users already exist. Bootstrap skipped.');
    return;
  }

  const passwordHash = await hashPassword(defaultPassword);

  await pool.query(
    `insert into users (name, email, cpf, password_hash, role_id, status)
     values ($1,$2,$3,$4,$5,'active')`,
    ['Administrador', 'admin@gymhub.local', '00000000000', passwordHash, adminRole.id],
  );

  console.log('Default admin created: admin@gymhub.local /', defaultPassword);
}

run()
  .catch((error) => {
    console.error(`Bootstrap auth failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDatabase();
  });
