const express = require('express');
const auth = require('../../middlewares/authMiddleware');
const { checkPermission } = require('../../middlewares/permissionMiddleware');
const controller = require('./controller');

const router = express.Router();

router.get('/', auth, checkPermission('feature_flags', 'read'), controller.list.bind(controller));
router.post('/', auth, checkPermission('feature_flags', 'create'), controller.create.bind(controller));
router.patch('/:id', auth, checkPermission('feature_flags', 'update'), controller.update.bind(controller));
router.delete('/:id', auth, checkPermission('feature_flags', 'delete'), controller.delete.bind(controller));

module.exports = router;
