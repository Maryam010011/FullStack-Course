'use strict';

// Task 8: scripted demonstration of the whole flow.
//   POST valid item -> 201 -> NDJSON changes -> GET shows it -> restart -> still there
//   -> one validation failure -> optional upload / local SMTP notice
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const PORT = 3100;
const BASE = `http://127.0.0.1:${PORT}`;
const DATA_DIR = path.join(__dirname, 'demo-data');
const NDJSON = path.join(DATA_DIR, 'items.ndjson');
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
);

let child;

function startServer() {
  return new Promise((resolve, reject) => {
    child = spawn(process.execPath, ['server.js'], {
      cwd: __dirname,
      env: { ...process.env, PORT: String(PORT), DATA_DIR, UPLOAD_DIR: path.join(DATA_DIR, 'uploads') },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    child.stdout.on('data', (chunk) => {
      const text = chunk.toString();
      process.stdout.write(`   [server] ${text}`);
      if (text.includes('Lost & Found API')) resolve();
    });
    child.stderr.on('data', (chunk) => process.stdout.write(`   [server!] ${chunk}`));
    child.on('error', reject);
  });
}

function stopServer() {
  return new Promise((resolve) => {
    child.once('exit', resolve);
    child.kill();
  });
}

const step = (text) => console.log(`\n=== ${text} ===`);

async function show(label, res) {
  console.log(`${label} -> HTTP ${res.status}`);
  console.log(JSON.stringify(await res.json(), null, 2));
}

async function main() {
  fs.rmSync(DATA_DIR, { recursive: true, force: true });

  step('1. Start the server with an empty data folder');
  await startServer();

  step('2. POST a valid item (expect 201)');
  await show('POST /api/items', await fetch(`${BASE}/api/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Black wallet', category: 'Accessories', location: 'Main Library', status: 'lost', contactName: 'Ayesha' }),
  }));

  step('3. The NDJSON file changed');
  console.log(fs.readFileSync(NDJSON, 'utf8'));

  step('4. GET /api/items shows the item');
  await show('GET /api/items', await fetch(`${BASE}/api/items`));

  step('5. Restart the server');
  await stopServer();
  console.log('   server stopped');
  await startServer();

  step('6. GET after restart: the item is still there');
  await show('GET /api/items', await fetch(`${BASE}/api/items`));

  step('7. Validation failure: missing title (expect 400)');
  await show('POST /api/items', await fetch(`${BASE}/api/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category: 'Accessories', location: 'Main Library', status: 'lost', contactName: 'Ayesha' }),
  }));

  step('8. Optional: private upload (expect 201 with metadata only)');
  const form = new FormData();
  form.append('attachment', new Blob([PNG], { type: 'image/png' }), 'evidence.png');
  await show('POST /api/attachments', await fetch(`${BASE}/api/attachments`, { method: 'POST', body: form }));

  step('9. Optional: found item (local SMTP notice)');
  console.log('   Run "npm run smtp" in another terminal BEFORE this demo to see the raw email there.');
  console.log('   Without it you will see a harmless [MAIL WARNING] and the item is still saved.');
  await show('POST /api/items', await fetch(`${BASE}/api/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Blue umbrella', category: 'Accessories', location: 'Cafeteria', status: 'found', contactName: 'Hamza' }),
  }));
  await new Promise((resolve) => setTimeout(resolve, 500));

  await stopServer();
  console.log('\nDemo finished. Demo data is in ./demo-data (safe to delete).');
}

main().catch(async (error) => {
  console.error('Demo failed:', error.message);
  if (child) await stopServer();
  process.exitCode = 1;
});
