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
  };
}

module.exports = {
  parseListQuery,
};
