// models/Pick.js
const mongoose = require('mongoose');

const PickSchema = new mongoose.Schema({
  entry: {
    type: mongoose.Schema.ObjectId,
    ref: 'Entry',
    required: true
  },
  week: {
    type: Number,
    required: true
  },
  team: {
    type: String,
    required: true
  },
  game: {
    type: mongoose.Schema.ObjectId,
    ref: 'Game',
    required: true
  }
});

module.exports = mongoose.model('Pick', PickSchema);