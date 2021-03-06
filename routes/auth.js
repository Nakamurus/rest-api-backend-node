const express = require('express');
const { body } = require('express-validator');

const User = require('../models/user');
const router = express.Router();
const authController = require('../controllers/auth')

router.post('/signup',
  [
      body('email')
        .isEmail()
        .withMessage('Please enter a valid email')
        .custom((value, { req }) => {
            return User.findOne({ email: value })
              .then(userDoc => {
                  if(userDoc) {
                      return Promise.reject(new Error('Email already taken'))
                  }
              });
        })
        .normalizeEmail(),
      body('password')
        .trim()
        .isLength({ min: 5 })
  ],
  authController.signup);

router.post('/login', authController.login);

router.get('/users', authController.getUsers);

router.get('/users/:id', authController.getUser)

module.exports = router;