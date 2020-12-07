const express = require('express');
// const expressHbs = require('express-handlebars');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const adminRoutes = require('./routes/admin.routes');
const shopRoutes = require('./routes/shop.routes');
const errorController = require('./controllers/error.controller');
const sequelize = require('./util/db');

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
app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

sequelize
  .sync()
  .then(result => {
    // console.log(result);

    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  })
  .catch(err => {
    err;
  });
