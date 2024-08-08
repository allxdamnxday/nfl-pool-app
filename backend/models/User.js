/**
 * @module User
 * @description Represents a user in the NFL pool application. This model handles user authentication, profile management, and relationships to entries and requests.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * User Schema
 * @typedef {Object} UserSchema
 * @property {string} firstName - The user's first name
 * @property {string} lastName - The user's last name
 * @property {string} username - The user's unique username
 * @property {string} email - The user's unique email address
 * @property {string} password - The user's hashed password
 * @property {string} role - The user's role (user or admin)
 * @property {boolean} isEmailVerified - Whether the user's email is verified
 * @property {string} verificationToken - Token for email verification
 * @property {Date} verificationTokenExpire - Expiration date for verification token
 * @property {string} resetPasswordToken - Token for password reset
 * @property {Date} resetPasswordExpire - Expiration date for password reset token
 * @property {Date} createdAt - The date the user was created
 */

/**
 * @class User
 * @extends mongoose.Model
 * @description Mongoose model for User documents.
 */
const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please add a first name'],
    trim: true,
    maxlength: [50, 'First name cannot be more than 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Please add a last name'],
    trim: true,
    maxlength: [50, 'Last name cannot be more than 50 characters']
  },
  username: {
    type: String,
    required: [true, 'Please add a username'],
    unique: true,
    trim: true,
    maxlength: [20, 'Username cannot be more than 20 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationTokenExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add compound index for firstName and lastName
UserSchema.index({ firstName: 1, lastName: 1 }, { unique: true });

// Add a pre-save hook to check for duplicate email
UserSchema.pre('save', async function(next) {
  const user = this;
  if (user.isModified('email')) {
    const existingUser = await User.findOne({ email: user.email });
    if (existingUser) {
      const error = new Error('Email already exists');
      error.name = 'ValidationError';
      next(error);
    }
  }
  next();
});

/**
 * Encrypt password using bcrypt before saving
 * @function
 * @name preSave
 * @memberof module:User
 * @inner
 */
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

/**
 * Sign JWT and return
 * @function
 * @name getSignedJwtToken
 * @memberof module:User
 * @inner
 * @returns {string} Signed JWT token
 */
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

/**
 * Match user entered password to hashed password in database
 * @function
 * @name matchPassword
 * @memberof module:User
 * @inner
 * @param {string} enteredPassword - The password entered by the user
 * @returns {Promise<boolean>} Whether the password matches
 */
UserSchema.methods.matchPassword = async function(enteredPassword) {
  console.log(`Comparing passwords for user: ${this.email}`);
  console.log(`Stored hashed password: ${this.password}`);
  console.log(`Entered password: ${enteredPassword}`);
  
  try {
    const isMatch = await bcrypt.compare(enteredPassword, this.password);
    console.log(`bcrypt.compare result: ${isMatch}`);
    return isMatch;
  } catch (error) {
    console.error('Error in password comparison:', error);
    return false;
  }
};

/**
 * Generate and hash password token
 * @function
 * @name getResetPasswordToken
 * @memberof module:User
 * @inner
 * @returns {string} Reset token
 */
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

/**
 * Virtual field for user requests
 * @name requests
 * @memberof module:User
 * @inner
 * @type {mongoose.Schema.Types.Virtual}
 */
UserSchema.virtual('requests', {
  ref: 'Request',
  localField: '_id',
  foreignField: 'user',
  justOne: false
});

/**
 * Virtual field for user entries
 * @name entries
 * @memberof module:User
 * @inner
 * @type {mongoose.Schema.Types.Virtual}
 */
UserSchema.virtual('entries', {
  ref: 'Entry',
  localField: '_id',
  foreignField: 'user',
  justOne: false
});

/**
 * User model
 * @type {mongoose.Model}
 */
const User = mongoose.model('User', UserSchema);

module.exports = User;

/**
 * @example
 * // Creating a new user
 * const newUser = new User({
 *   firstName: 'John',
 *   lastName: 'Doe',
 *   username: 'johndoe',
 *   email: 'john@example.com',
 *   password: 'securepassword123'
 * });
 * 
 * // Saving the user to the database
 * newUser.save((err, user) => {
 *   if (err) {
 *     console.error('Error saving user:', err);
 *   } else {
 *     console.log('User saved successfully:', user);
 *   }
 * });
 * 
 * // Generating a JWT token for the user
 * const token = newUser.getSignedJwtToken();
 * 
 * // Checking if a password matches
 * const isMatch = await newUser.matchPassword('enteredPassword');
 * 
 * // Generating a password reset token
 * const resetToken = newUser.getResetPasswordToken();
 */

/**
 * @typedef {Object} UserDocument
 * @property {string} firstName - The user's first name
 * @property {string} lastName - The user's last name
 * @property {string} username - The user's unique username
 * @property {string} email - The user's unique email address
 * @property {string} password - The user's hashed password
 * @property {('user'|'admin')} role - The user's role
 * @property {boolean} isEmailVerified - Whether the user's email is verified
 * @property {string} [verificationToken] - Token for email verification
 * @property {Date} [verificationTokenExpire] - Expiration date for verification token
 * @property {string} [resetPasswordToken] - Token for password reset
 * @property {Date} [resetPasswordExpire] - Expiration date for password reset token
 * @property {Date} createdAt - The date the user was created
 * @property {function(): string} getSignedJwtToken - Method to generate a signed JWT
 * @property {function(string): Promise<boolean>} matchPassword - Method to compare passwords
 * @property {function(): string} getResetPasswordToken - Method to generate a password reset token
 */

/**
 * Relationships:
 * - User has a one-to-many relationship with Request (via 'requests' virtual)
 * - User has a one-to-many relationship with Entry (via 'entries' virtual)
 * 
 * Validation Rules:
 * - firstName and lastName are required and have a maximum length of 50 characters
 * - username is required, unique, and has a maximum length of 20 characters
 * - email is required, unique, and must match a valid email format
 * - password is required and must be at least 6 characters long
 * - role must be either 'user' or 'admin'
 * 
 * Additional Notes:
 * - The password is hashed using bcrypt before saving to the database
 * - The model includes methods for JWT generation, password matching, and reset token generation
 * - Email verification and password reset functionalities are built into the model
 * - The model uses a compound index on firstName and lastName for efficient querying
 */