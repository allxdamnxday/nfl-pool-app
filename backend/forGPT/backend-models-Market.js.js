// backend/models/Market.js
const mongoose = require('mongoose');

const MarketSchema = new mongoose.Schema({
  rundownId: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  lineValueIsParticipant: { type: Boolean, default: false },
  proposition: { type: Boolean, default: false },
  periodId: { type: Number, default: 0 },
  updatedAt: { type: Date }
});

MarketSchema.index({ rundownId: 1 });

module.exports = mongoose.model('Market', MarketSchema);