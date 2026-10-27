'use strict';

const http = require('node:http');
const path = require('node:path');
const fs = require('node:fs/promises');
const { EventEmitter } = require('node:events');

const { createStore } = require('./modules/itemStore');
const { validateItem, STATUSES } = require('./modules/validator');
const { sendJson, readJson } = require('./modules/httpHelpers');
const { createNotifier } = require('./modules/emailService');

const ROOT = __dirname;

// createApp() builds the server without starting it, so tests and demos can reuse it.
function createApp({
  dataDir = process.env.DATA_DIR || path.join(ROOT, 'data'),
  mail = true,
} = {}) {
  const store = createStore(path.join(dataDir, 'items.ndjson'));

  // ---- Event listeners: they run AFTER the item has been saved ----
  const events = new EventEmitter();

  // Listener 1: console message
  events.on('item:created', (item) => {
    console.log(`[EVENT] item:created id=${item.id} status=${item.status} title="${item.title}"`);
  });

  // Listener 2: optional audit record (failure is reported, never thrown)
  events.on('item:created', (item) => {
    const line = `${new Date().toISOString()} AUDIT item=${item.id} status=${item.status} title="${item.title}"\n`;
    fs.mkdir(dataDir, { recursive: true })
      .then(() => fs.appendFile(path.join(dataDir, 'audit.log'), line, 'utf8'))
      .catch((error) => console.error('[AUDIT WARNING]', error.message));
  });

  // Listener 3: offline notice to the LOCAL SMTP receiver, only for FOUND items
  if (mail) {
    const notifier = createNotifier();
    events.on('item:created', (item) => {
      if (item.status !== 'found') return;
      Promise.resolve()
        .then(() => notifier.notifyFound(item))
        .then(() => console.log(`[MAIL] local notice sent for ${item.id}`))
        .catch((error) => console.error('[MAIL WARNING] Item still saved:', error.message));
    });
  }

  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      const pathname = url.pathname;

      if (req.method === 'GET' && pathname === '/api/health') {
        return sendJson(res, 200, { status: 'ok', time: new Date().toISOString() });
      }

      // GET /api/items/count[?status=lost|found]   (checked before /api/items)
      if (req.method === 'GET' && pathname === '/api/items/count') {
        const status = url.searchParams.get('status');
        if (status !== null && !STATUSES.includes(status)) {
          return sendJson(res, 400, { error: 'status must be "lost" or "found"' });
        }
        return sendJson(res, 200, { status: status || 'all', count: await store.count({ status: status || undefined }) });
      }

      // GET /api/items[?status=lost|found]
      if (req.method === 'GET' && pathname === '/api/items') {
        const status = url.searchParams.get('status');
        if (status !== null && !STATUSES.includes(status)) {
          return sendJson(res, 400, { error: 'status must be "lost" or "found"' });
        }
        return sendJson(res, 200, { items: await store.list({ status: status || undefined }) });
      }

      // POST /api/items
      if (req.method === 'POST' && pathname === '/api/items') {
        const data = await readJson(req);
        const validation = validateItem(data);
        if (validation.error) {
          return sendJson(res, validation.status || 400, { error: validation.error });
        }

        const item = await store.add(validation.value); // 1) persist FIRST
        events.emit('item:created', item);              // 2) then announce
        return sendJson(res, 201, { message: 'Item saved', item });
      }


      return sendJson(res, 404, { error: 'Not found' });
    } catch (error) {
      if (error.status) return sendJson(res, error.status, { error: error.message });
      console.error('[SERVER ERROR]', error);
      return sendJson(res, 500, { error: 'Internal server error' });
    }
  });

  return { server, store, events };
}

if (require.main === module) {
  const PORT = Number(process.env.PORT) || 3000;
  const { server } = createApp();
  server.listen(PORT, () => console.log(`Lost & Found API: http://localhost:${PORT}`));
}

module.exports = { createApp };
