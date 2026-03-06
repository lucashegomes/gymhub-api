const AppError = require('../../lib/appError');
const MenusRepository = require('./repository');

class MenusService {
  constructor() {
    this.repository = new MenusRepository();
  }

  async listForUser(auth) {
    const permissions = auth?.permissions || [];
    const data = await this.repository.list();

    const filtered = data.filter((menu) =>
      permissions.some((permission) => permission.resource === menu.resource && permission.action === menu.action),
    );

    return { data: filtered, total: filtered.length, page: 1, pageSize: filtered.length || 1, totalPages: 1 };
  }

  async listAll() {
    const data = await this.repository.listAll();
    return { data, total: data.length, page: 1, pageSize: data.length || 1, totalPages: 1 };
  }

  async create(payload) {
    const data = await this.repository.create(payload);
    return { data, success: true, message: 'Created' };
  }

  async update(id, payload) {
    const data = await this.repository.update(id, payload);
    if (!data) throw new AppError('menu nao encontrado', 404);
    return { data, success: true, message: 'Updated' };
  }

  async delete(id) {
    const removed = await this.repository.delete(id);
    if (!removed) throw new AppError('menu nao encontrado', 404);
    return { data: null, success: true, message: 'Deleted' };
  }
}

module.exports = new MenusService();
