const createEntityController = require('./createEntityController');
const { getPool } = require('../../../config/database');
const {
  studentsService,
  teachersService,
  coursesService,
  classesService,
  checkinsService,
  plansService,
} = require('../services');
const { parseListQuery } = require('../utils/query');

const studentsController = createEntityController(studentsService);
const teachersController = createEntityController(teachersService);
const coursesController = createEntityController(coursesService);
const classesController = createEntityController(classesService);
const plansController = createEntityController(plansService);
const checkinsBaseController = createEntityController(checkinsService);

const checkinsController = {
  ...checkinsBaseController,
  async historyByStudent(req, res, next) {
    try {
      const query = parseListQuery(req.query);
      const response = await checkinsService.listByStudent(req.params.studentId, query);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },
};

const devController = {
  async reset(req, res, next) {
    try {
      const pool = getPool();
      await pool.query(
        'truncate table checkins, class_schedules, classes, course_teachers, courses, student_guardians, students_plans, plans, students, teachers restart identity cascade',
      );
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
  plansController,
  devController,
};
