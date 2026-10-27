// Lab 6: built-in HTTP module + custom modules + file storage (no Express).
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const { EventEmitter } = require('node:events');
const { createStore } = require('./modules/feedbackStore');
const { validateFeedback } = require('./modules/validator');
const { sendJson, readJson } = require('./modules/httpHelpers');

function createApp({ store = createStore(), events = new EventEmitter() } = {}) {
  // Demonstrates the lecture's EventEmitter: emit AFTER persistence succeeds.
  events.on('feedback:saved', record => {
    console.log(`Event: saved ${record.courseId} 
      feedback (${record.rating}/5)`);
  });
//event to make file autdit log to save record or frrdback like in console 

  events.on('feedback:saved', record => {
    const logMessage = `Feedback saved for course ${record.courseId} with rating ${record.rating}/5\n`;
    fs.appendFile('audit.log', logMessage)
      .then(() => {
        console.log('Audit log updated.');
      })
      .catch(err => {
        console.error('Error writing to audit log:', err);
      });
  });



  async function servePage(res, filename, type) {
    const file = await fs.readFile(path.join(__dirname, 'public', filename));
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' });
    res.end(file);
  }

  return http.createServer(async (req, res) => {
    const { pathname, searchParams } = new URL(req.url, 'http://localhost');
    console.log(`${req.method} ${pathname}`);
    try {
      if (req.method === 'GET' && pathname === '/') {
        return await servePage(res, 'index.html', 'text/html; charset=utf-8');
      }
      if (req.method === 'GET' && pathname === '/style.css') {
        return await servePage(res, 'style.css', 'text/css; charset=utf-8');
      }
      if (req.method === 'GET' && pathname === '/app.js') {
        return await servePage(res, 'app.js', 'text/javascript; charset=utf-8');
      }
      if (req.method === 'GET' && pathname === '/api/health') {
        return sendJson(res, 200, { status: 'ok', message: 'Campus Feedback API is running' });
      }
      if (req.method === 'GET' && pathname === '/api/courses') {
        return sendJson(res, 200, { courses: await store.listCourses() });
      }
      if (req.method === 'GET' && pathname === '/api/feedback') {
        const records = await store.listFeedback();
        const course = searchParams.get('course');
        const feedback = course ? records.filter(r => r.courseId === course.toUpperCase()) : records;
        return sendJson(res, 200, { feedback, count: feedback.length });
      }
      if (req.method === 'GET' && pathname === '/api/summary') {
        const [courses, records] = await Promise.all([store.listCourses(), store.listFeedback()]);
        const summary = courses.map(course => {
          const entries = records.filter(r => r.courseId === course.id);
          return {
            ...course,
            count: entries.length,
            averageRating: entries.length
              ? Number((entries.reduce((n, r) => n + r.rating, 0) / entries.length).toFixed(1))
              : null
          };
        });
        return sendJson(res, 200, { summary });
      }
      if (req.method === 'POST' && pathname === '/api/feedback') {
        const data = await readJson(req);
        const courses = await store.listCourses();
        const result = validateFeedback(data, courses);
        if (result.error) return sendJson(res, result.status || 400, { error: result.error });
        const record = await store.saveFeedback(result.value);  // persist FIRST
        events.emit('feedback:saved', record);              // announce AFTER save
        return sendJson(res, 201, { message: 'Feedback saved', feedback: record });
      }
      if (pathname.startsWith('/api/')) {
        return sendJson(res, 404, { error: 'API endpoint not found.' });
      }
      return sendJson(res, 404, { error: 'Page not found.' });
    } catch (error) {
      const status = error.status || 500;
      if (status === 500) console.error('Server error:', error);
      if (!res.headersSent) sendJson(res, status, { error: status === 500 ? 'Internal server error.' : error.message });
      else res.end();
    }
  });
}

if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  createApp().listen(port, () => {
    console.log(`Campus Feedback API: http://localhost:${port}`);
    console.log(`API example: http://localhost:${port}/api/courses`);
  });
}

module.exports = { createApp };
