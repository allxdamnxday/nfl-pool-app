const mongoose = require('mongoose');

const PickSchema = new mongoose.Schema({
  entry: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Entry',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pool: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pool',
    required: true
  },
  team: {
    type: String,
    required: true
  },
  week: {
    type: Number,
    required: false
  },
  entryNumber: {
    type: Number,
    required: false
  }
});

module.exports = mongoose.model('Pick', PickSchema);