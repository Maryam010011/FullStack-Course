const $ = id => document.getElementById(id);
const escaped = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function showResponse(method, url, status, statusText, body) {
  $('request-method').textContent = method;
  $('request-url').textContent = url;
  $('http-status').textContent = status + ' ' + statusText;
  $('response-body').textContent = JSON.stringify(body, null, 2);
}

async function request(url, options = {}) {
  const res = await fetch(url, options);
  const body = await res.json();
  showResponse(options.method || 'GET', url, res.status, res.statusText, body);
  if (!res.ok) throw new Error(body.error || `Request failed: ${res.status}`);
  return body;
}
async function loadCourses() {
  const { courses } = await request('/api/courses');
  $('course').innerHTML = courses.map(c => `<option value="${escaped(c.id)}">${escaped(c.title)} (${escaped(c.id)})</option>`).join('');
}
async function refresh() {
  const { summary } = await request('/api/summary');
  $('stats').innerHTML = summary.map(c => `<article class="course-card"><span class="code">${escaped(c.id)}</span><h3>${escaped(c.title)}</h3><div class="metrics"><div><b>${c.averageRating ?? '—'}</b> <small>/ 5</small></div><div style="text-align:right"><div class="stars">★</div><small>${c.count} reviews</small></div></div></article>`).join('');
  const { feedback } = await request('/api/feedback');
  const latest = feedback.slice().reverse().slice(0, 6);
  $('feedback-list').innerHTML = latest.length ? latest.map(f => `<article class="feedback"><div class="feedback-top"><span>${escaped(f.courseId)}</span><b>${'★'.repeat(f.rating)}${'☆'.repeat(5-f.rating)}</b></div><blockquote>“${escaped(f.message)}”</blockquote><div class="by">${escaped(f.student)} · ${new Date(f.createdAt).toLocaleDateString()}</div></article>`).join('') : '<div class="empty">No feedback yet. Be the first to submit a course review using the form.</div>';
}
$('feedback-form').addEventListener('submit', async event => {
  event.preventDefault();
  const send = $('send');
  const status = $('form-status');
  send.disabled = true;
  status.textContent = 'Sending feedback to the Node.js API…';
  status.className = '';
  try {
    const payload = {
      courseId: $('course').value,
      student: $('student').value || 'Anonymous',
      rating: Number($('rating').value),
      message: $('message').value
    };
    const created = await request('/api/feedback', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload)
    });
    status.textContent = '✓ Saved to data/feedback.ndjson. Dashboard updated!';
    status.className = 'ok';
    $('message').value = '';
    // Refresh cards/list, then restore the POST 201 response in the inspector.
    await refresh();
    showResponse('POST', '/api/feedback', 201, 'Created', created);
  } catch (error) {
    status.textContent = '✕ ' + error.message;
    status.className = 'bad';
  } finally {
    send.disabled = false;
  }
});
$('refresh').addEventListener('click', () => refresh().catch(error => {
  $('form-status').textContent = error.message;
  $('form-status').className = 'bad';
}));
(async () => {
  try { await loadCourses(); await refresh(); }
  catch (error) { $('form-status').textContent = 'Could not contact Node.js server: ' + error.message; $('form-status').className = 'bad'; }
})();
