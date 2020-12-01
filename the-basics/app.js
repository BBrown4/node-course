const http = require('http');

const server = http.createServer((req, res) => {
  const url = req.url;
  if (url === '/') {
    res.write('<html>');
    res.write('<head><title>Enter message</title></head>');
    res.write('<body><form></form></body>');
    res.write('</html>');
  }

  res.setHeader('Content-Type', 'text/html');

  res.end();
});

server.listen(3000);
