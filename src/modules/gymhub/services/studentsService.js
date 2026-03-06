const BaseEntityService = require('./baseEntityService');
const AppError = require('../../../lib/appError');
const { validateAndNormalizeCpf } = require('../validators/cpfValidator');

function calculateAge(value) {
  const birthDate = new Date(value);
  if (Number.isNaN(birthDate.getTime())) return null;

  const now = new Date();
  let age = now.getFullYear() - birthDate.getFullYear();
  const monthDiff = now.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age;
}

function parseGuardians(payload) {
  if (!payload) return [];

  if (Array.isArray(payload.guardians)) {
    return payload.guardians
      .map((item) => ({
        guardianStudentId: item?.guardianStudentId,
        relationship: item?.relationship || 'guardian',
      }))
      .filter((item) => item.guardianStudentId);
  }

  if (Array.isArray(payload.guardianStudentIds)) {
    return payload.guardianStudentIds
      .filter(Boolean)
      .map((guardianStudentId) => ({ guardianStudentId, relationship: 'guardian' }));
  }

  return [];
}

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
        integrationId: 'integration_id',
        status: 'status',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
      searchableFields: ['name', 'cpf', 'email', 'phone', 'planType', 'status', 'integrationId'],
    });
  }

  async list({ page, pageSize, search, sortBy, sortOrder }) {
    const values = [];
    let whereSql = '';

    if (search) {
      values.push(`%${search}%`);
      whereSql = `
        where (
          s.name ilike $1
          or s.cpf ilike $1
          or s.email ilike $1
          or s.phone ilike $1
          or coalesce(s.integration_id, '') ilike $1
        )
      `;
    }

    const sortFieldMap = {
      name: 's.name',
      cpf: 's.cpf',
      email: 's.email',
      birthDate: 's.birth_date',
      status: 's.status',
      createdAt: 's.created_at',
    };
    const sortField = sortFieldMap[sortBy] || 's.created_at';
    const safeOrder = sortOrder === 'desc' ? 'desc' : 'asc';

    values.push(pageSize);
    const limitPos = values.length;
    values.push((page - 1) * pageSize);
    const offsetPos = values.length;

    const sql = `
      select s.*,
             ap.id as active_student_plan_id,
             ap.plan_id as active_plan_id,
             p.name as active_plan_name,
             p.monthly_checkin_limit as active_plan_monthly_checkin_limit
      from students s
      left join lateral (
        select sp.*
        from students_plans sp
        where sp.student_id = s.id
          and sp.status = 'active'
          and sp.start_date <= current_date
          and (sp.end_date is null or sp.end_date >= current_date)
        order by sp.start_date desc
        limit 1
      ) ap on true
      left join plans p on p.id = ap.plan_id
      ${whereSql}
      order by ${sortField} ${safeOrder}
      limit $${limitPos} offset $${offsetPos}
    `;

    const countSql = `select count(*)::int as total from students s ${whereSql}`;

    const [listResult, countResult] = await Promise.all([
      this.pool.query(sql, values),
      this.pool.query(countSql, values.slice(0, values.length - 2)),
    ]);

    return {
      data: listResult.rows.map((row) => ({
        ...this.toApiEntity(row),
        activePlanId: row.active_plan_id,
        activePlanName: row.active_plan_name,
        activePlanMonthlyCheckinLimit: row.active_plan_monthly_checkin_limit,
      })),
      total: countResult.rows[0]?.total || 0,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil((countResult.rows[0]?.total || 0) / pageSize)),
    };
  }

  async getById(id) {
    const [studentResult, guardiansResult, plansResult] = await Promise.all([
      this.pool.query(`select * from students where id = $1`, [id]),
      this.pool.query(
        `
          select sg.id, sg.guardian_student_id, sg.relationship, sg.created_at,
                 gs.name as guardian_name, gs.cpf as guardian_cpf
          from student_guardians sg
          join students gs on gs.id = sg.guardian_student_id
          where sg.student_id = $1
          order by sg.created_at desc
        `,
        [id],
      ),
      this.pool.query(
        `
          select sp.id, sp.plan_id, p.name as plan_name, p.periodicity, p.monthly_checkin_limit,
                 sp.start_date, sp.end_date, sp.status, sp.created_at
          from students_plans sp
          join plans p on p.id = sp.plan_id
          where sp.student_id = $1
          order by sp.start_date desc
        `,
        [id],
      ),
    ]);

    const student = studentResult.rows[0];
    if (!student) {
      throw new AppError('aluno nao encontrado', 404);
    }

    return {
      data: {
        ...this.toApiEntity(student),
        guardians: guardiansResult.rows.map((row) => ({
          id: row.id,
          guardianStudentId: row.guardian_student_id,
          guardianName: row.guardian_name,
          guardianCpf: row.guardian_cpf,
          relationship: row.relationship,
          createdAt: row.created_at,
        })),
        plans: plansResult.rows.map((row) => ({
          id: row.id,
          planId: row.plan_id,
          planName: row.plan_name,
          periodicity: row.periodicity,
          monthlyCheckinLimit: row.monthly_checkin_limit,
          startDate: row.start_date,
          endDate: row.end_date,
          status: row.status,
          createdAt: row.created_at,
        })),
      },
      success: true,
    };
  }

  async create(payload) {
    const cpf = validateAndNormalizeCpf(payload?.cpf);

    const age = calculateAge(payload?.birthDate);
    const guardians = parseGuardians(payload);

    if (age !== null && age < 18 && guardians.length === 0) {
      throw new AppError('Aluno menor de idade deve possuir responsavel', 400);
    }

    const client = await this.pool.connect();
    try {
      await client.query('begin');

      const dbPayload = this.toDbPayload({
        ...payload,
        cpf,
      });
      const columns = Object.keys(dbPayload);
      const values = Object.values(dbPayload);
      const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
      const insertResult = await client.query(
        `
          insert into students (${columns.join(', ')})
          values (${placeholders})
          returning id
        `,
        values,
      );
      const studentId = insertResult.rows[0].id;

      await this.syncGuardians(client, studentId, guardians, age, payload);
      await this.syncPlan(client, studentId, payload);

      await client.query('commit');
      return this.getById(studentId);
    } catch (error) {
      await client.query('rollback');
      this.handleDatabaseError(error);
    } finally {
      client.release();
    }
  }

  async update(id, payload) {
    const updatePayload = { ...payload };
    if (payload?.cpf !== undefined) {
      updatePayload.cpf = validateAndNormalizeCpf(payload.cpf);
    }

    const client = await this.pool.connect();
    try {
      await client.query('begin');

      const dbPayload = this.toDbPayload(updatePayload);
      const entries = Object.entries(dbPayload);
      if (entries.length) {
        const setSql = entries.map(([column], index) => `${column} = $${index + 1}`).join(', ');
        const values = entries.map(([, value]) => value);
        values.push(id);
        const updateResult = await client.query(
          `
            update students
            set ${setSql}
            where id = $${values.length}
            returning id
          `,
          values,
        );
        if (!updateResult.rows[0]) {
          throw new AppError('aluno nao encontrado', 404);
        }
      }

      const studentResult = await client.query('select birth_date from students where id = $1', [id]);
      if (!studentResult.rows[0]) {
        throw new AppError('aluno nao encontrado', 404);
      }

      const age = calculateAge(studentResult.rows[0].birth_date);
      const guardians = parseGuardians(payload);
      await this.syncGuardians(client, id, guardians, age, payload);
      await this.syncPlan(client, id, payload);

      await client.query('commit');
      return this.getById(id);
    } catch (error) {
      await client.query('rollback');
      this.handleDatabaseError(error);
    } finally {
      client.release();
    }
  }

  async syncGuardians(client, studentId, guardians, age, payload = {}) {
    if (Array.isArray(payload.guardians) || Array.isArray(payload.guardianStudentIds)) {
      await this.validateGuardians(client, studentId, guardians);
      await client.query('delete from student_guardians where student_id = $1', [studentId]);

      for (const guardian of guardians) {
        await client.query(
          'insert into student_guardians (student_id, guardian_student_id, relationship) values ($1, $2, $3)',
          [studentId, guardian.guardianStudentId, guardian.relationship],
        );
      }
    }

    if (age !== null && age < 18) {
      const countResult = await client.query(
        'select count(*)::int as total from student_guardians where student_id = $1',
        [studentId],
      );
      if ((countResult.rows[0]?.total || 0) < 1) {
        throw new AppError('Aluno menor de idade deve possuir responsavel', 400);
      }
    }
  }

  async validateGuardians(client, studentId, guardians) {
    const uniqueIds = [...new Set((guardians || []).map((g) => g.guardianStudentId))];
    if (!uniqueIds.length) return;

    if (uniqueIds.includes(studentId)) {
      throw new AppError('Responsavel invalido: aluno nao pode ser seu proprio responsavel', 400);
    }

    const rows = await client.query(
      'select id, birth_date from students where id = any($1::uuid[])',
      [uniqueIds],
    );

    if (rows.rows.length !== uniqueIds.length) {
      throw new AppError('Responsavel invalido: aluno responsavel nao encontrado', 400);
    }

    for (const row of rows.rows) {
      const age = calculateAge(row.birth_date);
      if (age !== null && age < 18) {
        throw new AppError('guardian_student_id deve ser maior de idade', 400);
      }
    }
  }

  async syncPlan(client, studentId, payload) {
    const planId = payload?.planId;
    if (!planId) return;

    const planResult = await client.query('select id from plans where id = $1', [planId]);
    if (!planResult.rows[0]) {
      throw new AppError('planId invalido: plano nao encontrado', 400);
    }

    const startDate = payload?.planStartDate || new Date().toISOString().slice(0, 10);
    const endDate = payload?.planEndDate || null;
    const status = payload?.planStatus || 'active';

    if (status === 'active') {
      await client.query(
        `
          update students_plans
          set status = case when end_date is null or end_date >= current_date then 'inactive' else 'expired' end,
              end_date = coalesce(end_date, current_date)
          where student_id = $1 and status = 'active'
        `,
        [studentId],
      );
    }

    await client.query(
      `
        insert into students_plans (student_id, plan_id, start_date, end_date, status)
        values ($1, $2, $3, $4, $5)
      `,
      [studentId, planId, startDate, endDate, status],
    );
  }
}

module.exports = StudentsService;
