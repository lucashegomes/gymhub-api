const BaseEntityService = require('./baseEntityService');

class ClassesService extends BaseEntityService {
  constructor() {
    super({
      tableName: 'classes',
      singularName: 'aula',
      fieldMap: {
        id: 'id',
        courseId: 'course_id',
        teacherId: 'teacher_id',
        date: 'date',
        time: 'time',
        capacity: 'capacity',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
      searchableFields: ['courseId', 'teacherId', 'date', 'time'],
    });
  }
}

module.exports = ClassesService;
