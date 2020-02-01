const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.signup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    bcrypt
      .hash(password, 10)
      .then(hashedPw => {
        const user = new User({
            email: email,
            password: hashedPw
        });
        return user.save()
    })
    .then(result => console.log(result))
    .catch(err => {
        throw new Error(err)
    })
}