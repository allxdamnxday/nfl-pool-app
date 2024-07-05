const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GameSchema = new Schema({
  eventId: { type: String, required: true, unique: true },
  weekNumber: { type: Number, required: true },
  season: { type: Number, required: true },
  homeTeam: { type: Schema.Types.ObjectId, ref: 'NFLTeam', required: true },
  awayTeam: { type: Schema.Types.ObjectId, ref: 'NFLTeam', required: true },
  dateTime: { type: Date, required: true },
  status: { type: String, enum: ['scheduled', 'inProgress', 'final'], default: 'scheduled' },
  finalScore: {
    homeTeam: { type: Number },
    awayTeam: { type: Number }
  }
}, { timestamps: true });

GameSchema.index({ season: 1, weekNumber: 1 });

module.exports = mongoose.model('Game', GameSchema);
