const { getPool } = require('../../config/database');

class RolesRepository {
  constructor() {
    this.pool = getPool();
  }

  async list() {
    const result = await this.pool.query('select * from roles order by name');
    return result.rows;
  }

  async create(payload) {
    const result = await this.pool.query(
      'insert into roles (name, description) values ($1, $2) returning *',
      [payload.name, payload.description || null],
    );
    return result.rows[0];
  }

  async update(id, payload) {
    const result = await this.pool.query(
      'update roles set name=$1, description=$2 where id=$3 returning *',
      [payload.name, payload.description || null, id],
    );
    return result.rows[0] || null;
  }

  async delete(id) {
    const result = await this.pool.query('delete from roles where id=$1 returning id', [id]);
    return Boolean(result.rows[0]);
  }

  async setPermissions(roleId, permissionIds) {
    const client = await this.pool.connect();
    try {
      await client.query('begin');
      await client.query('delete from role_permissions where role_id=$1', [roleId]);
      for (const permissionId of permissionIds) {
        await client.query('insert into role_permissions(role_id, permission_id) values ($1, $2)', [
          roleId,
          permissionId,
        ]);
      }
      await client.query('commit');
    } catch (error) {
      await client.query('rollback');
      throw error;
    } finally {
      client.release();
    }
  }

  async setFeatureFlags(roleId, featureFlagIds) {
    const client = await this.pool.connect();
    try {
      await client.query('begin');
      await client.query('delete from role_feature_flags where role_id=$1', [roleId]);
      for (const featureFlagId of featureFlagIds) {
        await client.query('insert into role_feature_flags(role_id, feature_flag_id) values ($1, $2)', [
          roleId,
          featureFlagId,
        ]);
      }
      await client.query('commit');
    } catch (error) {
      await client.query('rollback');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = RolesRepository;
