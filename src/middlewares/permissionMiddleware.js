const AppError = require('../lib/appError');

function checkPermission(resource, action) {
  return (req, res, next) => {
    const permissions = req.auth?.permissions || [];

    const allowed = permissions.some((permission) => {
      return permission.resource === resource && permission.action === action;
    });

    if (!allowed) {
      return next(new AppError('Sem permissao para executar esta acao', 403));
    }

    return next();
  };
}

function checkScreen(screen) {
  return (req, res, next) => {
    const permissions = req.auth?.permissions || [];

    const allowed = permissions.some((permission) => permission.screen === screen && permission.action === 'view');

    if (!allowed) {
      return next(new AppError('Sem permissao para acessar esta tela', 403));
    }

    return next();
  };
}

module.exports = {
  checkPermission,
  checkScreen,
};
