'use strict';

// Sends a JSON response with the given HTTP status code.
function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
  });
  res.end(payload);
}

// Reads the request body and parses it as JSON.
// Throws an Error with a .status property (400 / 413) on bad input.
async function readJson(req, limitBytes = 100 * 1024) {
  const chunks = [];
  let size = 0;

  for await (const chunk of req) {
    size += chunk.length;
    if (size > limitBytes) {
      const error = new Error('Request body too large');
      error.status = 413;
      throw error;
    }
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw.trim()) {
    const error = new Error('Request body is empty');
    error.status = 400;
    throw error;
  }

  try {
    return JSON.parse(raw);
  } catch {
    const error = new Error('Malformed JSON');
    error.status = 400;
    throw error;
  }
}

module.exports = { sendJson, readJson };
