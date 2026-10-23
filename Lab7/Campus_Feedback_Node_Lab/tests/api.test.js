const { test } = require('node:test');
const assert = require('node:assert/strict');
const os = require('node:os');
const path = require('node:path');
const fs = require('node:fs/promises');
const { createApp } = require('../server');
const { createStore } = require('../modules/feedbackStore');

test('Campus Feedback API: CRUD basics, validation and persistence', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'campus-feedback-'));
  await fs.writeFile(path.join(dir, 'courses.json'), JSON.stringify([{id:'WEB',title:'Full Stack Web'}]));
  const server = createApp({ store: createStore(dir) });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    let r = await fetch(`${base}/api/health`);
    assert.equal(r.status, 200);
    r = await fetch(`${base}/api/courses`);
    assert.deepEqual((await r.json()).courses.map(c=>c.id),['WEB']);
    r = await fetch(`${base}/api/feedback`);
    assert.equal((await r.json()).count,0);
    const valid = {courseId:'WEB',student:'Test',rating:5,message:'Great practical lab!'};
    r = await fetch(`${base}/api/feedback`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(valid)});
    assert.equal(r.status,201);
    const created=(await r.json()).feedback;
    assert.equal(created.courseId,'WEB');
    assert.ok(created.id);
    const disk=await fs.readFile(path.join(dir,'feedback.ndjson'),'utf8');
    assert.ok(disk.includes('Great practical lab!'));
    r=await fetch(`${base}/api/feedback?course=WEB`);
    assert.equal((await r.json()).count,1);
    r=await fetch(`${base}/api/summary`);
    assert.equal((await r.json()).summary[0].averageRating,5);
    r=await fetch(`${base}/api/feedback`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...valid,rating:7})});
    assert.equal(r.status,400);
    r=await fetch(`${base}/api/feedback`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...valid,courseId:'ZZZ'})});
    assert.equal(r.status,404);
    r=await fetch(`${base}/api/feedback`,{method:'POST',headers:{'Content-Type':'application/json'},body:'{invalid'});
    assert.equal(r.status,400);
    r=await fetch(`${base}/api/unknown`);
    assert.equal(r.status,404);
    r=await fetch(`${base}/`);
    assert.equal(r.status,200);
    assert.ok((await r.text()).includes('Give your course'));
  } finally {
    await new Promise((resolve,reject)=>server.close(err=>err?reject(err):resolve()));
    await fs.rm(dir,{recursive:true,force:true});
  }
});
