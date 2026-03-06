const service = require('./service');

class RolesController {
  async list(req, res, next) { try { res.json(await service.list()); } catch (e) { next(e); } }
  async create(req, res, next) { try { res.status(201).json(await service.create(req.body)); } catch (e) { next(e); } }
  async update(req, res, next) { try { res.json(await service.update(req.params.id, req.body)); } catch (e) { next(e); } }
  async delete(req, res, next) { try { res.json(await service.delete(req.params.id)); } catch (e) { next(e); } }
  async setPermissions(req, res, next) { try { res.json(await service.setPermissions(req.params.id, req.body.permissionIds)); } catch (e) { next(e); } }
  async setFeatureFlags(req, res, next) { try { res.json(await service.setFeatureFlags(req.params.id, req.body.featureFlagIds)); } catch (e) { next(e); } }
}

module.exports = new RolesController();
