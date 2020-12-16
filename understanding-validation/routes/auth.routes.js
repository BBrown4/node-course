const { Router } = require('express');
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const User = require('../models/user.model');

router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.get('/logout', (req, res, next) => res.redirect('/'));
router.post('/logout', authController.postLogout);
router.get('/signup', authController.getSignup);
router.post(
  '/signup',
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .custom((value, { req }) => {
      return User.findOne({ where: { email: value } }).then(user => {
        if (user) {
          return Promise.reject(
            'An account with that email is already registered'
          );
        }
      });
    }),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  }),
  authController.postSignup,
  authController.postLogin
);
router.get('/reset-password', authController.getReset);
router.post('/reset-password', authController.postReset);
router.get('/reset-password/:token', authController.getNewPassword);
router.post('/new-password', authController.postNewPassword);

module.exports = router;
