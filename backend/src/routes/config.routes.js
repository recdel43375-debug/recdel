const path = require('path');
const express = require('express');
const { readJson } = require('../lib/readJson');

const router = express.Router();

const DATA_DIR = path.join(__dirname, '..', 'data');

// GET /config/app-version
router.get('/app-version', (req, res) => {
  const version = readJson(path.join(DATA_DIR, 'app-version.json'));
  res.json(version);
});

// GET /config/remote-flags
router.get('/remote-flags', (req, res) => {
  const flags = readJson(path.join(DATA_DIR, 'remote-flags.json'));
  res.json(flags);
});

// GET /config/supported-apps
router.get('/supported-apps', (req, res) => {
  const apps = readJson(path.join(DATA_DIR, 'supported-apps.json'));
  res.json({ apps });
});

module.exports = router;
