const jwt = require('jsonwebtoken');
const env = require('../config/env');

const EXPIRES_IN = '8h';

function signAuthToken(payload) {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: EXPIRES_IN,
  });
}

function verifyAuthToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

module.exports = {
  signAuthToken,
  verifyAuthToken,
  EXPIRES_IN,
};
