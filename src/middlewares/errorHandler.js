const { HttpError } = require('../lib/httpClient');

function notFoundHandler(req, res) {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({
      error: 'Gympass API Error',
      message: err.message,
      details: err.responseBody,
    });
  }

  return res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'Unexpected error',
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
