const logsService = require('../modules/logs/service');

async function registerAuditLog(req, { action, resource, entityId, description, userId }) {
  try {
    await logsService.log({
      action,
      resource,
      entityId,
      description,
      userId: userId || req?.auth?.userId || null,
      ip: req?.ip || req?.headers?.['x-forwarded-for'] || null,
      userAgent: req?.headers?.['user-agent'] || null,
    });
  } catch (error) {
    // log failures must not break main request flow
    console.error('Failed to write audit log:', error.message);
  }
}

module.exports = {
  registerAuditLog,
};
