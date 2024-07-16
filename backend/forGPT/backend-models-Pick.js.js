// backend/models/Pick.js
const mongoose = require('mongoose');

const PickSchema = new mongoose.Schema({
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
  week: {
    type: Number,
    required: true
  },
  team: {
    type: mongoose.Schema.ObjectId,
    ref: 'NFLTeam',
    required: true
  },
  game: {
    type: mongoose.Schema.ObjectId,
    ref: 'Game',
    required: true
  }
});

module.exports = mongoose.model('Pick', PickSchema);