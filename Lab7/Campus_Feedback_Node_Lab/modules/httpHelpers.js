function sendJson(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(JSON.stringify(data));
}

async function readJson(req) {
  const contentType = String(req.headers['content-type'] || '');
  if (!contentType.toLowerCase().includes('application/json')) {
    const error = new Error('Content-Type must be application/json.');
    error.status = 415;
    throw error;
  }
  let text = '';
  for await (const chunk of req) {
    text += chunk.toString();
    if (text.length > 20_000) {
      const error = new Error('Request body is too large.');
      error.status = 413;
      throw error;
    }
  }
  try {
    if (!text.trim()) throw new Error('empty');
    return JSON.parse(text);
  } catch {
    const error = new Error('Body must contain valid JSON.');
    error.status = 400;
    throw error;
  }
}

module.exports = { sendJson, readJson };
