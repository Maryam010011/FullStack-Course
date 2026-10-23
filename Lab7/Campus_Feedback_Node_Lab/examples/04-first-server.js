const http = require('node:http');
const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
  res.end('Hello! This is my first Node.js server.');
});
server.listen(3001, () => console.log('Visit http://localhost:3001'));
