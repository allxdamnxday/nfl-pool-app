// backend/__mocks__/mockEntry.js
const mongoose = require('mongoose');

exports.mockUser = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123'
};

exports.mockAdmin = {
  username: 'adminuser',
  email: 'admin@example.com',
  password: 'adminpass123',
  role: 'admin'
};

exports.mockPool = {
  name: 'Test Pool',
  season: 2023,
  maxParticipants: 10,
  entryFee: 50,
  prizeAmount: 450
};

exports.mockEntry = {
  isActive: true,
  eliminatedWeek: null
};

exports.mockGame = {
  event_id: 'test-event-id',
  event_uuid: 'test-event-uuid',
  sport_id: 2,
  event_date: new Date(Date.now() + 86400000).toISOString(),
  rotation_number_away: 101,
  rotation_number_home: 102,
  teams_normalized: [
    {
      team_id: 1,
      name: 'Team A',
      is_away: true,
      is_home: false
    },
    {
      team_id: 2,
      name: 'Team B',
      is_away: false,
      is_home: true
    }
  ],
  schedule: {
    season_year: 2023,
    week: 1
  }
};