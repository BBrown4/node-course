const {validationResult} = require('express-validator');
const Post = require('../models/post.model');

exports.getPosts = (req, res, next) => {
    res.status(200).json({
        posts: [{
            id: '1',
            title: 'First post',
            content: 'This is the first post!',
            imageUrl: 'images/profile-avatar.png',
            creator: {name: 'Brandon'},
            createdAt: new Date()
        }],
    });
};

exports.createPost = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            message: 'Validation failed. Entered data is incorrect',
            errors: errors.array()
        });
    }
    const title = req.body.title;
    const content = req.body.content;
    //create a post in the db

    Post.create({
        title: title,
        imageUrl: 'images/profile-avatar.png',
        content: content,
        creator: {
            name: 'Brandon',
        }
    }).then(result => {
        console.log(result);
        res.status(201).json({
            message: 'Post created successfully',
            post: result
        });
    }).catch(err => {
        console.log(err);
    });
};
