const express = require('express');
// const expressHbs = require('express-handlebars');
const bodyParser = require('body-parser');
const path = require('path');
const adminRoutes = require('./routes/admin.routes');
const shopRoutes = require('./routes/shop.routes');
const authRoutes = require('./routes/auth.routes');
const errorController = require('./controllers/error.controller');
const sequelize = require('./util/db');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);

const Product = require('./models/product.model');
const User = require('./models/user.model');
const Cart = require('./models/cart.model');
const CartItem = require('./models/cart-item.model');
const Order = require('./models/order.model');
const OrderItem = require('./models/order-item.model');
const { clear } = require('console');

const app = express();

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

const sessionStore = new SequelizeStore({
  db: sequelize,
});

app.use(
  session({
    secret: 'a0658ef0-6e7e-4eaa-ae07-a98388772fc8',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
  })
);

sessionStore.sync();

// app.use((req, res, next) => {
//   if (req.session.user) {
//     User.findByPk(req.session.user.id)
//       .then(user => {
//         req.user = user;
//         next();
//       })
//       .catch(err => {
//         console.log(err);
//       });
//   } else {
//     next();
//   }
// });

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem });

sequelize
  // .sync({ force: true })
  .sync()
  .then(result => {
    return User.findByPk(1);
  })
  .then(user => {
    if (!user) {
      return User.create({
        name: 'Brandon',
        email: 'brandon@firecreststudios.com',
      });
    }

    return user;
  })
  .then(user => {
    return user
      .getCart()
      .then(cart => {
        if (!cart) {
          return user.createCart();
        }

        return cart;
      })
      .catch(err => {
        console.log(err);
      });
  })
  .then(cart => {
    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  })
  .catch(err => {
    err;
  });
