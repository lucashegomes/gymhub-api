const { getPool } = require('../../config/database');

class PermissionsRepository {
  constructor() {
    this.pool = getPool();
  }

  async list() {
    const result = await this.pool.query('select * from permissions order by resource, action, screen');
    return result.rows;
  }

  async create(payload) {
    const result = await this.pool.query(
      'insert into permissions (resource, action, screen) values ($1, $2, $3) returning *',
      [payload.resource, payload.action, payload.screen],
    );
    return result.rows[0];
  }

  async update(id, payload) {
    const result = await this.pool.query(
      'update permissions set resource=$1, action=$2, screen=$3 where id=$4 returning *',
      [payload.resource, payload.action, payload.screen, id],
    );
    return result.rows[0] || null;
  }

  async delete(id) {
    const result = await this.pool.query('delete from permissions where id=$1 returning id', [id]);
    return Boolean(result.rows[0]);
  }
}

module.exports = PermissionsRepository;
