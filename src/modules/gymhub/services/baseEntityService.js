const AppError = require('../../../lib/appError');
const { getPool } = require('../../../config/database');

class BaseEntityService {
  constructor({ tableName, singularName, fieldMap, searchableFields = [], numericFields = [] }) {
    this.pool = getPool();
    this.tableName = tableName;
    this.singularName = singularName;
    this.fieldMap = fieldMap;
    this.reverseFieldMap = Object.fromEntries(
      Object.entries(fieldMap).map(([apiField, dbField]) => [dbField, apiField]),
    );
    this.searchableFields = searchableFields;
    this.numericFields = new Set(numericFields);
  }

  async list({ page, pageSize, search, sortBy, sortOrder }) {
    const values = [];
    let whereClause = '';

    if (search) {
      const conditions = this.searchableFields.map((field) => {
        const dbField = this.fieldMap[field];
        values.push(`%${search}%`);
        return `${dbField}::text ilike $${values.length}`;
      });
      whereClause = ` where (${conditions.join(' or ')})`;
    }

    const sortDbField = this.fieldMap[sortBy] || this.fieldMap.createdAt || 'id';
    const safeSortOrder = sortOrder === 'desc' ? 'desc' : 'asc';

    values.push(pageSize);
    const limitPos = values.length;
    values.push((page - 1) * pageSize);
    const offsetPos = values.length;

    const listSql = `
      select *
      from ${this.tableName}
      ${whereClause}
      order by ${sortDbField} ${safeSortOrder}
      limit $${limitPos} offset $${offsetPos}
    `;

    const countSql = `
      select count(*)::int as total
      from ${this.tableName}
      ${whereClause}
    `;

    const [listResult, countResult] = await Promise.all([
      this.pool.query(listSql, values),
      this.pool.query(countSql, values.slice(0, values.length - 2)),
    ]);

    const total = countResult.rows[0]?.total || 0;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return {
      data: listResult.rows.map((row) => this.toApiEntity(row)),
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  async getById(id) {
    const result = await this.pool.query(`select * from ${this.tableName} where id = $1`, [id]);
    const row = result.rows[0];

    if (!row) {
      throw new AppError(`${this.singularName} nao encontrado`, 404);
    }

    return {
      data: this.toApiEntity(row),
      success: true,
    };
  }

  async create(payload) {
    const dbPayload = this.toDbPayload(payload);

    const columns = Object.keys(dbPayload);
    const values = Object.values(dbPayload);

    if (columns.length === 0) {
      throw new AppError('Payload invalido para criacao', 400);
    }

    const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');

    const sql = `
      insert into ${this.tableName} (${columns.join(', ')})
      values (${placeholders})
      returning *
    `;

    try {
      const result = await this.pool.query(sql, values);
      return {
        data: this.toApiEntity(result.rows[0]),
        success: true,
        message: 'Created',
      };
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async update(id, payload) {
    const dbPayload = this.toDbPayload(payload);
    const entries = Object.entries(dbPayload);

    if (entries.length === 0) {
      const existing = await this.getById(id);
      return {
        data: existing.data,
        success: true,
        message: 'Updated',
      };
    }

    const setClause = entries.map(([column], index) => `${column} = $${index + 1}`).join(', ');
    const values = entries.map(([, value]) => value);
    values.push(id);

    const sql = `
      update ${this.tableName}
      set ${setClause}
      where id = $${values.length}
      returning *
    `;

    try {
      const result = await this.pool.query(sql, values);
      const row = result.rows[0];

      if (!row) {
        throw new AppError(`${this.singularName} nao encontrado`, 404);
      }

      return {
        data: this.toApiEntity(row),
        success: true,
        message: 'Updated',
      };
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async delete(id) {
    try {
      const result = await this.pool.query(`delete from ${this.tableName} where id = $1 returning id`, [id]);

      if (!result.rows[0]) {
        throw new AppError(`${this.singularName} nao encontrado`, 404);
      }

      return {
        data: null,
        success: true,
        message: 'Deleted',
      };
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  toApiEntity(dbRow) {
    const apiEntity = {};

    Object.entries(dbRow).forEach(([dbField, value]) => {
      const apiField = this.reverseFieldMap[dbField] || dbField;
      let normalized = value instanceof Date ? value.toISOString() : value;

      if (this.numericFields.has(apiField) && typeof normalized === 'string') {
        const parsed = Number(normalized);
        normalized = Number.isNaN(parsed) ? normalized : parsed;
      }

      apiEntity[apiField] = normalized;
    });

    return apiEntity;
  }

  toDbPayload(apiPayload) {
    const dbPayload = {};

    Object.entries(apiPayload || {}).forEach(([apiField, value]) => {
      if (value === undefined || apiField === 'id' || apiField === 'createdAt' || apiField === 'updatedAt') {
        return;
      }

      const dbField = this.fieldMap[apiField];
      if (!dbField) {
        return;
      }

      dbPayload[dbField] = value;
    });

    return dbPayload;
  }

  handleDatabaseError(error) {
    if (error instanceof AppError) {
      throw error;
    }

    if (error.code === '23505') {
      if (error.constraint === 'uq_checkins_student_class') {
        throw new AppError('Check-in duplicado nao permitido para a mesma aula', 400);
      }

      throw new AppError('Registro duplicado para campo unico', 409);
    }

    if (error.code === '23503') {
      const byConstraint = {
        courses_teacher_id_fkey: 'teacherId invalido: professor nao encontrado',
        classes_teacher_id_fkey: 'teacherId invalido: professor nao encontrado',
        classes_course_id_fkey: 'courseId invalido: curso nao encontrado',
        checkins_student_id_fkey: 'studentId invalido: aluno nao encontrado',
        checkins_class_id_fkey: 'classId invalido: aula nao encontrada',
      };

      const customMessage = byConstraint[error.constraint];
      if (customMessage) {
        throw new AppError(customMessage, 400);
      }

      throw new AppError('Nao e possivel excluir registro com dependencias vinculadas', 409);
    }

    if (error.code === '23514' || error.code === '22P02' || error.code === 'P0001') {
      throw new AppError(error.message, 400);
    }

    throw error;
  }
}

module.exports = BaseEntityService;
