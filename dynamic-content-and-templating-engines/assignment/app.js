const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const users = [];

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));

app.get('/users', (req, res, next) => {
  res.render('users', { pageTitle: 'Users', users: users, path: '/users' });
});

app.get('/', (req, res, next) => {
  res.render('add-user', { pageTitle: 'Add user', path: '/' });
});

app.post('/', (req, res, next) => {
  users.push({ name: req.body.user });
  res.redirect('/');
});

app.use((req, res, next) => {
  res
    .status(404)
    .render('404', { pageTitle: '404 - Page not found', path: '' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
