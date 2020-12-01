const http = require('http');
const routes = require('./routes');

const server = http.createServer((req, res) => {
  routes(req, res);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
