// /backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const Blacklist = require('../models/Blacklist');

exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Check if token is blacklisted
    const blacklisted = await Blacklist.findOne({ token });
    if (blacklisted) {
      return next(new ErrorResponse('Token is invalidated', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    
    if (!user) {
      console.error(`User not found for id: ${decoded.id}`);
      return next(new ErrorResponse('User not found', 401));
    }

    req.user = user;
    // Ensure the role is set on the user object
    req.user.role = decoded.role || user.role;

    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
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