exports.getPosts = (req, res, next) => {
  res.status(200).json({
    posts: [{ title: 'First post', content: 'This is the first post!' }],
  });
};

exports.createPost = (req, res, next) => {
  const title = req.body.title;
  const content = req.body.content;
  //create a post in the db
  res.status(201).json({
    message: 'Post created succesfully',
    post: { id: new Date().toISOString(), title: title, content: content },
  });
};
