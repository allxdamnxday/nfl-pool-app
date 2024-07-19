// backend/__tests__/auth.test.js
const request = require('supertest');
const crypto = require('crypto');
const { app } = require('../server');
const User = require('../models/User');
const { mockUser, mockAdminUser } = require('../__mocks__/mockUser');
const { generateToken, generateExpiredToken } = require('../helpers/authHelpers');
const { connectDB, closeDatabase, clearDatabase } = require('../helpers/dbHelpers');

// Mock the sendEmail function
jest.mock('../utils/sendEmail');

beforeAll(async () => {
  await connectDB();
});

beforeEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await closeDatabase();
});

describe('Auth Endpoints', () => {
  describe('POST /api/v1/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(mockUser);
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('token');
    });

    it('should not register a user with the same first and last name', async () => {
      await User.create(mockUser);
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(mockUser);
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error', 'A user with this first and last name combination already exists');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login a user', async () => {
      await User.create(mockUser);
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: mockUser.email,
          password: mockUser.password
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
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
  });

  describe('GET /api/v1/auth/me', () => {
    it('should get current user', async () => {
      const user = await User.create(mockUser);
      const token = generateToken(user);
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('username', mockUser.username);
    });
  });

  describe('GET /api/v1/auth/logout', () => {
    it('should logout a user', async () => {
      const loginResponse = await request(app)
        .post('/api/v1/auth/register')
        .send(mockUser);
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
  });

  describe('POST /api/v1/auth/forgotpassword', () => {
    it('should send a password reset token', async () => {
      const user = await User.create(mockUser);
      const response = await request(app)
        .post('/api/v1/auth/forgotpassword')
        .send({ email: mockUser.email });
    
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toMatch(/Email sent/);
    
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.resetPasswordToken).toBeDefined();
      expect(updatedUser.resetPasswordExpire).toBeDefined();
      expect(updatedUser.resetPasswordToken).not.toBe(null);
      expect(updatedUser.resetPasswordToken.length).toBeGreaterThan(0);
    });
  });

  describe('PUT /api/v1/auth/resetpassword/:resettoken', () => {
    it('should reset password', async () => {
      const user = await User.create(mockUser);
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

    it('should not reset password with an expired token', async () => {
      const user = await User.create(mockUser);
      const resetToken = crypto.randomBytes(20).toString('hex');
      user.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
      user.resetPasswordExpire = Date.now() - 10 * 60 * 1000; // Expired 10 minutes ago
      await user.save();
    
      const response = await request(app)
        .put(`/api/v1/auth/resetpassword/${resetToken}`)
        .send({ password: 'newpassword123' });
    
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Invalid token');
    });
  });

  describe('PUT /api/v1/auth/updatedetails', () => {
    it('should update user details', async () => {
      const user = await User.create(mockUser);
      const token = generateToken(user);

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
  });

  describe('PUT /api/v1/auth/updatepassword', () => {
    it('should update password', async () => {
      const user = await User.create(mockUser);
      const token = generateToken(user);

      const response = await request(app)
        .put('/api/v1/auth/updatepassword')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: mockUser.password,
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

  describe('Token validation', () => {
    it('should reject access with a malformed token', async () => {
      const token = 'malformed.token.string';
    
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);
    
      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Not authorized to access this route');
    });
    
    it('should reject access with a token signed with an incorrect secret', async () => {
      const user = await User.create(mockUser);
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYwYjJiMzYwYzM3NjM4MjRlY2ZlMjMxMiIsImlhdCI6MTYyMjMwNjY1NiwiZXhwIjoxNjI0ODk4NjU2fQ.7FvAhjHC3hToXylbvY9ZzlGngHtZW5XiNTIfBAkx7QM';
    
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);
    
      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Not authorized to access this route');
    });

    it('should reject access with an expired token', async () => {
      const user = await User.create(mockUser);
      const token = generateExpiredToken(user);
    
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);
    
      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Not authorized to access this route');
    });
  });

  describe('Admin route access', () => {
    it('should deny access to admin route for non-admin user', async () => {
      const user = await User.create(mockUser);
      const token = generateToken(user);
    
      const response = await request(app)
        .get('/api/v1/admin/some-protected-route')
        .set('Authorization', `Bearer ${token}`);
    
      expect(response.statusCode).toBe(403);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'User role user is not authorized to access this route');
    });
  });
});