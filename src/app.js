const express = require('express');
const path = require('node:path');
const gymhubRoutes = require('./routes/gymhubRoutes');
const gympassRoutes = require('./routes/gympassRoutes');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');
const { testDatabaseConnection } = require('./config/database');
const authRoutes = require('./modules/auth/routes');
const usersRoutes = require('./modules/users/routes');
const rolesRoutes = require('./modules/roles/routes');
const permissionsRoutes = require('./modules/permissions/routes');
const featureFlagsRoutes = require('./modules/featureFlags/routes');
const logsRoutes = require('./modules/logs/routes');
const menusRoutes = require('./modules/menus/routes');

const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).send();
  }

  return next();
});

app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf.toString('utf8');
    },
  }),
);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/health/db', async (req, res) => {
  try {
    const result = await testDatabaseConnection();
    res.status(200).json({
      status: 'ok',
      database: result.database_name,
      serverTime: result.server_time,
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      message: error.message,
    });
  }
});

app.use('/uploads', express.static(path.resolve(process.cwd(), 'src/uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/permissions', permissionsRoutes);
app.use('/api/feature-flags', featureFlagsRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/menus', menusRoutes);

app.use('/api', gymhubRoutes);
app.use('/api/gympass', gympassRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
