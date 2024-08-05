/**
 * @module ValidatorMiddleware
 * @description Provides input validation and sanitization middleware for the application.
 */

const { body, validationResult } = require('express-validator');
const sanitize = require('sanitize');

/**
 * Runs an array of validations and returns errors if any
 * @function validate
 * @param {Array} validations - Array of express-validator validation chains
 * @returns {Function} Express middleware function
 */
const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({ errors: errors.array() });
  };
};

/**
 * Validation chain for user registration
 * @type {Array}
 */
const validateRegister = [
  body('username')
    .trim()
    .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long')
    .escape(),
  body('email')
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = {
  validate,
  validateRegister,
};

/**
 * @example
 * // Using validate middleware in a route
 * const { validate, validateRegister } = require('./middleware/validators');
 * 
 * router.post('/register', validate(validateRegister), (req, res) => {
 *   // Handle registration
 * });
 */

/**
 * Additional Notes:
 * - This middleware uses express-validator for input validation and sanitization
 * - Custom validation chains can be created for different routes or input fields
 * - The validate function can be used with any set of validation chains
 * - Errors are returned in a standardized format for easy client-side handling
 * - Sanitization is applied to prevent XSS attacks and ensure data consistency
 */