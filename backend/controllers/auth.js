// backend/controllers/auth.js
const User = require('../models/User');
const Blacklist = require('../models/Blacklist');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

/**
 * @module AuthController
 * @description Handles user authentication and authorization operations including registration, login, logout, password reset, and user detail updates.
 */

/**
 * @function register
 * @description Register a new user
 * @route POST /api/v1/auth/register
 * @access Public
 * 
 * @param {Object} req.body
 * @param {string} req.body.firstName - User's first name
 * @param {string} req.body.lastName - User's last name
 * @param {string} req.body.username - User's chosen username
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's password
 * 
 * @returns {Object} 201 - Success message
 * @throws {ErrorResponse} 400 - Missing required fields or duplicate user
 * @throws {ErrorResponse} 500 - Email sending error
 */
exports.register = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, username, email, password } = req.body;

  // Validate input
  if (!firstName || !lastName || !username || !email || !password) {
    return next(new ErrorResponse('Please provide all required fields', 400));
  }

  // Check if the combination of firstName and lastName already exists
  const existingUser = await User.findOne({ firstName, lastName });
  if (existingUser) {
    return next(new ErrorResponse('A user with this first and last name combination already exists', 400));
  }

  // Generate verification token
  const verificationToken = crypto.randomBytes(20).toString('hex');

  // Create user
  const user = await User.create({
    firstName,
    lastName,
    username,
    email,
    password,
    verificationToken,
    verificationTokenExpire: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  });

  // Create verification URL
  const frontendUrl = process.env.FRONTEND_URL || 'https://nfl-pool-app-54b97bcc2195.herokuapp.com';
  const verificationUrl = `${frontendUrl}/auth/verify-email/${verificationToken}`;

  console.log('Verification URL:', verificationUrl); // Add this log

  // Create HTML email template
  const htmlMessage = `
    <h1>Verify Your Email</h1>
    <p>Please click the link below to verify your email address:</p>
    <a href="${verificationUrl}">${verificationUrl}</a>
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Email Verification - Football Eliminator',
      html: htmlMessage
    });

    // Send response without token
    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email to verify your account.'
    });
  } catch (err) {
    console.error('Email sending error:', err);
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse('Email could not be sent', 500));
  }
});

/**
 * @function login
 * @description Authenticate a user and return a token
 * @route POST /api/v1/auth/login
 * @access Public
 * 
 * @param {Object} req.body
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's password
 * 
 * @returns {Object} 200 - User data and token
 * @throws {ErrorResponse} 400 - Missing email or password
 * @throws {ErrorResponse} 401 - Invalid credentials
 * @throws {ErrorResponse} 403 - Email not verified
 */
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if email is verified
  if (!user.isEmailVerified) {
    return next(new ErrorResponse('Please verify your email before logging in', 403));
  }

  // If we reach here, it means the login is successful
  console.log(`Login successful for user: ${user.email} (Role: ${user.role})`);

  sendTokenResponse(user, 200, res);
});

/**
 * @function resendVerificationEmail
 * @description Resend verification email to user
 * @route POST /api/v1/auth/resendverification
 * @access Public
 * 
 * @param {Object} req.body
 * @param {string} req.body.email - User's email address
 * 
 * @returns {Object} 200 - Success message
 * @throws {ErrorResponse} 404 - User not found
 * @throws {ErrorResponse} 400 - Email already verified
 * @throws {ErrorResponse} 500 - Email sending error
 */
exports.resendVerificationEmail = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return next(new ErrorResponse('There is no user with that email', 404));
  }

  if (user.isEmailVerified) {
    return next(new ErrorResponse('This email is already verified', 400));
  }

  // Generate new verification token
  const verificationToken = crypto.randomBytes(20).toString('hex');
  user.verificationToken = verificationToken;
  user.verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  await user.save({ validateBeforeSave: false });

  // Create verification URL
  const verificationUrl = `${process.env.FRONTEND_URL}/auth/verify-email/${verificationToken}`;

  // Create HTML email template
  const htmlMessage = `
    <h1>Verify Your Email</h1>
    <p>Please click the link below to verify your email address:</p>
    <a href="${verificationUrl}">${verificationUrl}</a>
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Email Verification - Football Eliminator',
      html: htmlMessage
    });

    res.status(200).json({ success: true, message: 'Verification email sent' });
  } catch (err) {
    console.error('Email sending error:', err);
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse('Email could not be sent', 500));
  }
});

