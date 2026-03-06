const gympassService = require('../services/gympassService');
const { registerAuditLog } = require('../utils/auditLog');

function sendNoContentOrJson(res, data) {
  if (data === null) {
    return res.status(204).send();
  }
  return res.status(200).json(data);
}

const gympassController = {
  async createClasses(req, res, next) {
    try {
      const data = await gympassService.createClasses(req.params.gymId, req.body);
      res.status(201).json(data);
    } catch (error) {
      next(error);
    }
  },

  async listClasses(req, res, next) {
    try {
      const data = await gympassService.listClasses(req.params.gymId);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  },

  async getClass(req, res, next) {
    try {
      const data = await gympassService.getClass(req.params.gymId, req.params.classId, req.query.showDeleted);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  },

  async updateClass(req, res, next) {
    try {
      const data = await gympassService.updateClass(req.params.gymId, req.params.classId, req.body);
      sendNoContentOrJson(res, data);
    } catch (error) {
      next(error);
    }
  },

  async createSlot(req, res, next) {
    try {
      const data = await gympassService.createSlot(req.params.gymId, req.params.classId, req.body);
      res.status(201).json(data);
    } catch (error) {
      next(error);
    }
  },

  async getSlot(req, res, next) {
    try {
      const data = await gympassService.getSlot(req.params.gymId, req.params.classId, req.params.slotId);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  },

  async listSlots(req, res, next) {
    try {
      const data = await gympassService.listSlots(req.params.gymId, req.params.classId, {
        from: req.query.from,
        to: req.query.to,
      });
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  },

  async deleteSlot(req, res, next) {
    try {
      const data = await gympassService.deleteSlot(req.params.gymId, req.params.classId, req.params.slotId);
      sendNoContentOrJson(res, data);
    } catch (error) {
      next(error);
    }
  },

  async patchSlot(req, res, next) {
    try {
      const data = await gympassService.patchSlot(req.params.gymId, req.params.classId, req.params.slotId, req.body);
      sendNoContentOrJson(res, data);
    } catch (error) {
      next(error);
    }
  },

  async updateSlot(req, res, next) {
    try {
      const data = await gympassService.updateSlot(req.params.gymId, req.params.classId, req.params.slotId, req.body);
      sendNoContentOrJson(res, data);
    } catch (error) {
      next(error);
    }
  },

  async validateBooking(req, res, next) {
    try {
      const data = await gympassService.validateBooking(req.params.gymId, req.params.bookingNumber, req.body);
      sendNoContentOrJson(res, data);
    } catch (error) {
      next(error);
    }
  },

  async listProducts(req, res, next) {
    try {
      const data = await gympassService.listGymProducts(req.params.gymId);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  },

  async validateCheckin(req, res, next) {
    try {
      const data = await gympassService.validateCheckin(req.params.gymId, req.body);
      await registerAuditLog(req, {
        action: 'checkin_validate',
        resource: 'gympass',
        entityId: req.params.gymId,
        description: `Check-in validado no gym ${req.params.gymId}`,
      });
      res.status(200).json(data);
    } catch (error) {
      await registerAuditLog(req, {
        action: 'checkin_validate_failed',
        resource: 'gympass',
        entityId: req.params.gymId,
        description: `Falha ao validar check-in no gym ${req.params.gymId}: ${error.message}`,
      });
      next(error);
    }
  },

  async handleWebhook(req, res) {
    const payload = req.body;

    res.status(202).json({
      received: true,
      event_type: payload?.event_type || null,
      event_id: payload?.event_data?.event_id || null,
    });
  },
};

module.exports = gympassController;
