const Product = require('../models/product.model');

exports.getAddProduct = (req, res) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add product',
    path: '/admin/add-product',
    editing: false,
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;

  const product = new Product(null, title, imageUrl, description, price);
  product
    .save()
    .then(() => {
      res.redirect('/');
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getEditProduct = (req, res) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }

  const prodId = req.params.productId;
  Product.fetchById(prodId, product => {
    if (!product) {
      return res.redirect('/');
    }

    res.render('admin/edit-product', {
      product: product,
      pageTitle: 'Edit product',
      path: '/admin/edit-product',
      editing: editMode,
    });
  });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImgUrl = req.body.imageUrl;
  const updatedDescription = req.body.description;
  const updatedProduct = new Product(
    prodId,
    updatedTitle,
    updatedImgUrl,
    updatedDescription,
    updatedPrice
  );

  updatedProduct.save();

  res.redirect('/admin/products');
};

exports.postDeleteProduct = (req, res, next) => {
  Product.deleteById(req.body.productId);
  res.redirect('/admin/products');
};

exports.getProducts = (req, res, next) => {
  Product.fetchAll(products => {
    res.render('admin/product-list', {
      prods: products,
      pageTitle: 'Admin products',
      path: '/admin/products',
    });
  });
};
