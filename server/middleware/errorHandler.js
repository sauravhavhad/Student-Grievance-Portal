const { error } = require('../utils/apiResponse');

// 404 handler for unknown routes
const notFound = (req, res, next) => {
  return error(res, 404, `Route not found: ${req.originalUrl}`);
};

// Centralized error handler - never leaks stack traces to the client
const errorHandler = (err, req, res, next) => {
  console.error(err);

  let statusCode = err.statusCode && err.statusCode >= 400 ? err.statusCode : 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for ${err.path}`;
  }

  // Duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = field ? `${field} already exists` : 'Duplicate value error';
  }

  if (statusCode === 500) {
    message = 'Something went wrong on the server';
  }

  return error(res, statusCode, message);
};

module.exports = { notFound, errorHandler };
