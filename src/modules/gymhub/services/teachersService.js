const BaseEntityService = require('./baseEntityService');
const { validateAndNormalizeCpf } = require('../validators/cpfValidator');

class TeachersService extends BaseEntityService {
  constructor() {
    super({
      tableName: 'teachers',
      singularName: 'professor',
      fieldMap: {
        id: 'id',
        name: 'name',
        cpf: 'cpf',
        email: 'email',
        phone: 'phone',
        specialty: 'specialty',
        pricePerClass: 'price_per_class',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
      searchableFields: ['name', 'cpf', 'email', 'phone', 'specialty'],
      numericFields: ['pricePerClass'],
    });
  }

  async create(payload) {
    return super.create({
      ...payload,
      cpf: validateAndNormalizeCpf(payload.cpf),
    });
  }

  async update(id, payload) {
    if (payload?.cpf !== undefined) {
      return super.update(id, {
        ...payload,
        cpf: validateAndNormalizeCpf(payload.cpf),
      });
    }

    return super.update(id, payload);
  }
}

module.exports = TeachersService;
