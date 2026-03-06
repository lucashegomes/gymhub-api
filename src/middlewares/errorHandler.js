const { HttpError } = require('../lib/httpClient');
const AppError = require('../lib/appError');

function notFoundHandler(req, res) {
  res.status(404).json({
    message: `Route ${req.method} ${req.originalUrl} not found`,
    statusCode: 404,
  });
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({
      message: err.message,
      statusCode: err.statusCode,
      errors: err.responseBody || undefined,
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
      statusCode: err.statusCode,
      errors: err.errors,
    });
  }

  return res.status(500).json({
    message: err.message || 'Unexpected error',
    statusCode: 500,
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
