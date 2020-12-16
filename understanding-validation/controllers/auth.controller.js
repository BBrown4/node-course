const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { Op } = require('sequelize');
const User = require('../models/user.model');
const nodemailer = require('nodemailer');
const { validationResult } = require('express-validator');
const transporter = nodemailer.createTransport({
  host: 'smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: '66912f73259652',
    pass: '540714982e9b3a',
  },
});

exports.getLogin = (req, res, next) => {
  let message = req.flash();
  let messageType;
  if (Object.keys(message).length > 0) {
    messageType = Object.keys(message)[0];
    message = message[messageType];
  } else {
    messageType = null;
    message = null;
  }

  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    user: req.session.user,
    messageType: messageType,
    message: message,
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
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      user: req.session.user,
      errorMessage: errors.array()[0].msg,
    });
  }

  bcrypt
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
    .then(() => {
      // res.redirect('/login');
      next();
      return transporter.sendMail({
        to: email,
        from: '"no-reply" <no-reply@firecreststudios.com>',
        subject: 'Registration',
        html:
          '<h1>Account registration complete!</h1> <p>This is an auto generated email, <strong>do not reply</strong></p>',
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
    res.redirect('/login');
  });
};

exports.getReset = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render('auth/reset', {
    path: '/reset-password',
    pageTitle: 'Reset password',
    errorMessage: message,
    user: req.session.user,
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      return res.redirect('/');
    }

    const token = buffer.toString('hex');
    User.findOne({ where: { email: req.body.email } })
      .then(user => {
        if (!user) {
          req.flash('error', 'No account with that email exists');
          return req.session.save(() => {
            res.redirect('/reset-password');
          });
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user
          .save()
          .then(() => {
            transporter.sendMail({
              to: req.body.email,
              from: '"no-reply" <no-reply@firecreststudios.com>',
              subject: 'Password Reset',
              html: `
                <h2>You requested a password reset</h2>
                <p>Please click <a href="http://localhost:3000/reset-password/${token}">this link</a> to set a new password.</p>
                `,
            });

            req.flash(
              'success',
              'A password reset was requested. Please check your email for further instructions'
            );

            return req.session.save(() => {
              res.redirect('/login');
            });
          })
          .catch(err => {
            console.log(err);
          });
      })
      .catch(err => {
        console.log(err);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({
    where: { resetToken: token, resetTokenExpiration: { [Op.gt]: Date.now() } },
  })
    .then(user => {
      if (!user) return res.redirect('/login');

      let message = req.flash();
      let messageType;
      if (Object.keys(message).length > 0) {
        messageType = Object.keys(message)[0];
        message = message[messageType];
      } else {
        messageType = null;
        message = null;
      }
      res.render('auth/new-password', {
        user: req.session.user,
        path: '/new-password',
        pageTitle: 'New password',
        messageType: messageType,
        message: message,
        userId: user.id.toString(),
        passwordToken: token,
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const token = req.body.passwordToken;
  let resetUser;

  User.findOne({
    where: {
      resetToken: token,
      resetTokenExpiration: { [Op.gt]: Date.now() },
      id: userId,
    },
  })
    .then(user => {
      if (!user) return res.redirect('/login');

      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then(hashedPassword => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = null;
      resetUser.resetTokenExpiration = null;
      return resetUser
        .save()
        .then(user => {
          transporter.sendMail({
            to: user.email,
            from: '"no-reply" <no-reply@firecreststudios.com>',
            subject: 'Password Updated',
            html: `
              <h2>Password reset successful!</h2>
              <p>Your password was successfully reset! If you did not reset your password, then... Sorry, I guess?</p>
              `,
          });

          req.flash('success', 'Password updated!');

          return req.session.save(() => {
            res.redirect('/login');
          });
        })
        .catch(err => {
          console.log(err);
        });
    })
    .catch(err => {
      console.log(err);
    });
};
