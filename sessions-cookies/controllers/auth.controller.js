const User = require('../models/user.model');

exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    user: req.session.user,
  });
};

exports.postLogin = (req, res, next) => {
  User.findByPk(1)
    .then(user => {
      req.session.user = user;
    })
    .then(() => {
      res.redirect('/');
    })
    .catch(err => console.log(err));
};
