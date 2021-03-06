const bcrypt = require('bcryptjs');
const User = require('../models/user.model');

exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    user: req.session.user,
    errorMessage: message,
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  if (req.session.user) {
    return res.redirect('/');
  }

  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    user: req.session.user,
    errorMessage: message,
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  User.findOne({ where: { email: email } })
    .then(user => {
      if (user) {
        req.flash('error', 'An account with that email already exists');
        return req.session.save(() => {
          res.redirect('/signup');
        });
      }

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
        req.flash('error', 'Invalid email');
        return req.session.save(() => {
          res.redirect('/login');
        });
      }

      bcrypt
        .compare(password, user.password)
        .then(doMatch => {
          if (!doMatch) {
            req.flash('error', 'Invalid password');
            return req.session.save(() => {
              res.redirect('/login');
            });
          }

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
