const LogsRepository = require('./repository');

class LogsService {
  constructor() {
    this.repository = new LogsRepository();
  }

  async log(entry) {
    return this.repository.create(entry);
  }

  async list(query) {
    const page = Number(query.page || 1);
    const pageSize = Number(query.pageSize || 20);
    const search = String(query.search || '').trim();

    const result = await this.repository.list({ page, pageSize, search });

    return {
      data: result.rows,
      total: result.total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(result.total / pageSize)),
    };
  }
}

module.exports = new LogsService();
