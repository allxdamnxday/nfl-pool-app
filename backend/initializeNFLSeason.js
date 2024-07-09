// initializeNFLSeason.js
require('dotenv').config();
const mongoose = require('mongoose');
const { initializeSeasonData } = require('./services/seasonService');

// Import all models
require('./models/Game');
require('./models/Settings');

async function initializeNFL2024Season() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    await initializeSeasonData(2024);
    console.log('2024 NFL season data initialized successfully');
  } catch (error) {
    console.error('Error initializing 2024 NFL season data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

initializeNFL2024Season();