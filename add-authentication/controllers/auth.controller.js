const bcrypt = require('bcryptjs');
const User = require('../models/user.model');

exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    user: req.session.user,
  });
};

exports.getSignup = (req, res, next) => {
  if (req.session.user) {
    return res.redirect('/');
  }

  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    user: req.session.user,
  });
};
exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  User.findOne({ where: { email: email } })
    .then(user => {
      if (user) return res.redirect('/signup');

      return bcrypt
        .hash(password, 12)
        .then(hash => {
          return User.create({
            email: email,
            password: hash,
          });
        })
        .then(user => {
          if (user) {
            user.createCart();
          }
        })
        .then(result => {
          // res.redirect('/login');
          next();
        })
        .catch(err => {
          console.log(err);
        });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ where: { email: email } })
    .then(user => {
      if (!user) {
        return res.redirect('/login');
      }
      bcrypt
        .compare(password, user.password)
        .then(doMatch => {
          if (!doMatch) return res.redirect('/login');

          req.session.user = user;
          req.session.save(err => {
            if (err) return console.log(err);

            res.redirect('/');
          });
        })
        .catch(err => {
          console.log(err);
          res.redirect('/login');
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
