// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please add a first name']
  },
  lastName: {
    type: String,
    required: [true, 'Please add a last name']
  },
  username: {
    type: String,
    required: [true, 'Please add a username']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationTokenExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add compound index for firstName and lastName
UserSchema.index({ firstName: 1, lastName: 1 }, { unique: true });

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
  // Only run this function if password was modified (not on other update functions)
  if (!this.isModified('password')) {
    return next();
  }

  // If $skipPasswordHashing is set, skip hashing
  if (this.$skipPasswordHashing === true) {
    return next();
  }

  // Generate salt
  const salt = await bcrypt.genSalt(10);
  // Hash password
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  console.log(`Comparing passwords for user: ${this.email}`); // Added logging
  console.log(`Stored hashed password: ${this.password}`); // Added logging
  console.log(`Entered password: ${enteredPassword}`); // Added logging
  
  try {
    const isMatch = await bcrypt.compare(enteredPassword, this.password);
    console.log(`bcrypt.compare result: ${isMatch}`); // Added logging
    return isMatch;
  } catch (error) {
    console.error('Error in password comparison:', error); // Added logging
    return false;
  }
};

// Generate and hash password token
UserSchema.methods.getResetPasswordToken = function() {
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model('User', UserSchema);