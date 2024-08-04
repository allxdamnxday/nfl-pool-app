const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const dbURI = process.env.NODE_ENV === 'test' ? process.env.MONGO_URI_TEST : process.env.MONGODB_URI;

    if (!dbURI) {
      throw new Error('Database URI is undefined. Check your environment variables.');
    }

    const conn = await mongoose.connect(dbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database Name: ${conn.connection.name}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    console.error(`Stack: ${error.stack}`);
    process.exit(1);
  }
};

module.exports = connectDB;