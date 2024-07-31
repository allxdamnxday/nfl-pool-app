const rateLimit = require('express-rate-limit');

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Upped the limit to 100 from 10
  message: 'Too many login attempts from this IP, please try again after 15 minutes'
});

module.exports = authRateLimiter;