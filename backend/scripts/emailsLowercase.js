const mongoose = require('mongoose');
const User = require('../models/User'); // Adjust the path as needed
require('dotenv').config(); // To load environment variables

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('Connected to MongoDB');

  try {
    const users = await User.find({});
    let updatedCount = 0;
    let duplicateCount = 0;

    for (const user of users) {
      const lowercaseEmail = user.email.toLowerCase();
      if (lowercaseEmail !== user.email) {
        try {
          await User.findByIdAndUpdate(user._id, { email: lowercaseEmail });
          updatedCount++;
        } catch (error) {
          if (error.code === 11000) {
            console.log(`Duplicate email found: ${user.email}`);
            duplicateCount++;
            // Here you could implement custom logic to handle duplicates
            // For example, you could add a number to the username or mark the account for review
          } else {
            throw error;
          }
        }
      }
    }

    console.log(`Updated ${updatedCount} user emails to lowercase`);
    console.log(`Found ${duplicateCount} duplicate emails`);
  } catch (error) {
    console.error('Error converting emails:', error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
})
.catch(err => console.error('MongoDB connection error:', err));