const BaseEntityService = require('./baseEntityService');

class CheckinsService extends BaseEntityService {
  constructor() {
    super({
      tableName: 'checkins',
      singularName: 'checkin',
      fieldMap: {
        id: 'id',
        studentId: 'student_id',
        classId: 'class_id',
        checkinTime: 'checkin_time',
        source: 'source',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
      searchableFields: ['studentId', 'classId', 'source'],
    });
  }
}

module.exports = CheckinsService;
