const AppError = require('../lib/appError');
const { verifyAuthToken } = require('../utils/jwt');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Nao autenticado', 401));
  }

  const token = authHeader.replace('Bearer ', '').trim();

  try {
    req.auth = verifyAuthToken(token);
    return next();
  } catch (error) {
    return next(new AppError('Token invalido ou expirado', 401));
  }
}

module.exports = authMiddleware;
