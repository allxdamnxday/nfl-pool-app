// helpers/authHelpers.js
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

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

exports.generateVerificationToken = () => {
  const verificationToken = crypto.randomBytes(20).toString('hex');
  const hashedToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  
  return {
    verificationToken,
    hashedToken,
    verificationTokenExpire: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  };
};