const BaseEntityService = require('./baseEntityService');
const AppError = require('../../../lib/appError');

function normalizeSchedules(schedules) {
  if (!Array.isArray(schedules)) return null;
  return schedules
    .map((item) => ({
      weekday: Number(item?.weekday),
      startTime: item?.startTime,
      endTime: item?.endTime,
    }))
    .filter((item) => Number.isInteger(item.weekday) && item.startTime && item.endTime);
}

class ClassesService extends BaseEntityService {
  constructor() {
    super({
      tableName: 'classes',
      singularName: 'aula',
      fieldMap: {
        id: 'id',
        name: 'name',
        courseId: 'course_id',
        teacherId: 'teacher_id',
        date: 'date',
        time: 'time',
        capacity: 'capacity',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
      searchableFields: ['name', 'courseId', 'teacherId', 'date', 'time'],
    });
  }

  async list(query) {
    const base = await super.list(query);
    if (!base.data.length) return base;
    const classIds = base.data.map((item) => item.id);
    const schedules = await this.pool.query(
      `
        select class_id, weekday, start_time, end_time
        from class_schedules
        where class_id = any($1::uuid[])
        order by weekday, start_time
      `,
      [classIds],
    );

    const grouped = new Map();
    for (const row of schedules.rows) {
      const current = grouped.get(row.class_id) || [];
      current.push({
        weekday: row.weekday,
        startTime: row.start_time,
        endTime: row.end_time,
      });
      grouped.set(row.class_id, current);
    }

    return {
      ...base,
      data: base.data.map((item) => ({
        ...item,
        schedules: grouped.get(item.id) || [],
      })),
    };
  }

  async getById(id) {
    const [base, schedules] = await Promise.all([
      super.getById(id),
      this.pool.query(
        `
          select id, weekday, start_time, end_time, created_at
          from class_schedules
          where class_id = $1
          order by weekday, start_time
        `,
        [id],
      ),
    ]);

    return {
      ...base,
      data: {
        ...base.data,
        schedules: schedules.rows.map((row) => ({
          id: row.id,
          weekday: row.weekday,
          startTime: row.start_time,
          endTime: row.end_time,
          createdAt: row.created_at,
        })),
      },
    };
  }

  async create(payload) {
    if (!payload?.name) {
      throw new AppError('name obrigatorio', 400);
    }

    const schedules = normalizeSchedules(payload.schedules);
    const client = await this.pool.connect();
    try {
      await client.query('begin');
      const dbPayload = this.toDbPayload(payload);
      const columns = Object.keys(dbPayload);
      const values = Object.values(dbPayload);
      const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
      const insertResult = await client.query(
        `
          insert into classes (${columns.join(', ')})
          values (${placeholders})
          returning id
        `,
        values,
      );
      const classId = insertResult.rows[0].id;

      if (schedules) {
        await this.replaceSchedules(client, classId, schedules);
      }

      await client.query('commit');
      return this.getById(classId);
    } catch (error) {
      await client.query('rollback');
      this.handleDatabaseError(error);
    } finally {
      client.release();
    }
  }

  async update(id, payload) {
    const schedules = normalizeSchedules(payload.schedules);
    const client = await this.pool.connect();
    try {
      await client.query('begin');
      const dbPayload = this.toDbPayload(payload);
      const entries = Object.entries(dbPayload);
      if (entries.length) {
        const setSql = entries.map(([column], index) => `${column} = $${index + 1}`).join(', ');
        const values = entries.map(([, value]) => value);
        values.push(id);
        const result = await client.query(
          `update classes set ${setSql} where id = $${values.length} returning id`,
          values,
        );
        if (!result.rows[0]) {
          throw new AppError('aula nao encontrada', 404);
        }
      }

      if (schedules) {
        await this.replaceSchedules(client, id, schedules);
      }

      await client.query('commit');
      return this.getById(id);
    } catch (error) {
      await client.query('rollback');
      this.handleDatabaseError(error);
    } finally {
      client.release();
    }
  }

  async replaceSchedules(client, classId, schedules) {
    await client.query('delete from class_schedules where class_id = $1', [classId]);
    for (const schedule of schedules) {
      await client.query(
        `
          insert into class_schedules (class_id, weekday, start_time, end_time)
          values ($1, $2, $3, $4)
        `,
        [classId, schedule.weekday, schedule.startTime, schedule.endTime],
      );
    }
  }
}

module.exports = ClassesService;
