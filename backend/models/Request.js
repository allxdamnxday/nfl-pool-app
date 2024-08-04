const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  pool: {
    type: mongoose.Schema.ObjectId,
    ref: 'Pool',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  numberOfEntries: {
    type: Number,
    required: true,
    min: 1,
    max: 3
  },
  status: {
    type: String,
    enum: ['pending', 'payment_pending', 'payment_received', 'approved', 'rejected'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['paypal', 'venmo', 'zelle'],
    required: true
  },
  paymentConfirmation: {
    type: String,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  entryNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 3
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add a compound index to ensure uniqueness of user-pool combination
RequestSchema.index({ user: 1, pool: 1 }, { unique: true });

module.exports = mongoose.model('Request', RequestSchema);