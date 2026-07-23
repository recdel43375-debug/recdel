const fs = require('fs');
const path = require('path');
const express = require('express');

const router = express.Router();

const LOG_PATH = path.join(__dirname, '..', 'data', 'telemetry-events.log');

// Allowlist of non-PII event names. Anything else is rejected so the
// endpoint can never become a vector for accidentally logging message
// content, filenames, or contact identifiers.
const ALLOWED_EVENTS = new Set([
  'app_opened',
  'onboarding_completed',
  'disclaimer_accepted',
  'app_added_to_monitor',
  'status_saved_count',
  'notification_access_granted',
  'saf_permission_granted',
]);

// POST /telemetry/event
router.post('/event', express.json(), (req, res) => {
  const { event, value } = req.body || {};

  if (typeof event !== 'string' || !ALLOWED_EVENTS.has(event)) {
    return res.status(400).json({ error: 'unknown or unsupported event name' });
  }

  const record = {
    event,
    value: typeof value === 'number' ? value : undefined,
    ts: new Date().toISOString(),
  };

  fs.appendFile(LOG_PATH, JSON.stringify(record) + '\n', (err) => {
    if (err) {
      // Telemetry is best-effort and opt-out-able; never fail the client over it.
      return res.status(204).end();
    }
    res.status(204).end();
  });
});

module.exports = router;
