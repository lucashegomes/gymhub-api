const logsService = require('./service');

class LogsController {
  async list(req, res, next) {
    try {
      const data = await logsService.list(req.query);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new LogsController();
