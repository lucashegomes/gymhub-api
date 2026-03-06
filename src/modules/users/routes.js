const express = require('express');
const auth = require('../../middlewares/authMiddleware');
const { checkPermission } = require('../../middlewares/permissionMiddleware');
const upload = require('../../middlewares/uploadMiddleware');
const AppError = require('../../lib/appError');
const controller = require('./controller');

const router = express.Router();

function allowSelfOrUsersUpdate(req, res, next) {
  if (req.auth?.userId === req.params.id) {
    return next();
  }

  const permissions = req.auth?.permissions || [];
  const canUpdateUsers = permissions.some((permission) => {
    return permission.resource === 'users' && permission.action === 'update';
  });

  if (!canUpdateUsers) {
    return next(new AppError('Sem permissao para atualizar esta foto', 403));
  }

  return next();
}

router.get('/', auth, checkPermission('users', 'read'), controller.list.bind(controller));
router.post('/', auth, checkPermission('users', 'create'), controller.create.bind(controller));
router.patch('/:id', auth, checkPermission('users', 'update'), controller.update.bind(controller));
router.delete('/:id', auth, checkPermission('users', 'delete'), controller.delete.bind(controller));
router.post('/:id/photo', auth, allowSelfOrUsersUpdate, upload.single('photo'), controller.uploadPhoto.bind(controller));

module.exports = router;
