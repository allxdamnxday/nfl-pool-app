// helpers/dbHelpers.js
const mongoose = require('mongoose');

exports.connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

exports.closeDatabase = async () => {
  try {
    await mongoose.connection.dropDatabase();
  } catch (error) {
    console.warn('Failed to drop database. It might have already been closed:', error.message);
  }
  await mongoose.connection.close();
};

exports.clearDatabase = async () => {
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany();
    }
  }
};