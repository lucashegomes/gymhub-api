const express = require('express');
const gympassRoutes = require('./routes/gympassRoutes');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');

const app = express();

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

app.use('/api/gympass', gympassRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
