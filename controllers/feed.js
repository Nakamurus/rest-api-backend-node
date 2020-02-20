const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator');

const Post = require('../models/post');
const User = require('../models/user');

exports.getPosts = async (req, res, next) => {
    const currentPage = req.query.page || 1;
    const perPage = 5;
    let totalItems;
    try {
        const totalItems = await Post.find().countDocuments()
        const posts = await Post
            .find()
            .populate('creator')
            .skip((currentPage - 1) * perPage)
            .limit(perPage);
        res.status(200).json(
            {
                message: "fetched posts successfully",
                posts: posts,
                totalItems: totalItems
            }
        )
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err)
    }
}

exports.createPost = async (req, res, next) => {
    console.log(req)
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //     const error = new Error('Validation failed, entered data is incorrect');
    //     error.statusCode = 422;
    //     throw error;
    // }
    const title = req.body.title;
    const content = req.body.content;
    let creator;
    const post = new Post({
        title: title,
        content: content,
        // creator: req.userId
    });
    try {
        post.save()
        user = await User.findById(req.userId);
        creator = user;
        user.posts.push(post);
        user.save()
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }

}

exports.getPost = async (req, res, next) => {
    const postId = req.params.postId;
    try {
        const post = await Post.findById(postId);
        res.status(200).json({
            message: 'Post Fetched',
            post: post
        })
    } catch (error) {
        if(!error.statusCode) {
            error.statusCode = 500;
        }
        next(error)
    }

}

exports.deletePost = async (req, res, next) => {
    const postId = req.params.postId;
    try {
        const post = Post.findById(postId);
        if (post.creator.toString() !== req.userId) {
            const error = new Error('Not authorized');
            error.statusCode = 403;
            throw error;
        }
        clearImage(post.imageUrl);
        Post.findByIdAndRemove(postId)
        const user = await User.findById(req.userId);
        user.posts.pull(postId);
        user.save();
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log(err));
}