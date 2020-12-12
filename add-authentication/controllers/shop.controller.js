const Product = require('../models/product.model');
const User = require('../models/user.model');

exports.getIndex = (req, res, next) => {
  Product.findAll()
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
        user: req.session.user,
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getProducts = (req, res, next) => {
  Product.findAll()
    .then(products => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All products',
        path: '/products',
        user: req.session.user,
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getProductById = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findByPk(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        prod: product,
        pageTitle: product.title,
        path: '/products',
        user: req.session.user,
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getCart = (req, res, next) => {
  if (!req.session.user) return res.redirect('/');

  User.findByPk(req.session.user.id)
    .then(user => {
      return user.getCart();
    })
    .then(cart => {
      return cart.getProducts();
    })
    .then(products => {
      res.render('shop/cart', {
        pageTitle: 'My cart',
        path: '/cart',
        products: products,
        user: req.session.user,
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  let fetchedCart;
  let newQuantity = 1;

  User.findByPk(req.session.user.id)
    .then(user => {
      user
        .getCart()
        .then(cart => {
          fetchedCart = cart;
          return cart.getProducts({ where: { id: prodId } });
        })
        .then(products => {
          let product;
          if (products.length > 0) {
            product = products[0];
          }
          if (product) {
            const oldQuantity = product.cartItem.quantity;
            newQuantity = oldQuantity + 1;
            return product;
          }
          return Product.findByPk(prodId);
        })
        .then(product => {
          return fetchedCart.addProduct(product, {
            through: { quantity: newQuantity },
          });
        })
        .then(() => {
          res.redirect('/cart');
        })
        .catch(err => {
          console.log(err);
        });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  User.findByPk(req.session.user.id)
    .then(user => {
      return user.getCart();
    })
    .then(cart => {
      return cart.getProducts({ where: { id: req.body.productId } });
    })
    .then(products => {
      const product = products[0];
      return product.cartItem.destroy();
    })
    .then(() => {
      res.redirect('/cart');
    })
    .catch(err => {
      console.log(err);
    });
};

exports.postOrder = (req, res, next) => {
  let fetchedCart;
  let fetchedUser;

  User.findByPk(req.session.user.id)
    .then(user => {
      fetchedUser = user;
      return user.getCart();
    })
    .then(cart => {
      fetchedCart = cart;
      return cart.getProducts();
    })
    .then(products => {
      return fetchedUser
        .createOrder()
        .then(order => {
          return order.addProducts(
            products.map(product => {
              product.orderItem = { quantity: product.cartItem.quantity };
              return product;
            })
          );
        })
        .then(() => {
          return fetchedCart.setProducts(null);
        })
        .then(() => {
          res.redirect('/orders');
        })
        .catch(err => {
          console.log(err);
        });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getOrders = (req, res, next) => {
  if (!req.session.user) return res.redirect('/');

  User.findByPk(req.session.user.id)
    .then(user => {
      return user.getOrders({ include: ['products'] });
    })
    .then(orders => {
      res.render('shop/orders', {
        pageTitle: 'My orders',
        path: '/orders',
        orders: orders,
        user: req.session.user,
      });
    })
    .catch(err => {
      console.log(err);
    });
};
