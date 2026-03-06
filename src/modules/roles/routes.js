const express = require('express');
const auth = require('../../middlewares/authMiddleware');
const { checkPermission } = require('../../middlewares/permissionMiddleware');
const controller = require('./controller');

const router = express.Router();

router.get('/', auth, checkPermission('roles', 'read'), controller.list.bind(controller));
router.post('/', auth, checkPermission('roles', 'create'), controller.create.bind(controller));
router.patch('/:id', auth, checkPermission('roles', 'update'), controller.update.bind(controller));
router.delete('/:id', auth, checkPermission('roles', 'delete'), controller.delete.bind(controller));
router.put('/:id/permissions', auth, checkPermission('roles', 'update'), controller.setPermissions.bind(controller));
router.put('/:id/feature-flags', auth, checkPermission('roles', 'update'), controller.setFeatureFlags.bind(controller));

module.exports = router;
