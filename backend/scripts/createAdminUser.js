const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');

// Load environment variables


mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));
  

// Function to create the first admin user
const createAdminUser = async () => {
  try {
   

    // Create a new admin user
    const user = new User({
      username: 'nitro',
      email: 'go@nitro.com',
      password: 'Plastic4$', // Make sure to hash the password in a real application
      role: 'admin'
    });

    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    await user.save();

    // Generate a JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE
    });

    console.log('Admin user created successfully');
    console.log('Authorization Token:', token);
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Run the function
createAdminUser();