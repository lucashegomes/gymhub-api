const authService = require('./service');
const { registerAuditLog } = require('../../utils/auditLog');

class AuthController {
  async login(req, res, next) {
    try {
      const response = await authService.login(req.body);

      await registerAuditLog(req, {
        action: 'login',
        resource: 'auth',
        entityId: response.user.id,
        description: `Login realizado por ${response.user.email}`,
        userId: response.user.id,
      });

      res.status(200).json(response);
    } catch (error) {
      await registerAuditLog(req, {
        action: 'login_failed',
        resource: 'auth',
        description: `Falha de login para identificador ${req.body?.identifier || 'n/a'}`,
      });
      next(error);
    }
  }

  async me(req, res, next) {
    try {
      res.status(200).json(await authService.me(req.auth));
    } catch (error) {
      next(error);
    }
  }

  async requestPasswordReset(req, res, next) {
    try {
      const response = await authService.requestPasswordReset(req.body);
      await registerAuditLog(req, {
        action: 'password_reset',
        resource: 'auth',
        description: `Solicitacao de reset para ${req.body?.identifier || 'n/a'}`,
      });
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const response = await authService.resetPassword(req.body);
      await registerAuditLog(req, {
        action: 'password_reset',
        resource: 'auth',
        description: 'Senha resetada com token',
      });
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res) {
    await registerAuditLog(req, {
      action: 'logout',
      resource: 'auth',
      description: `Logout user ${req.auth.userId}`,
      userId: req.auth.userId,
    });

    res.status(200).json({ success: true, message: 'Logout realizado' });
  }
}

module.exports = new AuthController();
