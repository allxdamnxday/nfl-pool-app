const mongoose = require('mongoose');
const Pool = require('../models/Pool');
const User = require('../models/User');
require('dotenv').config();

console.log('MongoDB URI:', process.env.MONGODB_URI);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

const seedPools = async () => {
  try {
    await connectDB();

    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.error('No admin user found in the database. Please create an admin user first.');
      process.exit(1);
    }

    console.log(`Using admin user: ${adminUser.username} (${adminUser.email})`);

    const poolsData = [
      {
        name: 'NFL_Pool_2024_001',
        season: 2024,
        currentWeek: 1,
        status: 'open',
        maxParticipants: 100,
        entryFee: 60,
        prizeAmount: 4500,
        creator: adminUser._id,
        participants: [adminUser._id]
      },
      {
        name: 'Super_Bowl_Special_001',
        season: 2023,
        currentWeek: 1,
        status: 'open',
        maxParticipants: 1000,
        entryFee: 100,
        prizeAmount: 90000,
        creator: adminUser._id,
        participants: [adminUser._id]
      },
      {
        name: 'Midseason_Madness_001',
        season: 2023,
        currentWeek: 9,
        status: 'active',
        maxParticipants: 50,
        entryFee: 75,
        prizeAmount: 3000,
        creator: adminUser._id,
        participants: [adminUser._id]
      },
      {
        name: 'Rookie_Challenge_001',
        season: 2024,
        currentWeek: 1,
        status: 'open',
        maxParticipants: 30,
        entryFee: 40,
        prizeAmount: 1000,
        creator: adminUser._id,
        participants: [adminUser._id]
      }
    ];

    // Instead of deleting, we'll check for existing pools and only add new ones
    for (const poolData of poolsData) {
      const existingPool = await Pool.findOne({ name: poolData.name });
      if (!existingPool) {
        await Pool.create(poolData);
        console.log(`Created new pool: ${poolData.name}`);
      } else {
        console.log(`Pool ${poolData.name} already exists, skipping`);
      }
    }

    console.log('Pools seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding pools:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
};

seedPools();