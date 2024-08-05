const request = require('supertest');
const { app } = require('../../server');
const User = require('../../models/User');
const Pool = require('../../models/Pool');
const Request = require('../../models/Request');
const Entry = require('../../models/Entry');
const Pick = require('../../models/Pick');
const Game = require('../../models/Game');
const { mockGame } = require('../../__mocks__/mockGame');


let user, admin, pool, token, adminToken;

beforeAll(async () => {
  await connect();

  try {
    user = await User.create({
      firstName: 'Test',
      lastName: 'User',
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'password123',
      isEmailVerified: true,
    });

    admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      username: 'adminuser',
      email: 'admin@example.com',
      password: 'adminpass123',
      role: 'admin',
      isEmailVerified: true,
    });

    pool = await Pool.create({
      name: 'Test Pool',
      season: new Date().getFullYear(),
      maxParticipants: 10,
      entryFee: 50,
      prizeAmount: 450,
      creator: admin._id,
      description: 'Test pool for integration tests',
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      maxEntries: 3,
      prizePot: 450,
      status: 'active',
    });
    
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

    const userRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'testuser@example.com', password: 'password123' });
    token = userRes.body.token;

    const adminRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@example.com', password: 'adminpass123' });
    adminToken = adminRes.body.token;

    const currentDate = new Date();
    const futureDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
    const pastDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);

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
  } catch (error) {
    console.error('Error in beforeAll:', error);
  }
});

afterAll(async () => {
  await closeDatabase();
});

beforeEach(async () => {
  await clearDatabase();

  user = await User.create({
    firstName: 'Test',
    lastName: 'User',
    username: 'testuser',
    email: 'testuser@example.com',
    password: 'password123',
    isEmailVerified: true,
  });

  admin = await User.create({
    firstName: 'Admin',
    lastName: 'User',
    username: 'adminuser',
    email: 'admin@example.com',
    password: 'adminpass123',
    role: 'admin',
    isEmailVerified: true,
  });

  pool = await Pool.create({
    name: 'Test Pool',
    season: new Date().getFullYear(),
    maxParticipants: 10,
    entryFee: 50,
    prizeAmount: 450,
    creator: admin._id,
    description: 'Test pool for integration tests',
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    maxEntries: 3,
    prizePot: 450,
    status: 'active',
  });

  const userRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'testuser@example.com', password: 'password123' });
  token = userRes.body.token;

  const adminRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'admin@example.com', password: 'adminpass123' });
  adminToken = adminRes.body.token;
});

describe('Pool Management', () => {
  test('User can browse available pools', async () => {
    const res = await request(app)
      .get('/api/v1/pools/available')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBeTruthy();
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0]._id.toString()).toBe(pool._id.toString());
  });
});

describe('Request Management', () => {
  test('User can submit multiple requests to join a pool', async () => {
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
      expect(res.body.data.totalAmount).toBe(pool.entryFee);
    }

    // Attempt to create a 4th request (should fail)
    const fourthRes = await request(app)
      .post('/api/v1/requests')
      .set('Authorization', `Bearer ${token}`)
      .send({
        poolId: pool._id,
        numberOfEntries: 1
      });

    expect(fourthRes.statusCode).toBe(400);
    expect(fourthRes.body.error).toBe('You can have a maximum of 3 entries per pool');
  });
});

describe('Entry Creation', () => {
  test('Entries are created for approved requests', async () => {
    // Create 3 requests
    for (let i = 0; i < 3; i++) {
      await request(app)
        .post('/api/v1/requests')
        .set('Authorization', `Bearer ${token}`)
        .send({
          poolId: pool._id,
          numberOfEntries: 1
        });
    }

    const userRequests = await Request.find({ user: user._id, pool: pool._id });

    for (const req of userRequests) {
      // Simulate payment confirmation (if needed)
      await Request.findByIdAndUpdate(req._id, { status: 'payment_pending' });

      const res = await request(app)
        .put(`/api/v1/requests/${req._id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.request.status).toBe('approved');
      expect(res.body.data.entries).toBeDefined();
      expect(res.body.data.entries.length).toBe(1); // Each request is for 1 entry
    }

    const entries = await Entry.find({ user: user._id, pool: pool._id });
    expect(entries.length).toBe(3);
  });
});

describe('Pick Management', () => {
  test('User can make picks for each entry', async () => {
    // Create entries first
    // ... (code to create entries)

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
    // Create entries and past picks first
    // ... (code to create entries and past picks)

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