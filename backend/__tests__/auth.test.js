// backend/__tests__/auth.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const crypto = require('crypto');
const { app, connectDB } = require('../server');
const User = require('../models/User');

let server;
// Mock the sendEmail function
jest.mock('../utils/sendEmail');

// Ensure the database is connected before running tests
beforeAll(async () => {
  await connectDB();
});

// Ensure the database is clean before each test
beforeEach(async () => {
  await User.deleteMany({});
});

// Close the database connection after all tests
afterAll(async () => {
  await mongoose.connection.close();
});

describe('Auth Endpoints', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
  });

  it('should login a user', async () => {
    await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should get current user', async () => {
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });
    const token = user.getSignedJwtToken();

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.statusCode).toEqual(200);
    expect(res.body.data).toHaveProperty('username', 'testuser');
  });

  it('should logout a user', async () => {
    const userData = {
      username: 'logoutuser',
      email: 'logout@example.com',
      password: 'password123'
    };
    const loginResponse = await request(app)
      .post('/api/v1/auth/register')
      .send(userData);
    const token = loginResponse.body.token;

    const response = await request(app)
      .get('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toEqual({});

    const meResponse = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(meResponse.statusCode).toBe(401);
  });

  it('should not login with incorrect credentials', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'wrongpassword'
      });

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('error', 'Invalid credentials');
  });

  it('should send a password reset token', async () => {
    const user = await User.create({
      username: 'resetuser',
      email: 'reset@example.com',
      password: 'password123'
    });
  
    const response = await request(app)
      .post('/api/v1/auth/forgotpassword')
      .send({ email: 'reset@example.com' });
  
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toMatch(/Email sent/);
  
    const updatedUser = await User.findById(user._id);
    expect(updatedUser.resetPasswordToken).toBeDefined();
    expect(updatedUser.resetPasswordExpire).toBeDefined();
  
    // Additional check to ensure the token is actually set
    expect(updatedUser.resetPasswordToken).not.toBe(null);
    expect(updatedUser.resetPasswordToken.length).toBeGreaterThan(0);
  });

  it('should reset password', async () => {
    const user = await User.create({
      username: 'resetpassworduser',
      email: 'resetpassword@example.com',
      password: 'password123'
    });

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    const response = await request(app)
      .put(`/api/v1/auth/resetpassword/${resetToken}`)
      .send({ password: 'newpassword123' });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('token');

    const updatedUser = await User.findById(user._id).select('+password');
    const isMatch = await updatedUser.matchPassword('newpassword123');
    expect(isMatch).toBe(true);
  });

  it('should update user details', async () => {
    const user = await User.create({
      username: 'updateuser',
      email: 'update@example.com',
      password: 'password123'
    });
    const token = user.getSignedJwtToken();

    const response = await request(app)
      .put('/api/v1/auth/updatedetails')
      .set('Authorization', `Bearer ${token}`)
      .send({
        username: 'updateduser',
        email: 'updated@example.com'
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data).toHaveProperty('username', 'updateduser');
    expect(response.body.data).toHaveProperty('email', 'updated@example.com');
  });

  it('should update password', async () => {
    const user = await User.create({
      username: 'passwordupdateuser',
      email: 'passwordupdate@example.com',
      password: 'password123'
    });
    const token = user.getSignedJwtToken();

    const response = await request(app)
      .put('/api/v1/auth/updatepassword')
      .set('Authorization', `Bearer ${token}`)
      .send({
        currentPassword: 'password123',
        newPassword: 'newpassword123'
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('token');

    const updatedUser = await User.findById(user._id).select('+password');
    const isMatch = await updatedUser.matchPassword('newpassword123');
    expect(isMatch).toBe(true);
  });
});