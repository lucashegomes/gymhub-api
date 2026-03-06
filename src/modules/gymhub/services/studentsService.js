const BaseEntityService = require('./baseEntityService');

class StudentsService extends BaseEntityService {
  constructor() {
    super({
      tableName: 'students',
      singularName: 'aluno',
      fieldMap: {
        id: 'id',
        name: 'name',
        cpf: 'cpf',
        email: 'email',
        phone: 'phone',
        birthDate: 'birth_date',
        planType: 'plan_type',
        status: 'status',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
      searchableFields: ['name', 'cpf', 'email', 'phone', 'planType', 'status'],
    });
  }
}

module.exports = StudentsService;
