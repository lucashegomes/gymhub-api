const AppError = require('../../lib/appError');
const RolesRepository = require('./repository');

class RolesService {
  constructor() {
    this.repository = new RolesRepository();
  }

  async list() {
    const data = await this.repository.list();
    return { data, total: data.length, page: 1, pageSize: data.length || 1, totalPages: 1 };
  }

  async create(payload) {
    const data = await this.repository.create(payload);
    return { data, success: true, message: 'Created' };
  }

  async update(id, payload) {
    const data = await this.repository.update(id, payload);
    if (!data) throw new AppError('perfil nao encontrado', 404);
    return { data, success: true, message: 'Updated' };
  }

  async delete(id) {
    const removed = await this.repository.delete(id);
    if (!removed) throw new AppError('perfil nao encontrado', 404);
    return { data: null, success: true, message: 'Deleted' };
  }

  async setPermissions(id, permissionIds) {
    await this.repository.setPermissions(id, permissionIds || []);
    return { data: null, success: true, message: 'Updated' };
  }

  async setFeatureFlags(id, featureFlagIds) {
    await this.repository.setFeatureFlags(id, featureFlagIds || []);
    return { data: null, success: true, message: 'Updated' };
  }
}

module.exports = new RolesService();
