const http = require('node:http');
const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
  if(req.url === "/"){
    res.end('Welcome');
  }
  else if(req.url === "/students"){
  res.end('Student Records');
  }
});
server.listen(3001, () => console.log('Visit http://localhost:3001'));
