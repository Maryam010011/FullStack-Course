'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const { formidable } = require('formidable');

// Private evidence uploads (image or PDF). Files go to a private folder under a
// generated name. The API only ever returns metadata, never a filesystem path.

const ALLOWED_TYPES = {
  'application/pdf': ['.pdf'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
};
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

// "Magic bytes": the first bytes of a genuine file of each type.
function matchesSignature(mime, buf) {
  if (mime === 'application/pdf') return buf.subarray(0, 4).toString('latin1') === '%PDF';
  if (mime === 'image/png') {
    return buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  }
  if (mime === 'image/jpeg') return buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  return false;
}

async function readHead(filepath, n = 16) {
  const handle = await fs.open(filepath, 'r');
  try {
    const buf = Buffer.alloc(n);
    const { bytesRead } = await handle.read(buf, 0, n, 0);
    return buf.subarray(0, bytesRead);
  } finally {
    await handle.close();
  }
}

function createAttachmentService({ uploadDir, metaFile }) {
  async function readAllMeta() {
    try {
      const text = await fs.readFile(metaFile, 'utf8');
      return text.split('\n').filter((l) => l.trim() !== '').map((l) => JSON.parse(l));
    } catch (error) {
      if (error.code === 'ENOENT') return [];
      throw error;
    }
  }

  // Safe metadata only: no stored file name, no path.
  function publicView(meta) {
    const { id, originalName, mimeType, size, uploadedAt } = meta;
    return { id, originalName, mimeType, size, uploadedAt };
  }

  // Returns { status, body } for POST /api/attachments
  async function receive(req) {
    const contentType = (req.headers['content-type'] || '').toLowerCase();
    if (!contentType.startsWith('multipart/form-data')) {
      return { status: 415, body: { error: 'Use multipart/form-data with a file field named "attachment"' } };
    }

    await fs.mkdir(uploadDir, { recursive: true });

    const form = formidable({
      uploadDir,
      maxFiles: 1,
      maxFileSize: MAX_FILE_SIZE,
      maxTotalFileSize: MAX_FILE_SIZE,
    });

    let files;
    try {
      [, files] = await form.parse(req);
    } catch (error) {
      const tooBig = error.httpCode === 413 || error.code === 1009 || error.code === 1016;
      return {
        status: tooBig ? 413 : 400,
        body: { error: tooBig ? 'File is too large (max 2 MB)' : 'Upload could not be processed' },
      };
    }

    const file = files.attachment?.[0];
    if (!file) {
      return { status: 400, body: { error: 'No file received in field "attachment"' } };
    }

    const ext = path.extname(file.originalFilename || '').toLowerCase();
    const mime = file.mimetype;
    const typeOk = Boolean(ALLOWED_TYPES[mime]) && ALLOWED_TYPES[mime].includes(ext);
    const contentOk = typeOk && matchesSignature(mime, await readHead(file.filepath));

    if (!typeOk || !contentOk) {
      await fs.unlink(file.filepath).catch(() => {});
      return { status: 400, body: { error: 'Only PDF, PNG or JPEG files with matching content are accepted' } };
    }

    const id = crypto.randomUUID();
    const storedName = `${id}${ext}`;
    await fs.rename(file.filepath, path.join(uploadDir, storedName));

    const meta = {
      id,
      originalName: path.basename(file.originalFilename),
      mimeType: mime,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      storedName, // kept server-side only
    };
    await fs.mkdir(path.dirname(metaFile), { recursive: true });
    await fs.appendFile(metaFile, `${JSON.stringify(meta)}\n`, 'utf8');

    return { status: 201, body: { message: 'Attachment uploaded', attachment: publicView(meta) } };
  }

  // Returns safe metadata for one attachment, or null when the id is unknown.
  async function get(id) {
    const meta = (await readAllMeta()).find((m) => m.id === id);
    return meta ? publicView(meta) : null;
  }

  return { receive, get };
}

module.exports = { createAttachmentService, ALLOWED_TYPES, MAX_FILE_SIZE };
