const { getPool } = require('../../config/database');

class FeatureFlagsRepository {
  constructor() {
    this.pool = getPool();
  }

  async list() {
    const result = await this.pool.query('select * from feature_flags order by key');
    return result.rows;
  }

  async create(payload) {
    const result = await this.pool.query(
      'insert into feature_flags (key, enabled, description) values ($1, $2, $3) returning *',
      [payload.key, Boolean(payload.enabled), payload.description || null],
    );
    return result.rows[0];
  }

  async update(id, payload) {
    const result = await this.pool.query(
      'update feature_flags set key=$1, enabled=$2, description=$3 where id=$4 returning *',
      [payload.key, Boolean(payload.enabled), payload.description || null, id],
    );
    return result.rows[0] || null;
  }

  async delete(id) {
    const result = await this.pool.query('delete from feature_flags where id=$1 returning id', [id]);
    return Boolean(result.rows[0]);
  }
}

module.exports = FeatureFlagsRepository;
