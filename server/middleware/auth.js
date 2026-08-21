const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { error } = require('../utils/apiResponse');

// Verifies JWT and attaches the authenticated user to req.user
const protect = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return error(res, 401, 'Not authorized, no token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return error(res, 401, 'Not authorized, user no longer exists');
    }

    req.user = user;
    next();
  } catch (err) {
    return error(res, 401, 'Not authorized, invalid or expired token');
  }
};

module.exports = { protect };
