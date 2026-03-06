const express = require('express');
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
  router.get(path, controller.list);
  router.get(`${path}/:id`, controller.getById);
  router.post(path, controller.create);
  router.put(`${path}/:id`, controller.update);
  router.patch(`${path}/:id`, controller.update);
  router.delete(`${path}/:id`, controller.remove);
}

mountCrud('/students', studentsController);
mountCrud('/teachers', teachersController);
mountCrud('/courses', coursesController);
mountCrud('/classes', classesController);
mountCrud('/checkins', checkinsController);

router.post('/dev/reset', devController.reset);

module.exports = router;
