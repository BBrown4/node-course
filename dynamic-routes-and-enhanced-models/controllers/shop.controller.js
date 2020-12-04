const Product = require('../models/product.model');

exports.getProducts = (req, res, next) => {
  Product.fetchAll(products => {
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All products',
      path: '/products',
    });
  });
};

exports.getProductById = (req, res, next) => {
  const prodId = req.params.productId;
  Product.fetchById(prodId, product => {
    res.render('shop/product-detail', {
      prod: product,
      pageTitle: product.title,
      path: '/products',
    });
  });
};

exports.getIndex = (req, res, next) => {
  Product.fetchAll(products => {
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/',
    });
  });
};

exports.getCart = (req, res, next) => {
  res.render('shop/cart', { pageTitle: 'My cart', path: '/cart' });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  console.log(prodId);
  res.redirect('/cart');
};

exports.getOrders = (req, res, next) => {
  res.render('shop/orders', { pageTitle: 'My orders', path: '/orders' });
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', { pageTile: 'Checkout', path: '/checkout' });
};
