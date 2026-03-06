const BaseEntityService = require('./baseEntityService');

class PlansService extends BaseEntityService {
  constructor() {
    super({
      tableName: 'plans',
      singularName: 'plano',
      fieldMap: {
        id: 'id',
        name: 'name',
        price: 'price',
        periodicity: 'periodicity',
        monthlyCheckinLimit: 'monthly_checkin_limit',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
      searchableFields: ['name', 'periodicity'],
      numericFields: ['price', 'monthlyCheckinLimit'],
    });
  }
}

module.exports = PlansService;

