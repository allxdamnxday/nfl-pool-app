// backend/jobs/cronJobs.js
const cron = require('node-cron');
const dataSyncService = require('../services/dataSyncService');
const Game = require('../models/Game');

// Sync NFL schedule every day at 1:00 AM
cron.schedule('0 1 * * *', async () => {
  console.log('Syncing NFL schedule...');
  const currentYear = new Date().getFullYear();
  await dataSyncService.syncNFLSchedule(currentYear);
});

// Sync game markets every hour
cron.schedule('0 * * * *', async () => {
  console.log('Syncing game markets...');
  const upcomingGames = await Game.find({
    eventDate: { $gte: new Date() },
    eventDate: { $lte: new Date(new Date().getTime() + 24 * 60 * 60 * 1000) } // Next 24 hours
  });

  for (const game of upcomingGames) {
    await dataSyncService.syncGameMarkets(game._id);
  }
});