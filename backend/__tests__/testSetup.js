const mongoose = require('mongoose');
const connectDB = require('../config/db');

console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MONGO_URI_TEST:', process.env.MONGO_URI_TEST);

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  await connectDB();
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});