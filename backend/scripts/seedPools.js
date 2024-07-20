const mongoose = require('mongoose');
const Pool = require('../models/Pool');
const User = require('../models/User');
require('dotenv').config();

console.log('MongoDB URI:', process.env.MONGODB_URI); // Log the URI to verify it's loaded correctly

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

    // Find the existing admin user
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.error('No admin user found in the database. Please create an admin user first.');
      process.exit(1);
    }

    console.log(`Using admin user: ${adminUser.username} (${adminUser.email})`);

    const poolsData = [
      {
        name: 'NFL Pool 2024',
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
        name: 'Super Bowl Special',
        season: 2023,
        currentWeek: 18,
        status: 'active',
        maxParticipants: 1000,
        entryFee: 100,
        prizeAmount: 90000,
        creator: adminUser._id,
        participants: [adminUser._id]
      }
    ];

    await Pool.deleteMany({}); // Clear existing pools
    await Pool.insertMany(poolsData);

    console.log('Pools seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding pools:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
};

seedPools();