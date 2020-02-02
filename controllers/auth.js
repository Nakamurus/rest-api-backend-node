const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.signup = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation Failed');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
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

exports.login = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;
    const user = await User.findOne({ email: email }).exec()
    if (!user) {
        const error = new Error('このメールアドレスは登録されていません')
        error.statusCode = 401;
        throw error
    }
    loadedUser = user;
    const isEqual = bcrypt.compareSync(password, user.password);
    if (!isEqual) {
        const error = new Error('パスワードが間違っています')
        error.statusCode = 401;
        throw error
    }
    const token = jwt.sign({
        email: loadedUser.email,
        userId: loadedUser._id.toString()
    },
    process.env.JWTSECRETTOKEN,
    { expiresIn: '1h'}
    );
}