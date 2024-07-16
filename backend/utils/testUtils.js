// backend/utils/testUtils.js
const jwt = require('jsonwebtoken');

exports.generateAdminToken = (user) => {
  return jwt.sign({ id: user._id, role: 'admin' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};
