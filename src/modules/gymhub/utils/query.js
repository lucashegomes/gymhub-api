function toPositiveInt(value, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.floor(parsed);
}

function parseListQuery(query) {
  return {
    page: toPositiveInt(query.page, 1),
    pageSize: toPositiveInt(query.pageSize, 10),
    search: typeof query.search === 'string' ? query.search.trim() : '',
    sortBy: typeof query.sortBy === 'string' ? query.sortBy : '',
    sortOrder: query.sortOrder === 'desc' ? 'desc' : 'asc',
    dateFrom: typeof query.dateFrom === 'string' ? query.dateFrom : '',
    dateTo: typeof query.dateTo === 'string' ? query.dateTo : '',
    courseId: typeof query.courseId === 'string' ? query.courseId : '',
    classId: typeof query.classId === 'string' ? query.classId : '',
    studentId: typeof query.studentId === 'string' ? query.studentId : '',
  };
}

module.exports = {
  parseListQuery,
};
