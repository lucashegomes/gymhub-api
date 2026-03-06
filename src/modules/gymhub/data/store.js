const { buildSeedData } = require('./seedData');

const ENTITY_KEYS = ['students', 'teachers', 'courses', 'classes', 'checkins'];

class InMemoryStore {
  constructor() {
    this.reset();
  }

  reset() {
    const seed = buildSeedData();
    this.collections = {};

    ENTITY_KEYS.forEach((entityName) => {
      const map = new Map();
      seed[entityName].forEach((item) => {
        map.set(item.id, item);
      });
      this.collections[entityName] = map;
    });
  }

  list(entityName) {
    return Array.from(this.collections[entityName].values());
  }

  getById(entityName, id) {
    return this.collections[entityName].get(id) || null;
  }

  exists(entityName, id) {
    return this.collections[entityName].has(id);
  }

  create(entityName, item) {
    this.collections[entityName].set(item.id, item);
    return item;
  }

  update(entityName, id, item) {
    this.collections[entityName].set(id, item);
    return item;
  }

  delete(entityName, id) {
    return this.collections[entityName].delete(id);
  }
}

module.exports = {
  InMemoryStore,
};
