/**
 * @module Request
 * @description Represents a request for entry into a pool in the NFL pool application. 
 * This model handles the process of users requesting to join pools, including payment tracking and approval status.
 */

const mongoose = require('mongoose');

/**
 * Request Schema
 * @typedef {Object} RequestSchema
 * @property {mongoose.Schema.ObjectId} user - The user who made the request
 * @property {mongoose.Schema.ObjectId} pool - The pool the request is for
 * @property {number} numberOfEntries - The number of entries requested (1-3)
 * @property {string} status - The status of the request (pending, approved, rejected, payment_pending)
 * @property {number} totalAmount - The total amount for the request
 * @property {string} [paymentConfirmation] - The payment confirmation (optional)
 * @property {string} [paymentMethod] - The payment method used (optional)
 * @property {number} [entryNumber] - The entry number (optional)
 * @property {string} paymentStatus - The status of the payment (pending, confirmed, failed)
 * @property {string} [transactionId] - The transaction ID (optional)
 * @property {string} [paymentType] - The type of payment (optional)
 * @property {Date} createdAt - The date the request was created
 */

/**
 * @class Request
 * @extends mongoose.Model
 * @description Mongoose model for Request documents.
 */
const RequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'User is required for a request']
  },
  pool: {
    type: mongoose.Schema.ObjectId,
    ref: 'Pool',
    required: [true, 'Pool is required for a request']
  },
  numberOfEntries: {
    type: Number,
    required: [true, 'Number of entries is required'],
    min: [1, 'Minimum number of entries is 1'],
    max: [3, 'Maximum number of entries is 3']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'payment_pending'],
    default: 'pending'
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required']
  },
  paymentConfirmation: {
    type: String
  },
  paymentMethod: {
    type: String
  },
  entryNumber: {
    type: Number,
    min: [1, 'Minimum entry number is 1'],
    max: [3, 'Maximum entry number is 3']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'pending'
  },
  transactionId: {
    type: String
  },
  paymentType: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add a compound index to ensure uniqueness of user-pool combination
//RequestSchema.index({ user: 1, pool: 1 }, { unique: true });

/**
 * Request model
 * @type {mongoose.Model}
 */
const Request = mongoose.model('Request', RequestSchema);

module.exports = Request;

/**
 * @example
 * // Creating a new request
 * const newRequest = new Request({
 *   user: '60d5ecb74d6bb830b8e70bfb',
 *   pool: '60d5ecb74d6bb830b8e70bfc',
 *   numberOfEntries: 2,
 *   totalAmount: 100
 * });
 * 
 * // Saving the request to the database
 * newRequest.save((err, request) => {
 *   if (err) {
 *     console.error('Error saving request:', err);
 *   } else {
 *     console.log('Request saved successfully:', request);
 *   }
 * });
 * 
 * // Updating a request's status
 * Request.findByIdAndUpdate('60d5ecb74d6bb830b8e70bfd', { status: 'approved' }, { new: true }, (err, updatedRequest) => {
 *   if (err) {
 *     console.error('Error updating request:', err);
 *   } else {
 *     console.log('Request updated successfully:', updatedRequest);
 *   }
 * });
 */

/**
 * Relationships:
 * - Request has a many-to-one relationship with User (via 'user' field)
 * - Request has a many-to-one relationship with Pool (via 'pool' field)
 * 
 * Validation Rules:
 * - user and pool fields are required and must be valid ObjectIds
 * - numberOfEntries is required and must be between 1 and 3
 * - status must be one of: 'pending', 'approved', 'rejected', or 'payment_pending'
 * - totalAmount is required
 * - paymentStatus must be one of: 'pending', 'confirmed', or 'failed'
 * - entryNumber, if provided, must be between 1 and 3
 * 
 * Additional Notes:
 * - The model uses timestamps to automatically add and update createdAt and updatedAt fields
 * - A compound index on user and pool fields can be uncommented to ensure uniqueness of user-pool combinations
 * - The model includes fields for tracking payment information, which can be used for integrating with payment systems
 * - The status field allows for tracking the lifecycle of a request from creation to approval/rejection
 */