const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./util/db');
const { v4: uuid } = require('uuid');
const multer = require('multer');

const User = require('./models/user.model');
const Post = require('./models/post.model');

const app = express();
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },

  filename: (req, file, cb) => {
    cb(null, `${uuid()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const feedRoutes = require('./routes/feed.routes');
const authRoutes = require('./routes/auth.routes');

//app.use(bodyParser.urlencoded()); //x-www-form-urlencoded
app.use(bodyParser.json()); //application json
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;

  res.status(status).json({
    message: message,
    data: data,
  });
});

User.hasMany(Post, { onDelete: 'CASCADE', hooks: true });

sequelize
  // .sync({ force: true })
  // .sync({ alter: true })
  .sync()
  .then(() => {
    const PORT = process.env.PORT || 8080;
    const server = app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });

    const io = require('./socket').init(server);
    io.on('connection', (socket) => {
      console.log('Client connected');
    });
  })
  .catch((err) => console.log(err));