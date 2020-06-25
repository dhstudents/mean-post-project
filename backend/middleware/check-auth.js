const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1]  // "Bearer <jwt token>"
    jwt.verify(token, 'a_long_secret_word'); // thows error
    next();
  } catch (error) {
    res.status(401).json({
      message: 'Authentication failed!!!'
    })
  }
}