/**
 * @function logout
 * @description Log user out and clear cookie
 * @route GET /api/v1/auth/logout
 * @access Private
 * 
 * @returns {Object} 200 - Success message
 */
exports.logout = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];

  // Add the token to the blacklist
  await Blacklist.create({ token });

  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({ success: true, data: {} });
});

/**
 * @function getMe
 * @description Get current logged in user
 * @route GET /api/v1/auth/me
 * @access Private
 * 
 * @returns {Object} 200 - User data
 * @throws {ErrorResponse} 404 - User not found
 */
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }
  res.status(200).json({ success: true, data: user });
});

/**
 * @function forgotPassword
 * @description Forgot password
 * @route POST /api/v1/auth/forgotpassword
 * @access Public
 * 
 * @param {Object} req.body
 * @param {string} req.body.email - User's email address
 * 
 * @returns {Object} 200 - Success message
 * @throws {ErrorResponse} 404 - User not found
 * @throws {ErrorResponse} 500 - Email sending error
 */
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse('There is no user with that email', 404));
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Create reset url
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  // Create HTML email template
  const htmlMessage = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset Request</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { background-color: #4a0e4e; color: #fff; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .button { display: inline-block; padding: 10px 20px; background-color: #4a0e4e; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; }
        .footer { background-color: #f8f8f8; color: #888; text-align: center; padding: 10px; font-size: 0.8em; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <p>Hello ${user.firstName || 'Valued User'},</p>
          <p>We received a request to reset your password for your Football Eliminator account. If you didn't make this request, you can safely ignore this email.</p>
          <p>To reset your password, please click the button below:</p>
          <p><a href="${resetUrl}" class="button">Reset Password</a></p>
          <p>Or copy and paste the following link into your browser:</p>
          <p>${resetUrl}</p>
          <p>This link will expire in 10 minutes for security reasons.</p>
          <p>If you have any issues or didn't request this password reset, please contact our support team.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Football Eliminator. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Request - Football Eliminator',
      html: htmlMessage
    });

    res.status(200).json({ success: true, data: 'Email sent' });
  } catch (err) {
    console.error('Email sending error:', err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse('Email could not be sent', 500));
  }
});

/**
 * @function resetPassword
 * @description Reset password
 * @route PUT /api/v1/auth/resetpassword/:resettoken
 * @access Public
 * 
 * @param {string} req.params.resettoken - Password reset token
 * @param {Object} req.body
 * @param {string} req.body.password - New password
 * 
 * @returns {Object} 200 - New token
 * @throws {ErrorResponse} 400 - Invalid token
 */
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return next(new ErrorResponse('Invalid token', 400));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  
  // Save user without validation
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res);
});

/**
 * @function updateDetails
 * @description Update user details
 * @route PUT /api/v1/auth/updatedetails
 * @access Private
 * 
 * @param {Object} req.body
 * @param {string} [req.body.username] - New username
 * @param {string} [req.body.email] - New email address
 * 
 * @returns {Object} 200 - Updated user data
 */
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    username: req.body.username,
    email: req.body.email
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({ success: true, data: user });
});

/**
 * @function updatePassword
 * @description Update password
 * @route PUT /api/v1/auth/updatepassword
 * @access Private
 * 
 * @param {Object} req.body
 * @param {string} req.body.currentPassword - Current password
 * @param {string} req.body.newPassword - New password
 * 
 * @returns {Object} 200 - New token
 * @throws {ErrorResponse} 401 - Incorrect current password
 */
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Password is incorrect', 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

