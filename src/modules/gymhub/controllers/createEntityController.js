const { parseListQuery } = require('../utils/query');

function createEntityController(service) {
  return {
    async list(req, res, next) {
      try {
        const query = parseListQuery(req.query);
        const response = await service.list(query);
        res.status(200).json(response);
      } catch (error) {
        next(error);
      }
    },

    async getById(req, res, next) {
      try {
        const response = await service.getById(req.params.id);
        res.status(200).json(response);
      } catch (error) {
        next(error);
      }
    },

    async create(req, res, next) {
      try {
        const response = await service.create(req.body);
        res.status(201).json(response);
      } catch (error) {
        next(error);
      }
    },

    async update(req, res, next) {
      try {
        const response = await service.update(req.params.id, req.body);
        res.status(200).json(response);
      } catch (error) {
        next(error);
      }
    },

    async remove(req, res, next) {
      try {
        const response = await service.delete(req.params.id);
        res.status(200).json(response);
      } catch (error) {
        next(error);
      }
    },
  };
}

module.exports = createEntityController;
