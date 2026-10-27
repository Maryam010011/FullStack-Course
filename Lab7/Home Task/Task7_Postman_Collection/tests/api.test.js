'use strict';

// Automated checks for the Lost & Found API. Run with: npm test
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createApp } = require('../server');

let server;
let base;
let tmp;

const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
);
const PDF = Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF\n');

const goodItem = {
  title: 'Black wallet',
  category: 'Accessories',
  location: 'Main Library',
  status: 'lost',
  contactName: 'Ayesha',
};

function formWith(buffer, filename, type) {
  const form = new FormData();
  form.append('attachment', new Blob([buffer], { type }), filename);
  return form;
}

async function startApp(dataDir) {
  const app = createApp({ dataDir, uploadDir: path.join(dataDir, 'uploads'), mail: false });
  await new Promise((resolve) => app.server.listen(0, '127.0.0.1', resolve));
  return { app, url: `http://127.0.0.1:${app.server.address().port}` };
}

const postItem = (url, body, raw) =>
  fetch(`${url}/api/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: raw ?? JSON.stringify(body),
  });

test.before(async () => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'lostfound-test-'));
  const started = await startApp(tmp);
  server = started.app.server;
  base = started.url;
});

test.after(() => {
  server.close();
  fs.rmSync(tmp, { recursive: true, force: true });
});

test('GET /api/items on a fresh data folder -> 200 and empty list (no crash)', async () => {
  const res = await fetch(`${base}/api/items`);
  assert.equal(res.status, 200);
  assert.deepEqual((await res.json()).items, []);
});

test('POST valid item -> 201 with string id and createdAt', async () => {
  const res = await postItem(base, goodItem);
  assert.equal(res.status, 201);
  const body = await res.json();
  assert.equal(typeof body.item.id, 'string');
  assert.equal(typeof body.item.createdAt, 'string');
});

test('NDJSON file now contains the item', () => {
  const lines = fs.readFileSync(path.join(tmp, 'items.ndjson'), 'utf8').trim().split('\n');
  assert.equal(JSON.parse(lines[0]).title, 'Black wallet');
});

test('GET /api/items?status=lost -> only lost items', async () => {
  await postItem(base, { ...goodItem, title: 'Blue umbrella', status: 'found' });
  const body = await (await fetch(`${base}/api/items?status=lost`)).json();
  assert.ok(body.items.length >= 1);
  assert.ok(body.items.every((item) => item.status === 'lost'));
});

test('GET /api/items/count -> 200 and a number', async () => {
  const body = await (await fetch(`${base}/api/items/count`)).json();
  assert.equal(typeof body.count, 'number');
  assert.equal(body.count, 2);
});

test('GET /api/items?status=stolen -> 400', async () => {
  assert.equal((await fetch(`${base}/api/items?status=stolen`)).status, 400);
});

test('POST missing title -> 400', async () => {
  assert.equal((await postItem(base, { ...goodItem, title: '' })).status, 400);
});

test('POST invalid status -> 400', async () => {
  assert.equal((await postItem(base, { ...goodItem, status: 'stolen' })).status, 400);
});

test('POST oversized text -> 400', async () => {
  assert.equal((await postItem(base, { ...goodItem, title: 'x'.repeat(101) })).status, 400);
  assert.equal((await postItem(base, { ...goodItem, description: 'y'.repeat(501) })).status, 400);
});

test('POST malformed JSON -> 400', async () => {
  assert.equal((await postItem(base, null, '{ "title": ')).status, 400);
});

test('Unknown path -> 404', async () => {
  assert.equal((await fetch(`${base}/api/not-a-route`)).status, 404);
});

test('Restart: a new server on the same data folder still lists the items', async () => {
  const second = await startApp(tmp);
  try {
    const body = await (await fetch(`${second.url}/api/items`)).json();
    assert.equal(body.items.length, 2);
  } finally {
    second.app.server.close();
  }
});

test('Attachment: valid PNG -> 201, metadata only, no filesystem path', async () => {
  const res = await fetch(`${base}/api/attachments`, { method: 'POST', body: formWith(PNG, 'evidence.png', 'image/png') });
  assert.equal(res.status, 201);
  const body = await res.json();
  assert.equal(typeof body.attachment.id, 'string');
  assert.equal(JSON.stringify(body).includes(tmp), false);
  assert.equal('storedName' in body.attachment, false);

  // The item can refer to the attachment by id
  const itemRes = await postItem(base, { ...goodItem, title: 'Phone with photo', attachmentId: body.attachment.id });
  assert.equal(itemRes.status, 201);
  assert.equal((await itemRes.json()).item.attachmentId, body.attachment.id);

  const meta = await fetch(`${base}/api/attachments/${body.attachment.id}`);
  assert.equal(meta.status, 200);
});

test('Item with unknown attachmentId -> 404', async () => {
  const res = await postItem(base, { ...goodItem, attachmentId: '00000000-0000-4000-8000-000000000000' });
  assert.equal(res.status, 404);
});

test('Attachment: valid PDF -> 201', async () => {
  const res = await fetch(`${base}/api/attachments`, { method: 'POST', body: formWith(PDF, 'receipt.pdf', 'application/pdf') });
  assert.equal(res.status, 201);
});

test('Attachment: text file -> 400', async () => {
  const res = await fetch(`${base}/api/attachments`, { method: 'POST', body: formWith(Buffer.from('hi'), 'notes.txt', 'text/plain') });
  assert.equal(res.status, 400);
});

test('Attachment: .png name but fake content -> 400', async () => {
  const res = await fetch(`${base}/api/attachments`, { method: 'POST', body: formWith(Buffer.from('not a real image'), 'fake.png', 'image/png') });
  assert.equal(res.status, 400);
});

test('Attachment: missing file field -> 400', async () => {
  const form = new FormData();
  form.append('note', 'nothing attached');
  assert.equal((await fetch(`${base}/api/attachments`, { method: 'POST', body: form })).status, 400);
});

test('Attachment: file above 2 MB -> 413', async () => {
  const big = Buffer.concat([PDF, Buffer.alloc(3 * 1024 * 1024)]);
  const res = await fetch(`${base}/api/attachments`, { method: 'POST', body: formWith(big, 'big.pdf', 'application/pdf') });
  assert.equal(res.status, 413);
});

test('Attachment: JSON instead of multipart -> 415', async () => {
  const res = await fetch(`${base}/api/attachments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  });
  assert.equal(res.status, 415);
});

test('Attachment: unknown id -> 404', async () => {
  assert.equal((await fetch(`${base}/api/attachments/00000000-0000-4000-8000-000000000000`)).status, 404);
});
