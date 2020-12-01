const requestHandler = (req, res) => {
  const url = req.url;
  const method = req.method;

  if (url === '/') {
    res.write('<html>');
    res.write('<head><title>Module 1 - Assignment 1</title></head>');
    res.write(
      '<body><h1>Hello, there!</h1><form action="/create-user" method="POST"><input type="text" name="username" placeholder="Enter username" /><button type="submit">Submit</button></form></body>'
    );
    res.write('</html>');
    return res.end();
  }

  if (url === '/users') {
    res.write('<html>');
    res.write('<head><title>Module 1 - Assignment 1</title></head>');
    res.write('<body><h1>Users</h1>');
    res.write('<ul>');
    res.write('<li>Brandon</li>');
    res.write('<li>Catherine</li>');
    res.write('<li>Lucy</li>');
    res.write('<li>Netta</li>');
    res.write('</ul>');
    res.write('</body>');
    res.write('</html>');
    return res.end();
  }

  if (url === '/create-user' && method === 'POST') {
    const body = [];
    req.on('data', chunk => {
      body.push(chunk);
    });

    return req.on('end', () => {
      const parsedBody = Buffer.concat(body).toString();
      const username = parsedBody.split('=')[1];
      console.log(username);

      res.writeHead(302, { Location: '/' });
      return res.end();
    });
  }
};

module.exports = requestHandler;
