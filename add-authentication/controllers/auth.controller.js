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
      req.session.save(err => {
        if (err) return console.log(err);

        res.redirect('/');
      });
    })
    .catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};
