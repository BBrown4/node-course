const { Router } = require('express');
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.get('/logout', (req, res, next) => res.redirect('/'));
router.post('/logout', authController.postLogout);
router.get('/signup', authController.getSignup);
router.post('/signup', authController.postSignup, authController.postLogin);
router.get('/reset-password', authController.getReset);
router.post('/reset-password', authController.postReset);
router.get('/reset-password/:token', authController.getNewPassword);
router.post('/new-password', authController.postNewPassword);

module.exports = router;