/**
 * @function verifyEmail
 * @description Verify email
 * @route GET /api/v1/auth/verify-email/:token
 * @access Public
 * 
 * @param {string} req.params.token - Verification token
 * 
 * @returns {Object} 200 - Success message
 * @throws {ErrorResponse} 400 - Invalid or expired token
 */
exports.verifyEmail = asyncHandler(async (req, res, next) => {
  const { token } = req.params;

  // Find user by verification token and check if it's expired
  const user = await User.findOne({
    $or: [
      { verificationToken: token },
      { verificationToken: undefined, isEmailVerified: true }
    ],
    verificationTokenExpire: { $gt: Date.now() }
  });

  if (!user) {
    return next(new ErrorResponse('Invalid or expired token', 400));
  }

  if (user.isEmailVerified) {
    return res.status(200).json({
      success: true,
      message: 'Email already verified'
    });
  }

  // Update user
  user.isEmailVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpire = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Email verified successfully'
  });
});

/**
 * @function resendVerificationEmail
 * @description Resends the verification email to a user who hasn't verified their email yet.
 * @route POST /api/v1/auth/resend-verification
 * @access Public
 * 
 * @param {Object} req.body
 * @param {string} req.body.email - The email address of the user requesting verification resend
 * 
 * @returns {Object} 200 - Success message indicating the verification email was sent
 * @throws {ErrorResponse} 404 - If no user is found with the provided email
 * @throws {ErrorResponse} 400 - If the user's email is already verified
 * @throws {ErrorResponse} 500 - If there's an error sending the email
 */
exports.resendVerificationEmail = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return next(new ErrorResponse('There is no user with that email', 404));
  }

  if (user.isEmailVerified) {
    return next(new ErrorResponse('This email is already verified', 400));
  }

  // Generate new verification token
  const verificationToken = crypto.randomBytes(20).toString('hex');
  user.verificationToken = verificationToken;
  user.verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  await user.save({ validateBeforeSave: false });

  // Create verification URL
  const verificationUrl = `${process.env.FRONTEND_URL}/auth/verify-email/${verificationToken}`;

  // Create HTML email template
  const htmlMessage = `
    <h1>Verify Your Email</h1>
    <p>Please click the link below to verify your email address:</p>
    <a href="${verificationUrl}">${verificationUrl}</a>
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Email Verification - Football Eliminator',
      html: htmlMessage
    });

    res.status(200).json({ success: true, message: 'Verification email sent' });
  } catch (err) {
    console.error('Email sending error:', err);
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse('Email could not be sent', 500));
  }
});

/**
 * @function sendTokenResponse
 * @description Helper function to get token from model, create cookie and send response
 * @private
 * 
 * @param {Object} user - The user object
 * @param {number} statusCode - The HTTP status code to send in the response
 * @param {Object} res - The response object
 * 
 * @returns {void}
 */
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      }
    });
};

/**
 * Middleware:
 * - asyncHandler: Wraps async functions to handle errors
 * 
 * Error Handling:
 * - Uses ErrorResponse utility for consistent error formatting
 * - Specific error handling for various scenarios (e.g., invalid credentials, email not verified)
 * 
 * Additional Notes:
 * - Email verification is required before login
 * - Password reset functionality uses crypto for token generation
 * - Token blacklisting is implemented for logout security
 * - All sensitive routes are protected and require authentication
 * 
 * @example
 * // Register a new user
 * POST /api/v1/auth/register
 * {
 *   "firstName": "John",
 *   "lastName": "Doe",
 *   "username": "johndoe",
 *   "email": "john@example.com",
 *   "password": "password123"
 * }
 * 
 * // Login
 * POST /api/v1/auth/login
 * {
 *   "email": "john@example.com",
 *   "password": "password123"
 * }
 */