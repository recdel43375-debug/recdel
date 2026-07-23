const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const configRoutes = require('./routes/config.routes');
const legalRoutes = require('./routes/legal.routes');
const telemetryRoutes = require('./routes/telemetry.routes');

function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/config', configRoutes);
  app.use('/legal', legalRoutes);
  app.use('/telemetry', telemetryRoutes);

  app.use((req, res) => {
    res.status(404).json({ error: 'not found' });
  });

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'internal server error' });
  });

  return app;
}

module.exports = { createApp };
