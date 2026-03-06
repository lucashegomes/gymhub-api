const express = require('express');
const auth = require('../../middlewares/authMiddleware');
const { checkPermission } = require('../../middlewares/permissionMiddleware');
const controller = require('./controller');

const router = express.Router();

router.get('/me', auth, controller.listForMe.bind(controller));
router.get('/', auth, checkPermission('menus', 'read'), controller.listAll.bind(controller));
router.post('/', auth, checkPermission('menus', 'create'), controller.create.bind(controller));
router.patch('/:id', auth, checkPermission('menus', 'update'), controller.update.bind(controller));
router.delete('/:id', auth, checkPermission('menus', 'delete'), controller.delete.bind(controller));

module.exports = router;
