const express = require('express');
const authMiddleware = require('../../middlewares/authMiddleware');
const controller = require('./controller');

const router = express.Router();

router.post('/login', controller.login.bind(controller));
router.get('/me', authMiddleware, controller.me.bind(controller));
router.post('/logout', authMiddleware, controller.logout.bind(controller));
router.post('/request-password-reset', controller.requestPasswordReset.bind(controller));
router.post('/reset-password', controller.resetPassword.bind(controller));

module.exports = router;
