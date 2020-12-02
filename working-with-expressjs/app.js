const express = require('express');
const app = express();

app.use((req, res, next) => {
  console.log("I'm in the middleware");
  next(); //allows the request to continue to the next middleware in line
});

app.use((req, res, next) => {
  console.log("I'm in the next middleware");
  res.send('<h1>Hello from express</h1>');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
