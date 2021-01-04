const User = require('../models/user.model');
const Post = require('../models/post.model');
const bcrypt = require('bcrypt');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const jwtSecret = 'd8315c0d-d54f-4c1d-9a40-af883d602591'; //consider storing this in some sort of config file
const { clearImage } = require('../util/file');

module.exports = {
  createUser: async function ({ userInput }, req) {
    // const email = args.userInput.email;
    const errors = [];
    if (!validator.isEmail(userInput.email)) {
      errors.push({ message: 'Email is invalid' });
    }

    if (
      validator.isEmpty(userInput.password) ||
      !validator.isLength(userInput.password, { min: 5 })
    ) {
      errors.push({ message: 'Password too short' });
    }

    if (errors.length > 0) {
      const error = new Error('Invalid input');
      error.data = errors;
      error.code = 422;
      throw error;
    }

    const existingUser = await User.findOne({
      where: { email: userInput.email },
    });
    if (existingUser) {
      const error = new Error(
        'An account with this email address already exists'
      );
      throw error;
    }

    const hashedPassword = await bcrypt.hash(userInput.password, 12);
    const user = await User.create({
      email: userInput.email,
      name: userInput.name,
      password: hashedPassword,
    });

    return { ...user.dataValues };
  },

  login: async function ({ email, password }) {
    const user = await User.findOne({ where: { email: email } });
    if (!user) {
      const error = new Error('No account with that email address found');
      error.code = 401;
      throw error;
    }

    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error('Invalid password');
      error.code = 401;
      throw error;
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      jwtSecret,
      { expiresIn: '1h' }
    );
    return { token: token, userId: user.id };
  },

  createPost: async function ({ postInput }, req) {
    if (!req.isAuth) {
      const error = new Error('Not authenticated');
      error.code = 401;
      throw error;
    }

    const errors = [];
    if (
      validator.isEmpty(postInput.title) ||
      !validator.isLength(postInput.title, { min: 3 })
    ) {
      errors.push({ message: 'Title must be at least 3 characters' });
    }

    if (
      validator.isEmpty(postInput.content) ||
      !validator.isLength(postInput.content, { min: 3 })
    ) {
      errors.push({ message: 'Content must be at least 3 characters' });
    }

    if (errors.length > 0) {
      const error = new Error('Invalid input');
      error.data = errors;
      error.code = 422;
      throw error;
    }

    const user = await User.findByPk(req.userId);
    if (!user) {
      const error = new Error('No user found');
      error.data = errors;
      error.code = 401;
      throw error;
    }

    const post = await user.createPost({
      title: postInput.title,
      content: postInput.content,
      imageUrl: postInput.imageUrl,
      creator: { name: user.name },
    });

    return { ...post.dataValues };
  },
  posts: async function ({ page }, req) {
    if (!req.isAuth) {
      const error = new Error('Not authenticated');
      error.code = 401;
      throw error;
    }

    if (!page) {
      page = 1;
    }

    const perPage = 2;
    const totalPosts = await Post.findAndCountAll();
    const posts = await Post.findAll({
      offset: (page - 1) * perPage,
      limit: perPage,
      order: [['createdAt', 'DESC']],
    });

    return {
      posts: posts.map((p) => {
        return {
          ...p.dataValues,
          createdAt: p.dataValues.createdAt.toISOString(),
        };
      }),
      totalPosts: totalPosts.count,
    };
  },
  post: async function ({ id }, req) {
    if (!req.isAuth) {
      const error = new Error('Not authenticated');
      error.code = 401;
      throw error;
    }

    const post = await Post.findByPk(id, { include: User });
    if (!post) {
      throw new Error('Post not found');
    }

    const result = {
      ...post.dataValues,
      creator: { ...post.dataValues.user.dataValues },
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    };

    //cleanup the object that we're returning
    delete result.user;
    delete result.creator.password;

    return result;
  },
  updatePost: async function ({ id, postInput }, req) {
    if (!req.isAuth) {
      const error = new Error('Not authenticated');
      error.code = 401;
      throw error;
    }

    const post = await Post.findByPk(id);

    if (!post) {
      throw new Error('Post not found');
    }

    if (post.userId !== req.userId) {
      const error = new Error('Not authorized');
      error.code = 403;
      throw error;
    }

    const errors = [];
    if (
      validator.isEmpty(postInput.title) ||
      !validator.isLength(postInput.title, { min: 3 })
    ) {
      errors.push({ message: 'Title must be at least 3 characters' });
    }

    if (
      validator.isEmpty(postInput.content) ||
      !validator.isLength(postInput.content, { min: 3 })
    ) {
      errors.push({ message: 'Content must be at least 3 characters' });
    }

    if (errors.length > 0) {
      const error = new Error('Invalid input');
      error.data = errors;
      error.code = 422;
      throw error;
    }

    post.title = postInput.title;
    post.content = postInput.content;
    if (postInput.imageUrl !== 'undefined') {
      post.imageUrl = postInput.imageUrl;
    }
    const updatedPost = await post.save();

    return {
      ...updatedPost.dataValues,
      createdAt: updatedPost.createdAt.toISOString(),
      updatedAt: updatedPost.updatedAt.toISOString(),
    };
  },
  deletePost: async function ({ id }, req) {
    if (!req.isAuth) {
      const error = new Error('Not authenticated');
      error.code = 401;
      throw error;
    }

    const post = await Post.findByPk(id);
    if (!post) {
      const error = new Error('Post not found');
      error.code = 404;
      throw error;
    }

    if (post.userId !== req.userId) {
      const error = new Error('Not authorized');
      error.code = 403;
      throw error;
    }
    clearImage(post.imageUrl);
    await post.destroy();
    return true;
  },
  user: async function (args, req) {
    if (!req.isAuth) {
      const error = new Error('Not authenticated');
      error.code = 401;
      throw error;
    }
    const user = await User.findByPk(req.userId);
    if (!user) {
      const error = new Error('User not found');
      error.code = 404;
      throw error;
    }

    return { ...user.dataValues };
  },
  updateStatus: async function ({ status }, req) {
    if (!req.isAuth) {
      const error = new Error('Not authenticated');
      error.code = 401;
      throw error;
    }
    const user = await User.findByPk(req.userId);
    if (!user) {
      const error = new Error('User not found');
      error.code = 404;
      throw error;
    }

    user.status = status;
    await user.save();

    return { ...user.dataValues };
  },
};
