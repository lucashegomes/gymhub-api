const BaseEntityService = require('./baseEntityService');
const AppError = require('../../../lib/appError');

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

  async list(query) {
    const page = Number(query.page || 1);
    const pageSize = Number(query.pageSize || 10);
    const sortBy = query.sortBy === 'checkinTime' ? 'c.checkin_time' : 'c.checkin_time';
    const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';
    const values = [];
    const where = [];

    if (query.studentId) {
      values.push(query.studentId);
      where.push(`c.student_id = $${values.length}`);
    }
    if (query.classId) {
      values.push(query.classId);
      where.push(`c.class_id = $${values.length}`);
    }
    if (query.courseId) {
      values.push(query.courseId);
      where.push(`cl.course_id = $${values.length}`);
    }
    if (query.dateFrom) {
      values.push(query.dateFrom);
      where.push(`c.checkin_time::date >= $${values.length}::date`);
    }
    if (query.dateTo) {
      values.push(query.dateTo);
      where.push(`c.checkin_time::date <= $${values.length}::date`);
    }
    if (query.search) {
      values.push(`%${query.search}%`);
      where.push(`(s.name ilike $${values.length} or co.name ilike $${values.length} or cl.name ilike $${values.length})`);
    }

    const whereSql = where.length ? `where ${where.join(' and ')}` : '';
    values.push(pageSize);
    const limitPos = values.length;
    values.push((page - 1) * pageSize);
    const offsetPos = values.length;

    const sql = `
      select c.id, c.student_id, c.class_id, c.checkin_time, c.source, c.created_at, c.updated_at,
             s.name as student_name,
             co.id as course_id, co.name as course_name,
             cl.name as class_name, cl.date as class_date, cl.time as class_time
      from checkins c
      join students s on s.id = c.student_id
      join classes cl on cl.id = c.class_id
      join courses co on co.id = cl.course_id
      ${whereSql}
      order by ${sortBy} ${sortOrder}
      limit $${limitPos} offset $${offsetPos}
    `;

    const countSql = `
      select count(*)::int as total
      from checkins c
      join students s on s.id = c.student_id
      join classes cl on cl.id = c.class_id
      join courses co on co.id = cl.course_id
      ${whereSql}
    `;

    const [rows, count] = await Promise.all([
      this.pool.query(sql, values),
      this.pool.query(countSql, values.slice(0, values.length - 2)),
    ]);

    const total = count.rows[0]?.total || 0;
    return {
      data: rows.rows.map((row) => ({
        id: row.id,
        studentId: row.student_id,
        classId: row.class_id,
        courseId: row.course_id,
        checkinTime: row.checkin_time,
        source: row.source,
        studentName: row.student_name,
        courseName: row.course_name,
        className: row.class_name,
        classDate: row.class_date,
        classTime: row.class_time,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  async listByStudent(studentId, query) {
    return this.list({ ...query, studentId });
  }

  async create(payload) {
    await this.validateMonthlyLimit(payload.studentId, payload.checkinTime);
    return super.create(payload);
  }

  async validateMonthlyLimit(studentId, checkinTime) {
    const dateValue = checkinTime ? new Date(checkinTime) : new Date();
    if (Number.isNaN(dateValue.getTime())) {
      throw new AppError('checkinTime invalido', 400);
    }

    const activePlan = await this.pool.query(
      `
        select sp.id, p.monthly_checkin_limit
        from students_plans sp
        join plans p on p.id = sp.plan_id
        where sp.student_id = $1
          and sp.status = 'active'
          and sp.start_date <= $2::date
          and (sp.end_date is null or sp.end_date >= $2::date)
        order by sp.start_date desc
        limit 1
      `,
      [studentId, dateValue.toISOString()],
    );

    const plan = activePlan.rows[0];
    if (!plan) return;

    const count = await this.pool.query(
      `
        select count(*)::int as total
        from checkins
        where student_id = $1
          and date_trunc('month', checkin_time) = date_trunc('month', $2::timestamptz)
      `,
      [studentId, dateValue.toISOString()],
    );

    if ((count.rows[0]?.total || 0) >= plan.monthly_checkin_limit) {
      throw new AppError('Monthly check-in limit reached', 400);
    }
  }
}

module.exports = CheckinsService;
