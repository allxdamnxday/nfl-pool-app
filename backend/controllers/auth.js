// backend/controllers/auth.js
const User = require('../models/User');
const Blacklist = require('../models/Blacklist');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
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

  // Create user
  const user = await User.create({ firstName, lastName, username, email, password });

  sendTokenResponse(user, 201, res);
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  console.log(`Login attempt for email: ${email}`);

  // Validate email & password
  if (!email || !password) {
    console.log('Login failed: Email or password not provided');
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    console.log(`Login failed: No user found with email ${email}`);
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  console.log(`User found: ${user.email} (Role: ${user.role})`);

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  console.log(`Password match result: ${isMatch}`);

  if (!isMatch) {
    console.log(`Login failed: Password doesn't match for user ${email}`);
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  console.log(`Login successful for user: ${user.email} (Role: ${user.role})`);

  // Generate token
  const token = user.getSignedJwtToken();
  console.log('Generated token:', token);

  const options = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(200)
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
        role: user.role
      }
    });

  console.log('Login response sent');
});

// @desc    Log user out / clear cookie
// @route   GET /api/v1/auth/logout
// @access  Private
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

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }
  res.status(200).json({ success: true, data: user });
});

// @desc    Forgot password
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
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

// @desc    Reset password
// @route   PUT /api/v1/auth/resetpassword/:resettoken
// @access  Public
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

// @desc    Update user details
// @route   PUT /api/v1/auth/updatedetails
// @access  Private
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

// @desc    Update password
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
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

// Helper function to get token from model, create cookie and send response
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
        role: user.role
      }
    });
};