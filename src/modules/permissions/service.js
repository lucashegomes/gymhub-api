const AppError = require('../../lib/appError');
const PermissionsRepository = require('./repository');

class PermissionsService {
  constructor() {
    this.repository = new PermissionsRepository();
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
    if (!data) throw new AppError('permissao nao encontrada', 404);
    return { data, success: true, message: 'Updated' };
  }

  async delete(id) {
    const removed = await this.repository.delete(id);
    if (!removed) throw new AppError('permissao nao encontrada', 404);
    return { data: null, success: true, message: 'Deleted' };
  }
}

module.exports = new PermissionsService();
