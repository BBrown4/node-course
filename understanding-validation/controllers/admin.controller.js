const Product = require('../models/product.model');
const User = require('../models/user.model');

exports.getAddProduct = (req, res) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add product',
    path: '/admin/add-product',
    editing: false,
    user: req.session.user,
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;

  User.findByPk(req.session.user.id)
    .then(user => {
      return user.createProduct({
        title: title,
        price: price,
        imageUrl: imageUrl,
        description: description,
      });
    })
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

  User.findByPk(req.session.user.id)
    .then(user => {
      return user.getProducts({ where: { id: prodId } });
    })
    .then(products => {
      const product = products[0];
      if (!product) return res.redirect('/admin/products');

      res.render('admin/edit-product', {
        product: product,
        pageTitle: 'Edit product',
        path: '/admin/edit-product',
        editing: editMode,
        user: req.session.user,
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImgUrl = req.body.imageUrl;
  const updatedDescription = req.body.description;

  Product.findByPk(prodId)
    .then(product => {
      if (product.userId !== req.session.user.id) return next();

      product.title = updatedTitle;
      product.price = updatedPrice;
      product.imageUrl = updatedImgUrl;
      product.description = updatedDescription;

      return product.save();
    })
    .then(() => {
      res.redirect('/admin/products');
    })
    .catch(err => {
      console.log(err);
    });
};

exports.postDeleteProduct = (req, res, next) => {
  Product.findByPk(req.body.productId)
    .then(product => {
      if (product.userId !== req.session.user.id) return next();

      return product.destroy();
    })
    .then(() => {
      res.redirect('/admin/products');
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getProducts = (req, res, next) => {
  User.findByPk(req.session.user.id)
    .then(user => {
      return user.getProducts();
    })
    .then(products => {
      res.render('admin/product-list', {
        prods: products,
        pageTitle: 'Admin products',
        path: '/admin/products',
        user: req.session.user,
      });
    })
    .catch(err => {
      console.log(err);
    });
};
