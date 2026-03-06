const express = require('express');
const auth = require('../../middlewares/authMiddleware');
const { checkPermission } = require('../../middlewares/permissionMiddleware');
const upload = require('../../middlewares/uploadMiddleware');
const controller = require('./controller');

const router = express.Router();

router.get('/', auth, checkPermission('users', 'read'), controller.list.bind(controller));
router.post('/', auth, checkPermission('users', 'create'), controller.create.bind(controller));
router.patch('/:id', auth, checkPermission('users', 'update'), controller.update.bind(controller));
router.delete('/:id', auth, checkPermission('users', 'delete'), controller.delete.bind(controller));
router.post('/:id/photo', auth, checkPermission('users', 'update'), upload.single('photo'), controller.uploadPhoto.bind(controller));

module.exports = router;
