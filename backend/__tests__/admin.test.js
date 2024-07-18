// backend/__tests__/admin.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../server');
const User = require('../models/User');
const { generateAdminToken, generateToken } = require('../helpers/authHelpers');
const { connectDB, closeDatabase, clearDatabase } = require('../helpers/dbHelpers');

beforeAll(async () => {
  await connectDB();
});

beforeEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await closeDatabase();
});

describe('Admin Endpoints', () => {
  let adminToken, userToken;

  beforeEach(async () => {
    const admin = await User.create({
      username: 'adminuser',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin'
    });
    adminToken = generateAdminToken(admin);

    const user = await User.create({
      username: 'regularuser',
      email: 'user@example.com',
      password: 'password123',
      role: 'user'
    });
    userToken = generateToken(user);
  });

  it('should not allow non-admin users to access admin routes', async () => {
    const res = await request(app)
      .get('/api/v1/admin/users')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('error', 'User role user is not authorized to access this route');
  });

  it('should get all users', async () => {
    const res = await request(app)
      .get('/api/v1/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toBeInstanceOf(Array);
  });

  it('should get a single user', async () => {
    const user = await User.create({
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'password123'
    });

    const res = await request(app)
      .get(`/api/v1/admin/users/${user._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('username', 'testuser');
  });

  it('should return 404 for non-existent user', async () => {
    const res = await request(app)
      .get(`/api/v1/admin/users/${mongoose.Types.ObjectId()}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('error', expect.stringContaining('User not found with id of'));
  });

  it('should return 400 for invalid input', async () => {
    const res = await request(app)
      .post('/api/v1/admin/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        username: '', // Invalid input
        email: 'invalidemail', // Invalid input
        password: 'pass'
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('error', 'Please provide all required fields');
  });

  it('should get application statistics', async () => {
    const res = await request(app)
      .get('/api/v1/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('usersCount');
  });

  it('should sync rundown data', async () => {
    const res = await request(app)
      .post('/api/v1/admin/sync-rundown')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toEqual('Data synced successfully');
  });

  it('should update a user role to admin', async () => {
    const user = await User.create({
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'password123',
      role: 'user'
    });

    const res = await request(app)
      .put(`/api/v1/admin/users/${user._id}/grant-admin`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.data).toHaveProperty('role', 'admin');
  });
});