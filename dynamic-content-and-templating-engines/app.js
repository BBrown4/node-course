const express = require('express');
// const expressHbs = require('express-handlebars');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const adminData = require('./routes/admin');
const shopRoutes = require('./routes/shop');

// app.engine(
//   'hbs',
//   expressHbs({
//     layoutsDir: 'views/layouts/',
//     defaultLayout: 'main-layout',
//     extname: 'hbs',
//   })
// );
// app.set('view engine', 'hbs');

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/admin', adminData.routes);
app.use(shopRoutes);

app.use((req, res, next) => {
  res.status(404).render('404', { pageTitle: 'Page not found', path: '' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
