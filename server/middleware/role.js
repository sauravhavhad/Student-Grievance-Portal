const { error } = require('../utils/apiResponse');

// Restricts access to the given roles, e.g. authorize('admin')
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return error(res, 401, 'Not authorized');
    }
    if (!roles.includes(req.user.role)) {
      return error(res, 403, 'Forbidden: insufficient permissions');
    }
    next();
  };
};

module.exports = { authorize };
