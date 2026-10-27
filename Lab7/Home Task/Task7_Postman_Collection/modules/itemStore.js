'use strict';

// File store for Lost & Found items.
// Public API (same in every task): add(value), list({ status }), count({ status }).

const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');

// Turns validated input into the final item object.
// Item shape: id, title, category, location, status, contactName, createdAt
// (+ optional description, attachmentId)
function buildItem(value) {
  return {
    id: crypto.randomUUID(),
    ...value,
    createdAt: new Date().toISOString(),
  };
}

function filterByStatus(items, status) {
  return status ? items.filter((item) => item.status === status) : items;
}


// TASK 2 version: one JSON object per line (NDJSON) in a file.
function createStore(filePath) {
  async function readAll() {
    let text;
    try {
      text = await fs.readFile(filePath, 'utf8');
    } catch (error) {
      if (error.code === 'ENOENT') return []; // file not created yet = no items yet
      throw error;
    }

    const items = [];
    for (const line of text.split('\n')) {
      if (line.trim() === '') continue;
      try {
        items.push(JSON.parse(line));
      } catch {
        console.warn('[STORE WARNING] Skipped a damaged line in', path.basename(filePath));
      }
    }
    return items;
  }

  return {
    async add(value) {
      const item = buildItem(value);
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.appendFile(filePath, `${JSON.stringify(item)}\n`, 'utf8');
      return item;
    },
    async list({ status } = {}) {
      return filterByStatus(await readAll(), status);
    },
    async count({ status } = {}) {
      return filterByStatus(await readAll(), status).length;
    },
  };
}

module.exports = { createStore, buildItem };
