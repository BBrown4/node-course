const { Router } = require('express');
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.get('/logout', (req, res, next) => res.redirect('/'));
router.post('/logout', authController.postLogout);

module.exports = router;
