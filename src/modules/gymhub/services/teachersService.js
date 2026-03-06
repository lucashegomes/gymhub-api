const BaseEntityService = require('./baseEntityService');

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
}

module.exports = TeachersService;
