const Post = require('../models/post');

exports.createPost = (req, res, next) => {
    const title = req.body.title;
    const content = req.body.content;
    const post = new Post({
        title: title,
        content: content,
    });
    post.save()
      .then(result => console.log(result))
      .catch(err => console.log(err))
}