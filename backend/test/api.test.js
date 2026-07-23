const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const { createApp } = require('../src/app');

function request(server, method, path, body) {
  return new Promise((resolve, reject) => {
    const { port } = server.address();
    const data = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        host: '127.0.0.1',
        port,
        method,
        path,
        headers: data
          ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
          : {},
      },
      (res) => {
        let chunks = '';
        res.on('data', (c) => (chunks += c));
        res.on('end', () => {
          resolve({ status: res.statusCode, body: chunks ? JSON.parse(chunks) : null });
        });
      }
    );
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

test('config and legal endpoints respond', async (t) => {
  const app = createApp();
  const server = app.listen(0);
  t.after(() => server.close());

  const health = await request(server, 'GET', '/health');
  assert.strictEqual(health.status, 200);
  assert.strictEqual(health.body.status, 'ok');

  const version = await request(server, 'GET', '/config/app-version');
  assert.strictEqual(version.status, 200);
  assert.ok(version.body.latestVersion);

  const flags = await request(server, 'GET', '/config/remote-flags');
  assert.strictEqual(flags.status, 200);
  assert.strictEqual(typeof flags.body.autoSaveDefaultEnabled, 'boolean');

  const apps = await request(server, 'GET', '/config/supported-apps');
  assert.strictEqual(apps.status, 200);
  assert.ok(Array.isArray(apps.body.apps));
  assert.ok(apps.body.apps.some((a) => a.packageName === 'com.whatsapp'));

  const privacy = await request(server, 'GET', '/legal/privacy-policy');
  assert.strictEqual(privacy.status, 200);
  assert.ok(privacy.body.content.includes('Privacy Policy'));

  const terms = await request(server, 'GET', '/legal/terms');
  assert.strictEqual(terms.status, 200);
  assert.ok(terms.body.content.includes('Terms'));
});

test('telemetry rejects unknown events and accepts allowed ones', async (t) => {
  const app = createApp();
  const server = app.listen(0);
  t.after(() => server.close());

  const bad = await request(server, 'POST', '/telemetry/event', { event: 'read_private_messages' });
  assert.strictEqual(bad.status, 400);

  const good = await request(server, 'POST', '/telemetry/event', { event: 'app_opened' });
  assert.strictEqual(good.status, 204);
});

test('unknown route returns 404', async (t) => {
  const app = createApp();
  const server = app.listen(0);
  t.after(() => server.close());

  const res = await request(server, 'GET', '/nope');
  assert.strictEqual(res.status, 404);
});
