const request = require('supertest');
const mongoose = require('mongoose');
const { app, connectDB } = require('../server');

console.log('Test file loaded');

beforeAll(async () => {
  console.log('beforeAll hook started');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('MONGODB_URI:', process.env.MONGODB_URI);
  
  try {
    await connectDB();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
  }
});

afterAll(async () => {
  console.log('afterAll hook started');
  try {
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
});

describe('Basic Auth Test', () => {
  console.log('Entering test suite');

  it('should register a new user', async () => {
    console.log('Starting user registration test');
    
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    };
    console.log('User data prepared:', userData);

    try {
      console.log('Sending POST request to /api/v1/auth/register');
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData);
      
      console.log('Response received');
      console.log('Status Code:', response.statusCode);
      console.log('Response Body:', response.body);

      expect(response.statusCode).toBe(201);
      console.log('Status code assertion passed');

      expect(response.body).toHaveProperty('token');
      console.log('Token property assertion passed');
    } catch (error) {
      console.error('Test failed with error:', error);
      throw error;
    }
  });

  console.log('Exiting test suite');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});