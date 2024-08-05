/**
 * @module ErrorMiddleware
 * @description Provides centralized error handling for the application.
 */

const ErrorResponse = require('../utils/errorResponse');

/**
 * Error types and their corresponding messages and status codes
 * @type {Object.<string, {message: string, statusCode: number}>}
 */
const errorTypes = {
  CastError: { message: 'Resource not found', statusCode: 404 },
  ValidationError: { statusCode: 400 },
  JsonWebTokenError: { message: 'Not authorized to access this route', statusCode: 401 },
  TokenExpiredError: { message: 'Your session has expired. Please log in again.', statusCode: 401 },
};

/**
 * Global error handling middleware
 * @function errorHandler
 * @param {Error} err - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
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

/**
 * @example
 * // Using error middleware in Express app
 * const express = require('express');
 * const errorHandler = require('./middleware/error');
 * const app = express();
 * 
 * // ... other middleware and routes
 * 
 * app.use(errorHandler);
 */

/**
 * Additional Notes:
 * - This middleware should be used as the last middleware in the Express application
 * - It handles various types of errors and provides appropriate error responses
 * - In development mode, it includes the error stack in the response
 * - Custom error types can be added to the errorTypes object for specific error handling
 * - Errors are logged to the console for debugging purposes
 */