// backend/middleware/error.js
const ErrorResponse = require('../utils/errorResponse');

const errorTypes = {
  CastError: { message: 'Resource not found', statusCode: 404 },
  ValidationError: { statusCode: 400 },
  JsonWebTokenError: { message: 'Not authorized to access this route', statusCode: 401 },
  TokenExpiredError: { message: 'Your session has expired. Please log in again.', statusCode: 401 },
};

const errorHandler = (err, req, res, next) => {
  console.error('Error Middleware - Full error object:', err);

  let error = { ...err, message: err.message };

  // Log the error stack
  console.error('Error Middleware - Error stack:', err.stack);

  if (errorTypes[err.name]) {
    error = new ErrorResponse(
      errorTypes[err.name].message || Object.values(err.errors).map(val => val.message),
      errorTypes[err.name].statusCode
    );
  }

  if (err.code === 11000) {
    error = new ErrorResponse('Duplicate field value entered', 400);
  }

  console.error('Error Middleware - Formatted error:', error);

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;