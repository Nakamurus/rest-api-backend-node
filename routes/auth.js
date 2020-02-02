const express = require('express');
const { body } = require('express-validator');

const User = require('../models/user');
const router = express.Router();
const authController = require('../controllers/auth')

router.put('/signup',
  [
      body('user.email')
        .isEmail()
        .withMessage('Please enter a valid email')
        .custom((value, { req }) => {
            return User.findOne({ email: value })
              .then(userDoc => {
                  if(userDoc) {
                      return Promise.reject('このアドレスはすでに登録済みです')
                  }
              });
        })
        .normalizeEmail(),
      body('user.password')
        .trim()
        .isLength({ min: 5 })
  ],
  authController.signup)

router.post('/login', authController.login)

module.exports = router;