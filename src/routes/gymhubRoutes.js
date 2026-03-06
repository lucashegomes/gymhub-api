const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { checkPermission } = require('../middlewares/permissionMiddleware');
const {
  studentsController,
  teachersController,
  coursesController,
  classesController,
  checkinsController,
  devController,
} = require('../modules/gymhub/controllers');

const router = express.Router();

function mountCrud(path, controller) {
  const resource = path.replace('/', '');
  router.get(path, authMiddleware, checkPermission(resource, 'read'), controller.list);
  router.get(`${path}/:id`, authMiddleware, checkPermission(resource, 'read'), controller.getById);
  router.post(path, authMiddleware, checkPermission(resource, 'create'), controller.create);
  router.put(`${path}/:id`, authMiddleware, checkPermission(resource, 'update'), controller.update);
  router.patch(`${path}/:id`, authMiddleware, checkPermission(resource, 'update'), controller.update);
  router.delete(`${path}/:id`, authMiddleware, checkPermission(resource, 'delete'), controller.remove);
}

mountCrud('/students', studentsController);
mountCrud('/teachers', teachersController);
mountCrud('/courses', coursesController);
mountCrud('/classes', classesController);
mountCrud('/checkins', checkinsController);

router.post('/dev/reset', authMiddleware, checkPermission('users', 'delete'), devController.reset);

module.exports = router;
