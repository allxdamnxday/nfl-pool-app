const path = require('path');
const fs = require('fs').promises;
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Pool = require('../models/Pool');

console.log('MongoDB URI:', process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Function to create the first NFL pool
async function createFirstNFLPool() {
  try {
    const newPool = new Pool({
      name: 'The Jim Thomas Football Junkie Extravaganza',
      season: 2024,
      status: 'open',
      maxParticipants: 1500,
      entryFee: 60, // You may want to adjust this
      // prizeAmount is now undefined
      creator: '669977312fe2352c486556a4', // Replace with actual creator ObjectId
      description: 'Think you can outlast 1,300+ football fanatics?',
      startDate: new Date('2024-09-05T01:00:00Z'), // September 5, 2024, at 1 AM UTC
      endDate: new Date('2025-01-06T23:59:59Z'), // January 6, 2025, at 11:59:59 PM UTC (approximate playoff start)
      maxEntries: 1500,
      // Total entry fees
      numberOfWeeks: 18
    });

    const savedPool = await newPool.save();
    console.log('First NFL Pool created successfully:', savedPool);
  } catch (error) {
    console.error('Error creating the first NFL Pool:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

// Run the function
createFirstNFLPool();