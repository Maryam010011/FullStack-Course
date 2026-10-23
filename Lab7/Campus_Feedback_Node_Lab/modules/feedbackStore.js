// Custom CommonJS module: all file access lives here.
const path = require('node:path');
const fs = require('node:fs/promises');
const { randomUUID } = require('node:crypto');

function createStore(dataDir = path.join(__dirname, '..', 'data')) {
  const coursesPath = path.join(dataDir, 'courses.json');
  const feedbackPath = path.join(dataDir, 'feedback.ndjson');

  async function listCourses() {
    const text = await fs.readFile(coursesPath, 'utf8');
    return JSON.parse(text);
  }

  async function listFeedback() {
    let text;
    try {
      text = await fs.readFile(feedbackPath, 'utf8');
    } catch (error) {
      if (error.code === 'ENOENT') return [];
      throw error;
    }
    return text.split('\n').filter(line => line.trim() !== '').map(JSON.parse);
  }

  async function saveFeedback(fields) {
    const record = {
      id: randomUUID(),
      courseId: fields.courseId,
      student: fields.student,
      rating: fields.rating,
      message: fields.message,
      createdAt: new Date().toISOString()
    };
    // NDJSON: one JSON object per line. Await disk write before reporting success.
    await fs.appendFile(feedbackPath, `${JSON.stringify(record)}\n`, 'utf8');
    return record;
  }

  return { listCourses, listFeedback, saveFeedback };
}

module.exports = { createStore };
