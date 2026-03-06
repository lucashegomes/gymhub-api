const BaseEntityService = require('./baseEntityService');
const AppError = require('../../../lib/appError');

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

  async list(query) {
    const base = await super.list(query);
    if (!base.data.length) return base;

    const courseIds = base.data.map((item) => item.id);
    const relationResult = await this.pool.query(
      `
        select ct.course_id, ct.teacher_id, t.name as teacher_name
        from course_teachers ct
        join teachers t on t.id = ct.teacher_id
        where ct.course_id = any($1::uuid[])
        order by t.name
      `,
      [courseIds],
    );

    const grouped = new Map();
    for (const row of relationResult.rows) {
      const current = grouped.get(row.course_id) || [];
      current.push({ teacherId: row.teacher_id, teacherName: row.teacher_name });
      grouped.set(row.course_id, current);
    }

    return {
      ...base,
      data: base.data.map((item) => ({
        ...item,
        teacherIds: (grouped.get(item.id) || []).map((value) => value.teacherId),
        teachers: grouped.get(item.id) || [],
      })),
    };
  }

  async getById(id) {
    const [courseData, teachersData] = await Promise.all([
      super.getById(id),
      this.pool.query(
        `
          select ct.teacher_id, t.name as teacher_name
          from course_teachers ct
          join teachers t on t.id = ct.teacher_id
          where ct.course_id = $1
          order by t.name
        `,
        [id],
      ),
    ]);

    return {
      ...courseData,
      data: {
        ...courseData.data,
        teacherIds: teachersData.rows.map((row) => row.teacher_id),
        teachers: teachersData.rows.map((row) => ({
          teacherId: row.teacher_id,
          teacherName: row.teacher_name,
        })),
      },
    };
  }

  async create(payload) {
    const teacherIds = Array.isArray(payload?.teacherIds)
      ? [...new Set(payload.teacherIds.filter(Boolean))]
      : payload?.teacherId
        ? [payload.teacherId]
        : [];

    if (!teacherIds.length) {
      throw new AppError('teacherIds obrigatorio', 400);
    }

    const client = await this.pool.connect();
    try {
      await client.query('begin');

      const insertPayload = this.toDbPayload({
        ...payload,
        teacherId: teacherIds[0],
      });

      const columns = Object.keys(insertPayload);
      const values = Object.values(insertPayload);
      const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');

      const inserted = await client.query(
        `
          insert into courses (${columns.join(', ')})
          values (${placeholders})
          returning id
        `,
        values,
      );

      const courseId = inserted.rows[0].id;
      await this.replaceTeachers(client, courseId, teacherIds);
      await client.query('commit');
      return this.getById(courseId);
    } catch (error) {
      await client.query('rollback');
      this.handleDatabaseError(error);
    } finally {
      client.release();
    }
  }

  async update(id, payload) {
    const teacherIds = Array.isArray(payload?.teacherIds)
      ? [...new Set(payload.teacherIds.filter(Boolean))]
      : payload?.teacherId
        ? [payload.teacherId]
        : null;

    const client = await this.pool.connect();
    try {
      await client.query('begin');
      const dbPayload = this.toDbPayload({
        ...payload,
        teacherId: teacherIds?.[0] ?? payload?.teacherId,
      });
      const entries = Object.entries(dbPayload);

      if (entries.length) {
        const setSql = entries.map(([column], index) => `${column} = $${index + 1}`).join(', ');
        const values = entries.map(([, value]) => value);
        values.push(id);
        const updateResult = await client.query(
          `
            update courses
            set ${setSql}
            where id = $${values.length}
            returning id
          `,
          values,
        );
        if (!updateResult.rows[0]) {
          throw new AppError('curso nao encontrado', 404);
        }
      }

      if (teacherIds) {
        if (!teacherIds.length) {
          throw new AppError('teacherIds obrigatorio', 400);
        }
        await this.replaceTeachers(client, id, teacherIds);
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

  async replaceTeachers(client, courseId, teacherIds) {
    await client.query('delete from course_teachers where course_id = $1', [courseId]);
    for (const teacherId of teacherIds) {
      await client.query(
        'insert into course_teachers (course_id, teacher_id) values ($1, $2)',
        [courseId, teacherId],
      );
    }
  }
}

module.exports = CoursesService;
