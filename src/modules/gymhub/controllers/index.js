const createEntityController = require('./createEntityController');
const { getPool } = require('../../../config/database');
const {
  studentsService,
  teachersService,
  coursesService,
  classesService,
  checkinsService,
} = require('../services');

const studentsController = createEntityController(studentsService);
const teachersController = createEntityController(teachersService);
const coursesController = createEntityController(coursesService);
const classesController = createEntityController(classesService);
const checkinsController = createEntityController(checkinsService);

const devController = {
  async reset(req, res, next) {
    try {
      const pool = getPool();
      await pool.query('truncate table checkins, classes, courses, students, teachers restart identity cascade');
      res.status(200).json({ success: true, message: 'Banco resetado', data: null });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = {
  studentsController,
  teachersController,
  coursesController,
  classesController,
  checkinsController,
  devController,
};
