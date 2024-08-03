// helpers/authHelpers.js
const jwt = require('jsonwebtoken');

exports.generateToken = (user) => {
  return jwt.sign({ id: user._id, isEmailVerified: user.isEmailVerified }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

exports.generateAdminToken = (user) => {
  return jwt.sign({ id: user._id, role: 'admin', isEmailVerified: user.isEmailVerified }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

exports.generateExpiredToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role, isEmailVerified: user.isEmailVerified }, process.env.JWT_SECRET, { expiresIn: '1ms' });
};