// backend/__tests__/games.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const { app, connectDB } = require('../server');
const Game = require('../models/Game');
const User = require('../models/User');
const rundownApi = require('../services/rundownApiService');

let token;

jest.mock('../services/rundownApiService');

beforeAll(async () => {
  await connectDB();
  
  const user = await User.create({
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123'
  });
  token = user.getSignedJwtToken();
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  await Game.deleteMany({});
});

describe('Game Routes', () => {
  describe('GET /api/v1/games', () => {
    it('should return all games sorted by date_event', async () => {
      await Game.create([
        {
          id: '1',
          event_id: 'event1',
          event_uuid: 'uuid1',
          sport_id: 1,
          season_type: 'regular',
          season_year: 2023,
          away_team: 'Away Team 1',
          home_team: 'Home Team 1',
          date_event: new Date('2023-09-10'),
          neutral_site: false,
          conference_competition: false,
          league_name: 'NFL',
          event_name: 'Game 1',
          updated_at: new Date()
        },
        {
          id: '2',
          event_id: 'event2',
          event_uuid: 'uuid2',
          sport_id: 1,
          season_type: 'regular',
          season_year: 2023,
          away_team: 'Away Team 2',
          home_team: 'Home Team 2',
          date_event: new Date('2023-09-09'),
          neutral_site: false,
          conference_competition: false,
          league_name: 'NFL',
          event_name: 'Game 2',
          updated_at: new Date()
        }
      ]);

      const res = await request(app)
        .get('/api/v1/games')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data[0].event_name).toBe('Game 2');
      expect(res.body.data[1].event_name).toBe('Game 1');
    });
  });

  describe('GET /api/v1/games/:id', () => {
    it('should return a single game by ID', async () => {
      const game = await Game.create({
        id: '3',
        event_id: 'event3',
        event_uuid: 'uuid3',
        sport_id: 1,
        season_type: 'regular',
        season_year: 2023,
        away_team: 'Away Team 3',
        home_team: 'Home Team 3',
        date_event: new Date(),
        neutral_site: false,
        conference_competition: false,
        league_name: 'NFL',
        event_name: 'Game 3',
        updated_at: new Date()
      });

      const res = await request(app)
        .get(`/api/v1/games/${game._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('event_name', 'Game 3');
    });

    it('should return 404 if game not found', async () => {
      const fakeId = mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/v1/games/${fakeId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('error', `Game not found with id of ${fakeId}`);
    });
  });

  describe('POST /api/v1/games/fetch', () => {
    it('should fetch and store games from external API', async () => {
      const mockApiResponse = {
        data: {
          events: [
            {
              id: '4',
              event_id: 'event4',
              event_uuid: 'uuid4',
              sport_id: 1,
              season_type: 'regular',
              season_year: 2023,
              away_team: 'Away Team 4',
              home_team: 'Home Team 4',
              date_event: new Date().toISOString(),
              neutral_site: false,
              conference_competition: false,
              league_name: 'NFL',
              event_name: 'Game 4',
              updated_at: new Date().toISOString()
            }
          ]
        }
      };

      rundownApi.get.mockResolvedValue(mockApiResponse);

      const res = await request(app)
        .post('/api/v1/games/fetch')
        .set('Authorization', `Bearer ${token}`)
        .send({ season_year: 2023, sport_id: 1 });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0]).toHaveProperty('event_name', 'Game 4');

      const storedGame = await Game.findOne({ event_id: 'event4' });
      expect(storedGame).toBeTruthy();
      expect(storedGame.event_name).toBe('Game 4');
    });
  });
});