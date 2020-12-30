const User = require('../models/user.model');
const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');
const jwtSecret = 'd8315c0d-d54f-4c1d-9a40-af883d602591'; //consider storing this in some sort of config file

exports.signup = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed');
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }

    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    const hashedPassword = await bcrypt.hash(password, 12);
    const result = await User.create({
      email: email,
      name: name,
      password: hashedPassword,
    });

    res.status(201).json({ message: 'User created!', userId: result.id });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const user = await User.findOne({ where: { email: email } });
    if (!user) {
      const error = new Error('No account with that email was found');
      error.statusCode = 401;
      throw error;
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      const error = new Error('Invalid password');
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, jwtSecret, {
      expiresIn: '1h',
    });

    res.status(200).json({ token: token, userId: user.id });
  } catch (err) {
    console.log(err);
    if (!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);
  }
};
