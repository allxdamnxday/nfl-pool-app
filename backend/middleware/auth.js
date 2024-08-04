// /backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const Blacklist = require('../models/Blacklist');

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