const express = require('express');
const gymhubRoutes = require('./routes/gymhubRoutes');
const gympassRoutes = require('./routes/gympassRoutes');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');
const { testDatabaseConnection } = require('./config/database');

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

app.use('/api', gymhubRoutes);
app.use('/api/gympass', gympassRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
