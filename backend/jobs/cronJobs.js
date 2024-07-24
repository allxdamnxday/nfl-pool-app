// backend/jobs/cronJobs.js

const cron = require('node-cron');
const dataSyncService = require('./services/dataSyncService');

// Sync NFL teams daily at 1:00 AM
cron.schedule('0 1 * * *', async () => {
  console.log('Syncing NFL teams');
  try {
    await dataSyncService.syncNFLTeams();
    console.log('NFL teams sync completed successfully');
  } catch (error) {
    console.error('NFL teams sync failed:', error);
  }
});

// Sync NFL schedule daily at 2:00 AM
cron.schedule('0 2 * * *', async () => {
  console.log('Syncing NFL schedule');
  try {
    const today = new Date().toISOString().split('T')[0];
    const currentYear = new Date().getFullYear();
    await dataSyncService.syncNFLSchedule(today, currentYear);
    console.log('NFL schedule sync completed successfully');
  } catch (error) {
    console.error('NFL schedule sync failed:', error);
  }
});