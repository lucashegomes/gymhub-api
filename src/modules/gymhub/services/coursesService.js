const BaseEntityService = require('./baseEntityService');

class CoursesService extends BaseEntityService {
  constructor() {
    super({
      tableName: 'courses',
      singularName: 'curso',
      fieldMap: {
        id: 'id',
        name: 'name',
        teacherId: 'teacher_id',
        capacity: 'capacity',
        description: 'description',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
      searchableFields: ['name', 'description', 'teacherId'],
    });
  }
}

module.exports = CoursesService;
