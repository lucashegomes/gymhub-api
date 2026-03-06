const AppError = require('../../lib/appError');
const AuthRepository = require('./repository');
const { verifyPassword, hashPassword, validatePasswordStrength } = require('../../utils/password');
const { signAuthToken } = require('../../utils/jwt');

class AuthService {
  constructor() {
    this.repository = new AuthRepository();
  }

  async login({ identifier, password }) {
    const user = await this.repository.findUserByIdentifier(identifier);

    if (!user) {
      throw new AppError('Credenciais invalidas', 401);
    }

    const validPassword = await verifyPassword(password, user.password_hash);

    if (!validPassword) {
      throw new AppError('Credenciais invalidas', 401);
    }

    if (user.status !== 'active') {
      throw new AppError('Usuario inativo ou bloqueado', 403);
    }

    const access = await this.repository.getAccessData(user.id);

    const payload = {
      userId: user.id,
      roleId: user.role_id,
      permissions: access.permissions,
      featureFlags: access.featureFlags,
    };

    const token = signAuthToken(payload);

    await this.repository.updateLastLogin(user.id);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        cpf: user.cpf,
        photoUrl: user.photo_url,
        roleId: user.role_id,
        status: user.status,
      },
      permissions: access.permissions,
      featureFlags: access.featureFlags,
    };
  }

  async requestPasswordReset({ identifier }) {
    const user = await this.repository.findUserByIdentifier(identifier);

    if (!user) {
      return { success: true, message: 'Se o usuario existir, enviaremos instrucoes de reset.' };
    }

    const token = await this.repository.createPasswordResetToken(user.id);

    return {
      success: true,
      message: 'Token de recuperacao gerado.',
      // Em produção, enviar por e-mail em vez de retornar no response
      resetToken: token,
      expiresInMinutes: 60,
    };
  }

  async resetPassword({ token, password }) {
    validatePasswordStrength(password);

    const resetToken = await this.repository.findValidResetToken(token);
    if (!resetToken) {
      throw new AppError('Token invalido ou expirado', 400);
    }

    const passwordHash = await hashPassword(password);

    await this.repository.updatePassword(resetToken.user_id, passwordHash);
    await this.repository.useResetToken(resetToken.id);

    return { success: true, message: 'Senha atualizada com sucesso' };
  }

  async me(auth) {
    const user = await this.repository.getUserById(auth.userId);
    if (!user) throw new AppError('Usuario nao encontrado', 404);

    return {
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        cpf: user.cpf,
        photoUrl: user.photo_url,
        roleId: user.role_id,
        status: user.status,
        lastLogin: user.last_login,
      },
      success: true,
    };
  }
}

module.exports = new AuthService();
