const { getPool } = require('../../config/database');

class MenusRepository {
  constructor() {
    this.pool = getPool();
  }

  async list() {
    const result = await this.pool.query('select * from menus where enabled=true order by sort_order, label');
    return result.rows;
  }

  async listAll() {
    const result = await this.pool.query('select * from menus order by sort_order, label');
    return result.rows;
  }

  async create(payload) {
    const result = await this.pool.query(
      'insert into menus (key, label, path, screen, resource, action, icon, sort_order, enabled) values ($1,$2,$3,$4,$5,$6,$7,$8,$9) returning *',
      [
        payload.key,
        payload.label,
        payload.path,
        payload.screen,
        payload.resource,
        payload.action,
        payload.icon || null,
        Number(payload.sortOrder || 0),
        payload.enabled !== false,
      ],
    );
    return result.rows[0];
  }

  async update(id, payload) {
    const result = await this.pool.query(
      'update menus set key=$1,label=$2,path=$3,screen=$4,resource=$5,action=$6,icon=$7,sort_order=$8,enabled=$9 where id=$10 returning *',
      [
        payload.key,
        payload.label,
        payload.path,
        payload.screen,
        payload.resource,
        payload.action,
        payload.icon || null,
        Number(payload.sortOrder || 0),
        payload.enabled !== false,
        id,
      ],
    );
    return result.rows[0] || null;
  }

  async delete(id) {
    const result = await this.pool.query('delete from menus where id=$1 returning id', [id]);
    return Boolean(result.rows[0]);
  }
}

module.exports = MenusRepository;
