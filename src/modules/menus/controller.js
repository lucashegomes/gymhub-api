const service = require('./service');

class MenusController {
  async listForMe(req, res, next) { try { res.json(await service.listForUser(req.auth)); } catch (e) { next(e); } }
  async listAll(req, res, next) { try { res.json(await service.listAll()); } catch (e) { next(e); } }
  async create(req, res, next) { try { res.status(201).json(await service.create(req.body)); } catch (e) { next(e); } }
  async update(req, res, next) { try { res.json(await service.update(req.params.id, req.body)); } catch (e) { next(e); } }
  async delete(req, res, next) { try { res.json(await service.delete(req.params.id)); } catch (e) { next(e); } }
}

module.exports = new MenusController();
