const usersService = require('./service');
const { registerAuditLog } = require('../../utils/auditLog');

class UsersController {
  async list(req, res, next) {
    try {
      res.status(200).json(await usersService.list(req.query));
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const response = await usersService.create(req.body);
      await registerAuditLog(req, {
        action: 'create_user',
        resource: 'users',
        entityId: response.data.id,
        description: `Usuario ${response.data.email} criado`,
      });
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const response = await usersService.update(req.params.id, req.body);
      await registerAuditLog(req, {
        action: 'update_user',
        resource: 'users',
        entityId: req.params.id,
        description: `Usuario ${req.params.id} atualizado`,
      });
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const response = await usersService.delete(req.params.id);
      await registerAuditLog(req, {
        action: 'delete_user',
        resource: 'users',
        entityId: req.params.id,
        description: `Usuario ${req.params.id} removido`,
      });
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async uploadPhoto(req, res, next) {
    try {
      if (!req.file) {
        throw new Error('Arquivo nao enviado');
      }

      const response = await usersService.updatePhoto(req.params.id, `/uploads/users/${req.file.filename}`);
      await registerAuditLog(req, {
        action: 'update_user',
        resource: 'users',
        entityId: req.params.id,
        description: `Foto do usuario ${req.params.id} atualizada`,
      });
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UsersController();
