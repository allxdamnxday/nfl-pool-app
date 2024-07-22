const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const readline = require('readline');
require('dotenv').config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to database.');

    const firstName = await question('Enter admin first name: ');
    const lastName = await question('Enter admin last name: ');
    const username = await question('Enter admin username: ');
    const email = await question('Enter admin email: ');
    const password = await question('Enter admin password: ');

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log('Original password:', password); // Added logging
    console.log('Hashed password:', hashedPassword); // Added logging

    const adminUser = await User.create({
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
      role: 'admin'
    });

    console.log('Admin user created successfully:');
    console.log(`ID: ${adminUser._id}`);
    console.log(`Name: ${adminUser.firstName} ${adminUser.lastName}`);
    console.log(`Username: ${adminUser.username}`);
    console.log(`Email: ${adminUser.email}`);
    console.log(`Role: ${adminUser.role}`);
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.connection.close();
    rl.close();
  }
};

createAdmin();