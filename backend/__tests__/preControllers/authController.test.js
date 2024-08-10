// backend/__tests__/controllers/authController.test.js

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { app } = require('../../server');
const User = require('../../models/User');
const { generateToken, generateExpiredToken, generateVerificationToken } = require('../../helpers/authHelpers');
const crypto = require('crypto');
const { mockUser, mockAdminUser } = require('../../__mocks__/mockUser');

jest.mock('../../utils/sendEmail');

describe('Auth Controller', () => {
  let mongod;

  beforeAll(async () => {
    // Create an instance of MongoMemoryServer
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    // Connect to the in-memory database
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    // Close the database connection and stop MongoMemoryServer
    await mongoose.connection.close();
    await mongod.stop();
  });

  beforeEach(async () => {
    // Clear the database before each test
    await User.deleteMany({});
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user and return 201 status', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          username: 'johndoe',
          email: 'john@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('message', 'User registered successfully. Please check your email to verify your account.');
    });

    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('error');
    });

    it('should return 400 if username is already taken', async () => {
      await User.create({
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: 'password123'
      });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          firstName: 'Jane',
          lastName: 'Doe',
          username: 'johndoe',
          email: 'jane@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('error', 'Duplicate field value entered');
    });

    it('should return 400 if email is already taken', async () => {
      await User.create({
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: 'password123'
      });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          firstName: 'Jane',
          lastName: 'Doe',
          username: 'janedoe',
          email: 'john@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('error', 'User with this email already exists');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await User.create({
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: 'password123',
        isEmailVerified: true
      });
    });

    it('should login successfully and return a token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'john@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('token');
    });

    it('should return 401 for invalid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'john@example.com',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('error', 'Invalid credentials');
    });
  });

  describe('GET /api/v1/auth/logout', () => {
    it('should logout successfully', async () => {
      const user = await User.create({
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: 'password123',
        isEmailVerified: true
      });

      const token = generateToken(user);

      const res = await request(app)
        .get('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data', {});
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return current user details', async () => {
      const user = await User.create({
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: 'password123',
        isEmailVerified: true
      });

      const token = generateToken(user);

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('email', 'john@example.com');
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me');

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('error', 'Not authorized to access this route');
    });

    it('should return 401 if token is expired', async () => {
      const user = await User.create({
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: 'password123',
        isEmailVerified: true
      });

      const expiredToken = generateExpiredToken(user);

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('error', 'Not authorized to access this route');
    });
  });

  describe('POST /api/v1/auth/forgotpassword', () => {
    it('should send a reset password email and set reset token', async () => {
      const user = await User.create({
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: 'password123',
        isEmailVerified: true
      });
  
      const res = await request(app)
        .post('/api/v1/auth/forgotpassword')
        .send({ email: 'john@example.com' });
  
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('message', 'Email sent');
  
      // Check if the reset token is set on the user document
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.resetPasswordToken).toBeDefined();
      expect(updatedUser.resetPasswordExpire).toBeDefined();
      expect(updatedUser.resetPasswordToken).not.toBe(null);
      expect(updatedUser.resetPasswordToken.length).toBeGreaterThan(0);
  
      // Check if the reset token expiration is set to a future date
      expect(updatedUser.resetPasswordExpire).toBeInstanceOf(Date);
      expect(updatedUser.resetPasswordExpire.getTime()).toBeGreaterThan(Date.now());
    });
  
    it('should return 404 for non-existent email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/forgotpassword')
        .send({ email: 'nonexistent@example.com' });
  
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('error', 'There is no user with that email');
    });
  });

  describe('POST /api/v1/auth/resetpassword/:resettoken', () => {
    it('should return 200 for successful password reset', async () => {
      const user = await User.create({
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: 'password123'
      });

      const resetToken = user.getResetPasswordToken();
      await user.save({ validateBeforeSave: false });

      const res = await request(app)
        .put(`/api/v1/auth/resetpassword/${resetToken}`)
        .send({ password: 'newpassword123' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('token');
    });
  });

  describe('GET /api/v1/auth/verify-email/:token', () => {
    it('should return 200 for successful email verification', async () => {
      const verificationToken = crypto.randomBytes(20).toString('hex');
  
      const user = await User.create({
        ...mockUser,
        isEmailVerified: false,
        verificationToken: verificationToken,
        verificationTokenExpire: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
      });
  
      const res = await request(app)
        .get(`/api/v1/auth/verify-email/${verificationToken}`);
  
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('message', 'Email verified successfully');
  
      // Check if the user's email is now verified
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.isEmailVerified).toBe(true);
      expect(updatedUser.verificationToken).toBeUndefined();
      expect(updatedUser.verificationTokenExpire).toBeUndefined();
    });
  
    it('should return 400 for invalid token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/verify-email/invalidtoken');
  
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('error', 'Invalid token');
    });
  });
  
  describe('POST /api/v1/auth/resend-verification', () => {
    it('should return 200 for successful resend of verification email', async () => {
      const user = await User.create({
        ...mockUser,
        isEmailVerified: false
      });
  
      const res = await request(app)
        .post('/api/v1/auth/resend-verification')
        .send({ email: user.email });
  
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('message', 'Verification email sent');
  
      // Check if a new verification token has been set
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.verificationToken).toBeDefined();
      expect(updatedUser.verificationTokenExpire).toBeDefined();
    });
  
    it('should return 400 for already verified email', async () => {
      const user = await User.create({
        ...mockUser,
        isEmailVerified: true
      });
  
      const res = await request(app)
        .post('/api/v1/auth/resend-verification')
        .send({ email: user.email });
  
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('error', 'This email is already verified');
    });
  
    it('should return 404 for non-existent email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/resend-verification')
        .send({ email: 'nonexistent@example.com' });
  
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('error', 'There is no user with that email');
    });
  });
});