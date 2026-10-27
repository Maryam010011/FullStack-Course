'use strict';

// File store for Lost & Found items.
// Public API (same in every task): add(value), list({ status }), count({ status }).

const crypto = require('node:crypto');

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

// TASK 1 version: items live only in memory (lost when the program ends).
function createStore() {
  const items = [];

  return {
    async add(value) {
      const item = buildItem(value);
      items.push(item);
      return item;
    },
    async list({ status } = {}) {
      return filterByStatus(items, status);
    },
    async count({ status } = {}) {
      return filterByStatus(items, status).length;
    },
  };
}


module.exports = { createStore, buildItem };
