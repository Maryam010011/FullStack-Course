'use strict';

// Request validation for the Lost & Found API.
// Returns { value } when valid, or { error, status } when invalid.

const STATUSES = ['lost', 'found'];

// Maximum lengths protect the file store from oversized text.
const LIMITS = {
  title: 100,
  category: 50,
  location: 100,
  contactName: 60,
  description: 500,
};

const REQUIRED_TEXT_FIELDS = ['title', 'category', 'location', 'contactName'];

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function validateItem(data) {
  if (!isPlainObject(data)) {
    return { error: 'Body must be a JSON object', status: 400 };
  }

  for (const field of REQUIRED_TEXT_FIELDS) {
    const text = data[field];
    if (typeof text !== 'string' || text.trim() === '') {
      return { error: `${field} is required`, status: 400 };
    }
    if (text.trim().length > LIMITS[field]) {
      return { error: `${field} is too long (max ${LIMITS[field]} characters)`, status: 400 };
    }
  }

  if (!STATUSES.includes(data.status)) {
    return { error: 'status must be "lost" or "found"', status: 400 };
  }

  if (data.description !== undefined) {
    if (typeof data.description !== 'string' || data.description.length > LIMITS.description) {
      return { error: `description must be text (max ${LIMITS.description} characters)`, status: 400 };
    }
  }

  const value = {
    title: data.title.trim(),
    category: data.category.trim(),
    location: data.location.trim(),
    status: data.status,
    contactName: data.contactName.trim(),
  };
  if (data.description !== undefined && data.description.trim() !== '') {
    value.description = data.description.trim();
  }

  if (data.attachmentId !== undefined) {
    const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (typeof data.attachmentId !== 'string' || !uuid.test(data.attachmentId)) {
      return { error: 'attachmentId must be an id returned by POST /api/attachments', status: 400 };
    }
    value.attachmentId = data.attachmentId.toLowerCase();
  }

  return { value };
}

module.exports = { validateItem, STATUSES, LIMITS };
