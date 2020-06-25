const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1]  // "Bearer <jwt token>"
    // jwt.verify(token, 'a_long_secret_word'); // thows error
    const decodedToken = jwt.verify(token, 'a_long_secret_word'); // thows error
    req.userData = {email: decodedToken.email , userid: decodedToken.userId}
    next();
  } catch (error) {
    res.status(401).json({
      message: 'Authentication failed!!!'
    })
  }
}
