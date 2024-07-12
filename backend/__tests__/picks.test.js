const request = require('supertest');
const mongoose = require('mongoose');
const { app, connectDB } = require('../server');
const User = require('../models/User');
const Pool = require('../models/Pool');

let server;

// Ensure the database is connected before running tests
beforeAll(async () => {
  await connectDB();
});

// Ensure the database is clean before each test
beforeEach(async () => {
  await User.deleteMany({});
  await Pool.deleteMany({});
});

// Close the database connection after all tests
afterAll(async () => {
  await mongoose.connection.close();
});

describe('Pool Endpoints', () => {
  let token, userId, nonCreatorToken;

  beforeEach(async () => {
    // Create a user and get token for authenticated requests
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    });
    token = user.getSignedJwtToken();
    userId = user._id;

    // Create another user to act as a non-creator
    const nonCreator = await User.create({
      username: 'noncreator',
      email: 'noncreator@example.com',
      password: 'password123',
    });
    nonCreatorToken = nonCreator.getSignedJwtToken();
  });

  it('should create a new pool with authentication', async () => {
    const res = await request(app)
      .post('/api/v1/pools')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Pool',
        season: 2023,
        maxParticipants: 10,
        entryFee: 50,
        prizeAmount: 450,
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body.data).toHaveProperty('name', 'Test Pool');
  });

  it('should fail to create a new pool without authentication', async () => {
    const res = await request(app)
      .post('/api/v1/pools')
      .send({
        name: 'Test Pool',
        season: 2023,
        maxParticipants: 10,
        entryFee: 50,
        prizeAmount: 450,
      });
    expect(res.statusCode).toEqual(401);
  });

  it('should get all pools with pagination, filtering, and sorting', async () => {
    // Create multiple pools
    await Pool.create([
      {
        name: 'Pool 1',
        season: 2023,
        maxParticipants: 10,
        entryFee: 50,
        prizeAmount: 450,
        creator: mongoose.Types.ObjectId(),
      },
      {
        name: 'Pool 2',
        season: 2023,
        maxParticipants: 20,
        entryFee: 100,
        prizeAmount: 900,
        creator: mongoose.Types.ObjectId(),
      },
      {
        name: 'Pool 3',
        season: 2022,
        maxParticipants: 15,
        entryFee: 75,
        prizeAmount: 675,
        creator: mongoose.Types.ObjectId(),
      },
    ]);

    // Test pagination
    let res = await request(app).get('/api/v1/pools?page=1&limit=2');
    expect(res.statusCode).toEqual(200);
    expect(res.body.data.length).toEqual(2);

    // Test filtering
    res = await request(app).get('/api/v1/pools?season=2023');
    expect(res.statusCode).toEqual(200);
    expect(res.body.data.length).toEqual(2);

    // Test sorting
    res = await request(app).get('/api/v1/pools?sort=-entryFee');
    expect(res.statusCode).toEqual(200);
    expect(res.body.data[0].entryFee).toEqual(100);
  });

  it('should get a single pool by ID', async () => {
    // Create a pool
    const pool = await Pool.create({
      name: 'Test Pool',
      season: 2023,
      maxParticipants: 10,
      entryFee: 50,
      prizeAmount: 450,
      creator: mongoose.Types.ObjectId(),
    });

    // Get the pool by ID
    const res = await request(app).get(`/api/v1/pools/${pool._id}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.data).toHaveProperty('name', 'Test Pool');
  });

  it('should fail to get a pool with non-existent ID', async () => {
    const nonExistentId = mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/v1/pools/${nonExistentId}`);
    expect(res.statusCode).toEqual(404);
  });

  it('should update a pool as the creator', async () => {
    // Create a pool
    const pool = await Pool.create({
      name: 'Test Pool',
      season: 2023,
      maxParticipants: 10,
      entryFee: 50,
      prizeAmount: 450,
      creator: userId,
    });

    // Update the pool
    const res = await request(app)
      .put(`/api/v1/pools/${pool._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Updated Pool',
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body.data).toHaveProperty('name', 'Updated Pool');
  });

  it('should fail to update a pool as a non-creator', async () => {
    // Create a pool with a different creator
    const pool = await Pool.create({
      name: 'Test Pool',
      season: 2023,
      maxParticipants: 10,
      entryFee: 50,
      prizeAmount: 450,
      creator: mongoose.Types.ObjectId(),
    });

    // Attempt to update the pool
    const res = await request(app)
      .put(`/api/v1/pools/${pool._id}`)
      .set('Authorization', `Bearer ${nonCreatorToken}`)
      .send({
        name: 'Updated Pool',
      });
    expect(res.statusCode).toEqual(403); // Ensure this matches the updated controller
  });

  it('should fail to delete a pool as a non-creator', async () => {
    // Create a pool with a different creator
    const pool = await Pool.create({
      name: 'Test Pool',
      season: 2023,
      maxParticipants: 10,
      entryFee: 50,
      prizeAmount: 450,
      creator: mongoose.Types.ObjectId(),
    });

    // Attempt to delete the pool
    const res = await request(app)
      .delete(`/api/v1/pools/${pool._id}`)
      .set('Authorization', `Bearer ${nonCreatorToken}`);
    expect(res.statusCode).toEqual(403); // Ensure this matches the updated controller
  });

  it('should join a pool', async () => {
    const pool = await Pool.create({
      name: 'Test Pool',
      season: 2023,
      maxParticipants: 10,
      entryFee: 50,
      prizeAmount: 450,
      creator: userId,
    });

    const res = await request(app)
      .post(`/api/v1/pools/${pool._id}/join`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.participants).toContain(userId.toString());
  });

  it('should fail to join a full pool', async () => {
    const pool = await Pool.create({
      name: 'Test Pool',
      season: 2023,
      maxParticipants: 2, // Change maxParticipants to 2
      entryFee: 50,
      prizeAmount: 450,
      creator: userId,
      participants: [userId, mongoose.Types.ObjectId()], // Add a second participant
    });

    const res = await request(app)
      .post(`/api/v1/pools/${pool._id}/join`)
      .set('Authorization', `Bearer ${nonCreatorToken}`);

    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toEqual('Pool is already full'); // Update to match the actual error message
  });

  it('should fail to join a pool user is already in', async () => {
    const pool = await Pool.create({
      name: 'Test Pool',
      season: 2023,
      maxParticipants: 10,
      entryFee: 50,
      prizeAmount: 450,
      creator: userId,
      participants: [userId],
    });

    const res = await request(app)
      .post(`/api/v1/pools/${pool._id}/join`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toEqual('User is already in this pool'); // Update to match the actual error message
  });

  it('should leave a pool', async () => {
    const pool = await Pool.create({
      name: 'Test Pool',
      season: 2023,
      maxParticipants: 10,
      entryFee: 50,
      prizeAmount: 450,
      creator: userId,
      participants: [userId],
    });

    const res = await request(app)
      .post(`/api/v1/pools/${pool._id}/leave`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.participants).not.toContain(userId.toString());
  });

  it('should fail to leave a pool user is not in', async () => {
    const pool = await Pool.create({
      name: 'Test Pool',
      season: 2023,
      maxParticipants: 10,
      entryFee: 50,
      prizeAmount: 450,
      creator: userId,
    });

    const res = await request(app)
      .post(`/api/v1/pools/${pool._id}/leave`)
      .set('Authorization', `Bearer ${nonCreatorToken}`);

    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toEqual('User is not in this pool');
  });
});