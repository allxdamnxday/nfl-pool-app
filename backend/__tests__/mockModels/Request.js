const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pool: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pool',
    required: true
  }
});

module.exports = mongoose.model('Request', RequestSchema);