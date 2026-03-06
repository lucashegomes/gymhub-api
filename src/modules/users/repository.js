const { getPool } = require('../../config/database');

class UsersRepository {
  constructor() {
    this.pool = getPool();
  }

  async countAll(search) {
    const values = [];
    let where = '';

    if (search) {
      values.push(`%${search}%`);
      where = 'where name ilike $1 or email ilike $1 or cpf ilike $1';
    }

    const result = await this.pool.query(`select count(*)::int as total from users ${where}`, values);
    return result.rows[0]?.total || 0;
  }

  async list({ page, pageSize, search }) {
    const values = [];
    let where = '';

    if (search) {
      values.push(`%${search}%`);
      where = 'where u.name ilike $1 or u.email ilike $1 or u.cpf ilike $1';
    }

    values.push(pageSize);
    const limitPos = values.length;
    values.push((page - 1) * pageSize);
    const offsetPos = values.length;

    const sql = `
      select u.id, u.name, u.email, u.cpf, u.photo_url, u.role_id, r.name as role_name, u.status, u.last_login, u.created_at, u.updated_at
      from users u
      join roles r on r.id = u.role_id
      ${where}
      order by u.created_at desc
      limit $${limitPos} offset $${offsetPos}
    `;

    const result = await this.pool.query(sql, values);
    return result.rows;
  }

  async findById(id) {
    const result = await this.pool.query(
      `select id, name, email, cpf, password_hash, photo_url, role_id, status, last_login, created_at, updated_at
       from users where id=$1`,
      [id],
    );
    return result.rows[0] || null;
  }

  async findByIdentifier({ email, cpf }) {
    let result;

    if (email) {
      result = await this.pool.query(
        `select id, name, email, cpf, password_hash, photo_url, role_id, status, last_login, created_at, updated_at
         from users where email=$1`,
        [email],
      );
    } else {
      result = await this.pool.query(
        `select id, name, email, cpf, password_hash, photo_url, role_id, status, last_login, created_at, updated_at
         from users where cpf=$1`,
        [cpf],
      );
    }

    return result.rows[0] || null;
  }

  async create(payload) {
    const sql = `
      insert into users (name, email, cpf, password_hash, photo_url, role_id, status)
      values ($1,$2,$3,$4,$5,$6,$7)
      returning id, name, email, cpf, photo_url, role_id, status, last_login, created_at, updated_at
    `;

    const values = [
      payload.name,
      payload.email,
      payload.cpf,
      payload.passwordHash,
      payload.photoUrl || null,
      payload.roleId,
      payload.status,
    ];

    const result = await this.pool.query(sql, values);
    return result.rows[0];
  }

  async update(id, payload) {
    const fields = [];
    const values = [];

    const mapping = {
      name: 'name',
      email: 'email',
      cpf: 'cpf',
      passwordHash: 'password_hash',
      photoUrl: 'photo_url',
      roleId: 'role_id',
      status: 'status',
    };

    Object.entries(mapping).forEach(([key, column]) => {
      if (payload[key] !== undefined) {
        values.push(payload[key]);
        fields.push(`${column} = $${values.length}`);
      }
    });

    if (!fields.length) {
      return this.findById(id);
    }

    values.push(id);

    const result = await this.pool.query(
      `update users set ${fields.join(', ')} where id = $${values.length}
       returning id, name, email, cpf, photo_url, role_id, status, last_login, created_at, updated_at`,
      values,
    );

    return result.rows[0] || null;
  }

  async updateLastLogin(id) {
    await this.pool.query('update users set last_login = now() where id = $1', [id]);
  }

  async delete(id) {
    const result = await this.pool.query('delete from users where id = $1 returning id', [id]);
    return Boolean(result.rows[0]);
  }

  async setPhoto(id, photoUrl) {
    const result = await this.pool.query(
      `update users set photo_url=$1 where id=$2
       returning id, name, email, cpf, photo_url, role_id, status, last_login, created_at, updated_at`,
      [photoUrl, id],
    );
    return result.rows[0] || null;
  }

  async getUserPermissions(userId) {
    const result = await this.pool.query(
      `
      select p.id, p.resource, p.action, p.screen
      from users u
      join role_permissions rp on rp.role_id = u.role_id
      join permissions p on p.id = rp.permission_id
      where u.id = $1
      order by p.resource, p.action, p.screen
      `,
      [userId],
    );
    return result.rows;
  }

  async getUserFeatureFlags(userId) {
    const result = await this.pool.query(
      `
      select distinct ff.key
      from users u
      left join role_feature_flags rff on rff.role_id = u.role_id
      left join feature_flags ff on ff.id = rff.feature_flag_id
      where u.id = $1 and ff.enabled = true
      order by ff.key
      `,
      [userId],
    );

    return result.rows.map((row) => row.key).filter(Boolean);
  }

  async countUsers() {
    const result = await this.pool.query('select count(*)::int as total from users');
    return result.rows[0]?.total || 0;
  }
}

module.exports = UsersRepository;
