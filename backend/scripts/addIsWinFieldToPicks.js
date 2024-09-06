require('dotenv').config();
const mongoose = require('mongoose');
const Pick = require('../models/Pick');

async function addIsWinFieldToPicks() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false
    });

    console.log('MongoDB connected');

    const picks = await Pick.find({ isWin: { $exists: false } });

    for (const pick of picks) {
      if (pick.result === 'win') {
        pick.isWin = true;
      } else if (pick.result === 'loss') {
        pick.isWin = false;
      } else {
        // For 'pending' or any other state, set isWin to null
        pick.isWin = null;
      }
      await pick.save();
    }

    console.log(`Updated ${picks.length} picks with isWin field`);
  } catch (error) {
    console.error('Error updating picks:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

addIsWinFieldToPicks();