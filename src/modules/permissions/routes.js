const express = require('express');
const auth = require('../../middlewares/authMiddleware');
const { checkPermission } = require('../../middlewares/permissionMiddleware');
const controller = require('./controller');

const router = express.Router();

router.get('/', auth, checkPermission('permissions', 'read'), controller.list.bind(controller));
router.post('/', auth, checkPermission('permissions', 'create'), controller.create.bind(controller));
router.patch('/:id', auth, checkPermission('permissions', 'update'), controller.update.bind(controller));
router.delete('/:id', auth, checkPermission('permissions', 'delete'), controller.delete.bind(controller));

module.exports = router;
