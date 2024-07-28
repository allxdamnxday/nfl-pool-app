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
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'payment_pending', 'payment_received', 'approved', 'rejected'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['paypal', 'venmo', 'zelle'],
    required: function() { return this.status === 'payment_pending' || this.status === 'payment_received'; }
  },
  paymentAmount: {
    type: Number,
    required: function() { return this.status === 'payment_pending' || this.status === 'payment_received'; }
  },
  paymentConfirmation: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Request', RequestSchema);