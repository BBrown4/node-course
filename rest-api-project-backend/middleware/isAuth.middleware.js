const jwt = require('jsonwebtoken');
const jwtSecret = 'd8315c0d-d54f-4c1d-9a40-af883d602591'; //consider storing this in some sort of config file

module.exports = (req, res, next) => {
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    const error = new Error('Authorization header not found');
    error.statusCode = 401;
    throw error;
  }
  const token = authHeader.split(' ')[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, jwtSecret);
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }

  if (!decodedToken) {
    const error = new Error('Not authenticated');
    error.statusCode = 401;
    throw error;
  }

  req.userId = decodedToken.userId; //this doesn't seem to be doing anything?
  res.locals.decodedToken = decodedToken;
  next();
};
