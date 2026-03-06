const { getPool } = require('../../config/database');

class LogsRepository {
  constructor() {
    this.pool = getPool();
  }

  async create(entry) {
    const sql = `
      insert into logs (user_id, action, resource, entity_id, description, ip, user_agent)
      values ($1, $2, $3, $4, $5, $6, $7)
      returning *
    `;

    const values = [
      entry.userId || null,
      entry.action,
      entry.resource || null,
      entry.entityId || null,
      entry.description || null,
      entry.ip || null,
      entry.userAgent || null,
    ];

    const result = await this.pool.query(sql, values);
    return result.rows[0];
  }

  async list({ page, pageSize, search }) {
    const values = [];
    let where = '';

    if (search) {
      values.push(`%${search}%`);
      where = `where action ilike $1 or resource ilike $1 or description ilike $1`;
    }

    values.push(pageSize);
    const limitPos = values.length;
    values.push((page - 1) * pageSize);
    const offsetPos = values.length;

    const list = await this.pool.query(
      `select * from logs ${where} order by created_at desc limit $${limitPos} offset $${offsetPos}`,
      values,
    );
    const count = await this.pool.query(`select count(*)::int as total from logs ${where}`, values.slice(0, values.length - 2));

    return {
      rows: list.rows,
      total: count.rows[0]?.total || 0,
    };
  }
}

module.exports = LogsRepository;
