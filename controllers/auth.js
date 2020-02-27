const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.signup = (req, res, next) => {
    console.log(req.body)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation Failed');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    bcrypt
      .hash(password, 10)
      .then(hashedPw => {
        const user = new User({
            email: email,
            username: username,
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
    console.log(req.body)
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
    console.log({token: token, userId: loadedUser._id.toString() })
    return res.status(200).json({token: token, userId: loadedUser._id.toString() })
}

exports.getUsers = async (req, res, next) => {
    const currentPage = req.query.page || 1;
    console.log(currentPage)
    const perPage = 2;
    let totalUsers;
    try {
        const totalUsers = await User.find().countDocuments()
        const users = await User
          .find()
          .skip((currentPage - 1) * perPage)
          .limit(perPage);
        res.status(200).json(
            {
                message: "fetched users successfuly",
                users: users,
                totalItems: totalUsers,
                currentPage: currentPage
            }
        )
        console.log(users)
    } catch (error) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err)
    }
}

exports.getUser = async (req, res, next) => {
    const userId = req.params.id;
    console.log(userId)
    try {
        const user = await User.findById(userId);
        if (!user) {
            res.send({ message: `There's not a user with this userId` })
        }
        const email = user.email;
        const username = user.username;
        console.log(user)
        res.status(200).json({ email: email, username: username })
    } catch (error) {
        next(error)
    }
}

exports.deleteUser = async (req, res, next) => {
    const userId = req.body.id;
    try {
        const user = User.findById(userId);
        if(user._id.toString() !== userId) {
            const error = new Error('Not authorized');
            error.statusCode = 403;
            throw error;
        }
        User.findByIdAndRemove(userId)
    } catch (error) {
        next(error);
    }
}