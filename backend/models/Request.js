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
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Request', RequestSchema);