const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator');
const Post = require('../models/post.model');
const User = require('../models/user.model');
const io = require('../socket');

exports.getPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;

  try {
    const totalItems = await Post.findAndCountAll();
    const posts = await Post.findAll({
      offset: (currentPage - 1) * perPage,
      limit: perPage,
    });

    res.status(200).json({
      message: 'Fetched posts successfully',
      posts: posts,
      totalItems: totalItems,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);
  }
};

exports.createPost = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed. Entered data is incorrect');
      error.statusCode = 422;
      throw error;
    }

    if (!req.file) {
      const error = new Error('No image provided');
      error.statusCode = 422;
      throw error;
    }

    const user = await User.findByPk(res.locals.decodedToken.userId);

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    const imageUrl = req.file.path;
    const title = req.body.title;
    const content = req.body.content;
    const post = await user.createPost({
      title: title,
      imageUrl: imageUrl,
      content: content,
      creator: { name: user.name },
    });

    if (!post) {
      const error = new Error('Something went wrong');
      error.statusCode = 500;
      throw error;
    }
    io.getIO().emit('posts', { action: 'create', post: post });
    res.status(201).json({
      message: 'Post created successfully',
      post: post,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getPost = async (req, res, next) => {
  try {
    const post = await Post.findByPk(req.params.postId);
    if (!post) {
      const error = new Error('Could not find post');
      error.statusCode(404);
      throw error;
    }

    res.status(200).json({
      message: 'Post fetched',
      post: post,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updatePost = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const error = new Error('Validation failed. Entered data is incorrect');
      error.statusCode = 422;
      throw error;
    }

    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image;

    if (req.file) {
      imageUrl = req.file.path;
    }

    if (!imageUrl) {
      const error = new Error('No file selected');
      error.statusCode = 422;
      throw error;
    }

    const post = await Post.findByPk(req.params.postId);
    if (!post) {
      const error = new Error('Could not find post');
      error.statusCode = 422;
      throw error;
    }

    if (post.userId !== res.locals.decodedToken.userId) {
      const error = new Error('Not authorized to edit this post');
      error.statusCode = 403;
      throw error;
    }

    if (imageUrl !== post.imageUrl) {
      clearImage(post.imageUrl);
    }

    post.title = title;
    post.content = content;
    post.imageUrl = imageUrl;

    const result = await post.save();
    res.status(200).json({ message: 'Post updated!', post: result });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findByPk(req.params.postId);
    if (!post) {
      const error = new Error('No post found');
      error.statusCode = 422;
      throw error;
    }

    if (post.userId !== res.locals.decodedToken.userId) {
      const error = new Error('Not authorized to delete this post');
      error.statusCode = 403;
      throw error;
    }

    clearImage(post.imageUrl);
    const result = await post.destroy();

    res.status(200).json({ message: 'Post deleted', result: result });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getStatus = async (req, res, next) => {
  try {
    const userId = res.locals.decodedToken.userId;
    const user = await User.findByPk(userId);

    if (!user) {
      const error = new Error('No user found');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      status: user.status,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.setStatus = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed. Status cannot be empty');
      error.statusCode = 422;
      throw error;
    }

    const userId = res.locals.decodedToken.userId;
    const user = await User.findByPk(userId);
    if (!user) {
      const error = new Error('No user found');
      error.statusCode = 404;
      throw error;
    }

    user.status = req.body.status;
    const result = await user.save();

    res.status(200).json({ message: 'Status updated', status: result.status });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const clearImage = (filePath) => {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, (err) => console.log(err));
};
