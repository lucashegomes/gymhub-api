const express = require('express');
const authMiddleware = require('../../middlewares/authMiddleware');
const { checkPermission } = require('../../middlewares/permissionMiddleware');
const controller = require('./controller');

const router = express.Router();

router.get('/', authMiddleware, checkPermission('logs', 'read'), controller.list.bind(controller));

module.exports = router;
