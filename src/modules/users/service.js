const AppError = require('../../lib/appError');
const UsersRepository = require('./repository');
const { hashPassword, validatePasswordStrength } = require('../../utils/password');
const { normalizeEmail, normalizeCpf } = require('../../utils/identifier');
const { isValidCpf } = require('../../utils/cpf');

class UsersService {
  constructor() {
    this.repository = new UsersRepository();
  }

  mapUser(user) {
    if (!user) return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      cpf: user.cpf,
      photoUrl: user.photo_url,
      roleId: user.role_id,
      roleName: user.role_name,
      status: user.status,
      lastLogin: user.last_login,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }

  async list(query) {
    const page = Number(query.page || 1);
    const pageSize = Number(query.pageSize || 10);
    const search = String(query.search || '').trim();

    const [rows, total] = await Promise.all([
      this.repository.list({ page, pageSize, search }),
      this.repository.countAll(search),
    ]);

    return {
      data: rows.map((row) => this.mapUser(row)),
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  async create(payload) {
    const email = normalizeEmail(payload.email);
    const cpf = normalizeCpf(payload.cpf);

    if (!email && !cpf) {
      throw new AppError('email ou cpf obrigatorio', 400);
    }

    if (cpf && !isValidCpf(cpf)) {
      throw new AppError('CPF invalido', 400);
    }

    validatePasswordStrength(payload.password || '');

    const passwordHash = await hashPassword(payload.password);

    try {
      const row = await this.repository.create({
        name: payload.name,
        email,
        cpf,
        passwordHash,
        roleId: payload.roleId,
        status: payload.status || 'active',
      });

      return {
        data: this.mapUser(row),
        success: true,
        message: 'Created',
      };
    } catch (error) {
      if (error.code === '23505') {
        if ((error.constraint || '').includes('email')) throw new AppError('email ja cadastrado', 409);
        if ((error.constraint || '').includes('cpf')) throw new AppError('CPF already registered', 409);
      }

      throw error;
    }
  }

  async update(id, payload) {
    const updateData = {};

    if (payload.name !== undefined) updateData.name = payload.name;
    if (payload.email !== undefined) updateData.email = normalizeEmail(payload.email);
    if (payload.cpf !== undefined) updateData.cpf = normalizeCpf(payload.cpf);
    if (updateData.cpf && !isValidCpf(updateData.cpf)) {
      throw new AppError('CPF invalido', 400);
    }
    if (payload.roleId !== undefined) updateData.roleId = payload.roleId;
    if (payload.status !== undefined) updateData.status = payload.status;

    if (payload.password) {
      validatePasswordStrength(payload.password);
      updateData.passwordHash = await hashPassword(payload.password);
    }

    try {
      const row = await this.repository.update(id, updateData);
      if (!row) throw new AppError('usuario nao encontrado', 404);

      return {
        data: this.mapUser(row),
        success: true,
        message: 'Updated',
      };
    } catch (error) {
      if (error.code === '23505') {
        if ((error.constraint || '').includes('email')) throw new AppError('email ja cadastrado', 409);
        if ((error.constraint || '').includes('cpf')) throw new AppError('CPF already registered', 409);
      }

      throw error;
    }
  }

  async delete(id) {
    const removed = await this.repository.delete(id);
    if (!removed) throw new AppError('usuario nao encontrado', 404);

    return {
      data: null,
      success: true,
      message: 'Deleted',
    };
  }

  async updatePhoto(id, photoUrl) {
    const row = await this.repository.setPhoto(id, photoUrl);
    if (!row) throw new AppError('usuario nao encontrado', 404);

    return {
      data: this.mapUser(row),
      success: true,
      message: 'Updated',
    };
  }
}

module.exports = new UsersService();
