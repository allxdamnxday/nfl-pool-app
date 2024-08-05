/**
 * @module AuthMiddleware
 * @description Authentication and authorization middleware for the NFL pool application.
 * This middleware handles user authentication via JWT tokens and role-based authorization.
 */

const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const Blacklist = require('../models/Blacklist');

/**
 * Protects routes by verifying JWT tokens and setting user information on the request object.
 * @function protect
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws {ErrorResponse} If token is missing, invalid, or user is not found
 */
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  console.log('Auth Middleware - Headers:', req.headers);

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  console.log('Auth Middleware - Token:', token);

  if (!token) {
    console.log('Auth Middleware - No token provided');
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    const blacklisted = await Blacklist.findOne({ token });
    if (blacklisted) {
      console.log('Auth Middleware - Token is blacklisted');
      return next(new ErrorResponse('Token is invalidated', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Auth Middleware - Decoded token:', decoded);

    const user = await User.findById(decoded.id);
    
    if (!user) {
      console.log('Auth Middleware - No user found with id:', decoded.id);
      return next(new ErrorResponse('No user found with this id', 404));
    }

    console.log('Auth Middleware - User found:', user);

    if (!user.isEmailVerified) {
      console.log('Auth Middleware - User email not verified');
      return next(new ErrorResponse('Please verify your email before accessing this route', 403));
    }

    req.userId = user._id;
    req.user = user;
    req.user.role = decoded.role || user.role;

    console.log('Auth Middleware - Request user set:', req.user);

    next();
  } catch (err) {
    console.error('Auth Middleware - Error:', err);
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
});

/**
 * Authorizes access to routes based on user roles.
 * @function authorize
 * @param {...string} roles - Allowed roles for accessing the route
 * @returns {Function} Middleware function to check user role
 * @throws {ErrorResponse} If user is not authenticated or doesn't have the required role
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return next(new ErrorResponse('User not authenticated or role not defined', 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(new ErrorResponse(`User role ${req.user.role} is not authorized to access this route`, 403));
    }
    next();
  };
};

/**
 * @example
 * // Using the protect middleware
 * router.get('/protected-route', protect, (req, res) => {
 *   res.json({ message: 'Access granted', user: req.user });
 * });
 * 
 * // Using the authorize middleware
 * router.get('/admin-route', protect, authorize('admin'), (req, res) => {
 *   res.json({ message: 'Admin access granted' });
 * });
 */

/**
 * Additional Notes:
 * - The protect middleware checks for JWT tokens in the Authorization header or cookies.
 * - It verifies the token, checks if it's blacklisted, and sets user information on the request object.
 * - The authorize middleware should be used after the protect middleware to ensure req.user is set.
 * - Both middlewares use the ErrorResponse utility for consistent error handling.
 * - Detailed logging is implemented for debugging purposes.
 */