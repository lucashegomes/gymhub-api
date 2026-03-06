const StudentsService = require('./studentsService');
const TeachersService = require('./teachersService');
const CoursesService = require('./coursesService');
const ClassesService = require('./classesService');
const CheckinsService = require('./checkinsService');

const studentsService = new StudentsService();
const teachersService = new TeachersService();
const coursesService = new CoursesService();
const classesService = new ClassesService();
const checkinsService = new CheckinsService();

module.exports = {
  studentsService,
  teachersService,
  coursesService,
  classesService,
  checkinsService,
};
