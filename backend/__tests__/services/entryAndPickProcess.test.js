const request = require('supertest');
const { app } = require('../../server');
const User = require('../../models/User');
const Pool = require('../../models/Pool');
const Request = require('../../models/Request');
const Entry = require('../../models/Entry');
const Pick = require('../../models/Pick');
const Game = require('../../models/Game');
const { mockGame } = require('../../__mocks__/mockGame');
const { connectToDatabase, closeDatabase, clearDatabase } = require('../testUtils');

let user, admin, pool, token, adminToken;

beforeAll(async () => {
  await connectToDatabase();

  // Create a test user and admin
  user = await User.create({
    firstName: 'Test',
    lastName: 'User',
    username: 'testuser',
    email: 'testuser@example.com',
    password: 'password123',
    isEmailVerified: true, // Set this to true for testing purposes
  });

  admin = await User.create({
    firstName: 'Admin',
    lastName: 'User',
    username: 'adminuser',
    email: 'admin@example.com',
    password: 'adminpass123',
    role: 'admin',
    isEmailVerified: true, // Set this to true for testing purposes
  });

// Create a test pool
pool = await Pool.create({
    name: 'Test Pool',
    season: new Date().getFullYear(),
    maxParticipants: 10,
    entryFee: 50,
    prizeAmount: 450,
    creator: admin._id,
    description: 'Test pool for integration tests',
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    maxEntries: 3,
    prizePot: 450
  });
  
  // Create a mock game
  await Game.create({
    ...mockGame,
    event_id: 'test_event_id',
    event_uuid: 'test_event_uuid',
    sport_id: 1,
    event_date: new Date(),
    away_team_id: 1,
    home_team_id: 2,
    away_team: 'Away Team',
    home_team: 'Home Team'
  });

  // Get tokens for user and admin
  const userRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'testuser@example.com', password: 'password123' });
  token = userRes.body.token;

  const adminRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'admin@example.com', password: 'adminpass123' });
  adminToken = adminRes.body.token;

  // Create test games
  const currentDate = new Date();
  const futureDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000); // 1 day in the future
  const pastDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000); // 1 day in the past

  await Game.create([
    {
      event_id: 'future_game',
      event_uuid: 'future_game_uuid',
      sport_id: 1,
      home_team_id: 1,
      away_team_id: 2,
      home_team: 'Home Team',
      away_team: 'Away Team',
      event_date: futureDate,
      schedule: { week: 1, season_year: currentDate.getFullYear() }
    },
    {
      event_id: 'past_game',
      event_uuid: 'past_game_uuid',
      sport_id: 1,
      home_team_id: 3,
      away_team_id: 4,
      home_team: 'Past Home Team',
      away_team: 'Past Away Team',
      event_date: pastDate,
      schedule: { week: 1, season_year: currentDate.getFullYear() }
    }
  ]);
});

afterAll(async () => {
  await closeDatabase();
});

beforeEach(async () => {
  await clearDatabase();
});

describe('Entry and Pick Process', () => {
  test('User registration, email verification, and login process', async () => {
    // Register a new user
    const registerRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        firstName: 'New',
        lastName: 'User',
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123'
      });

    expect(registerRes.statusCode).toBe(201);
    expect(registerRes.body.success).toBe(true);

    // Get the user from the database
    const newUser = await User.findOne({ email: 'newuser@example.com' });
    expect(newUser).toBeDefined();
    expect(newUser.isEmailVerified).toBe(false);

    // Simulate email verification
    const verifyRes = await request(app)
      .get(`/api/v1/auth/verify-email/${newUser.verificationToken}`);

    expect(verifyRes.statusCode).toBe(200);
    expect(verifyRes.body.success).toBe(true);

    // Attempt to login
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'newuser@example.com',
        password: 'password123'
      });

    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body.success).toBe(true);
    expect(loginRes.body.token).toBeDefined();
  });

  test('User cannot login without email verification', async () => {
    // Create an unverified user
    await User.create({
      firstName: 'Unverified',
      lastName: 'User',
      username: 'unverified',
      email: 'unverified@example.com',
      password: 'password123',
      isEmailVerified: false
    });

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'unverified@example.com',
        password: 'password123'
      });

    expect(loginRes.statusCode).toBe(403);
    expect(loginRes.body.success).toBe(false);
    expect(loginRes.body.error).toContain('Please verify your email before logging in');
  });

  test('User can browse available pools', async () => {
    const res = await request(app)
      .get('/api/v1/pools')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBeTruthy();
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('User can submit up to 3 requests to join a pool', async () => {
    for (let i = 0; i < 3; i++) {
      const res = await request(app)
        .post('/api/v1/requests')
        .set('Authorization', `Bearer ${token}`)
        .send({
          poolId: pool._id,
          numberOfEntries: 1
        });
  
      expect(res.statusCode).toBe(201);
      expect(res.body.data.status).toBe('pending');
    }
  });

  test('User can complete payment and provide transaction ID', async () => {
    const requests = await Request.find({ user: user._id });
    for (let request of requests) {
      const res = await request(app)
        .put(`/api/v1/requests/${request._id}/confirm-payment`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          transactionId: `TRANS_${Math.random().toString(36).substr(2, 9)}`,
          paymentMethod: 'credit_card',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe('payment_pending');
    }
  });

  test('Admin can approve requests', async () => {
    const requests = await Request.find({ user: user._id });
    for (let request of requests) {
      const res = await request(app)
        .put(`/api/v1/requests/${request._id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.request.status).toBe('approved');
      expect(res.body.data.entries).toBeDefined();
    }
  });

  test('Entries are created for approved requests', async () => {
    const requests = await Request.find({ user: user._id, pool: pool._id });
    
    for (const request of requests) {
      request.status = 'approved';
      await request.save();
    }

    // Trigger entry creation (you might need to implement this functionality)
    await request(app)
      .post('/api/v1/entries/create-from-requests')
      .set('Authorization', `Bearer ${adminToken}`);

    const entries = await Entry.find({ user: user._id, pool: pool._id });
    expect(entries.length).toBe(3);
  });

  test('User can make picks for each entry', async () => {
    const entries = await Entry.find({ user: user._id, pool: pool._id });
    const futureGame = await Game.findOne({ event_id: 'future_game' });
    
    for (let entry of entries) {
      const res = await request(app)
        .post(`/api/v1/picks`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          entryId: entry._id,
          week: futureGame.schedule.week,
          team: futureGame.home_team,
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.team).toBe(futureGame.home_team);
    }
  });

  test('User cannot update picks after deadline', async () => {
    const entries = await Entry.find({ user: user._id, pool: pool._id });
    const pastGame = await Game.findOne({ event_id: 'past_game' });
    
    for (let entry of entries) {
      const res = await request(app)
        .put(`/api/v1/picks`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          entryId: entry._id,
          week: pastGame.schedule.week,
          team: pastGame.home_team,
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Cannot pick a game that has already started');
    }
  });
});