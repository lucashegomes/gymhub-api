const crypto = require('crypto');
const env = require('../config/env');

function normalizeSignature(signature) {
  return String(signature || '').trim().toUpperCase();
}

function verifyGympassSignature(req, res, next) {
  if (!env.webhookSecret) {
    return next();
  }

  const sentSignature = normalizeSignature(
    req.header('x-gympass-signature') || req.header('X-Gympass-Signature'),
  );

  if (!sentSignature) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing x-gympass-signature header',
    });
  }

  const raw = req.rawBody || JSON.stringify(req.body || {});
  const expected = crypto.createHmac('sha1', env.webhookSecret).update(raw).digest('hex').toUpperCase();

  if (sentSignature !== expected) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid x-gympass-signature',
    });
  }

  return next();
}

module.exports = verifyGympassSignature;
