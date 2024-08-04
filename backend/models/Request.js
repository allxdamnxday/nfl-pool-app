const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  pool: {
    type: mongoose.Schema.ObjectId,
    ref: 'Pool',
    required: true
  },
  numberOfEntries: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'payment_pending'],
    default: 'pending'
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentConfirmation: {
    type: String,
    required: false // Make this optional if it's not always required
  },
  paymentMethod: {
    type: String,
    required: false // Make this optional if it's not always required
  },
  entryNumber: {
    type: Number,
    required: false // Make this optional if it's not always required
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