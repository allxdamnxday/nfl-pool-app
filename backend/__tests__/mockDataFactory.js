const { faker } = require('@faker-js/faker');
const mongoose = require('mongoose');
const crypto = require('crypto');

// Helper function to create a MongoDB ObjectId
const createObjectId = () => new mongoose.Types.ObjectId();

const createUser = (overrides = {}) => {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  let username = faker.internet.userName({ firstName, lastName });
  username = username.substring(0, 20); // Ensure username is not longer than 20 characters
  const email = faker.internet.email({ firstName, lastName });
  const verificationToken = crypto.randomBytes(20).toString('hex');

  return {
    _id: createObjectId(),
    firstName,
    lastName,
    username,
    email,
    password: faker.internet.password({ length: 10 }),
    role: faker.helpers.arrayElement(['user', 'admin']),
    isEmailVerified: faker.datatype.boolean(),
    verificationToken,
    verificationTokenExpire: faker.date.future(),
    resetPasswordToken: faker.datatype.boolean() ? crypto.randomBytes(20).toString('hex') : undefined,
    resetPasswordExpire: faker.datatype.boolean() ? faker.date.future() : undefined,
    createdAt: faker.date.past(),
    ...overrides
  };
};

const createAdmin = (overrides = {}) => ({
  ...createUser(),
  role: 'admin',
  ...overrides
});

const createRequest = (userId, poolId, overrides = {}) => ({
  _id: createObjectId(),
  user: userId || createObjectId(),
  pool: poolId || createObjectId(),
  numberOfEntries: faker.number.int({ min: 1, max: 3 }),
  status: 'pending',
  totalAmount: faker.number.int({ min: 10, max: 1000 }),
  paymentStatus: 'pending',
  ...overrides
});

const createPool = (creatorId, overrides = {}) => ({
  _id: createObjectId(),
  name: faker.company.name() + ' Pool',
  season: faker.date.future().getFullYear(),
  maxParticipants: faker.number.int({ min: 2, max: 10000 }),
  entryFee: faker.number.int({ min: 1, max: 1000 }),
  prizeAmount: faker.number.int({ min: 100, max: 100000 }),
  creator: creatorId || createObjectId(),
  description: faker.lorem.paragraph(),
  startDate: faker.date.future(),
  endDate: faker.date.future(),
  maxEntries: faker.number.int({ min: 2, max: 30000 }),
  prizePot: faker.number.int({ min: 1000, max: 1000000 }),
  ...overrides
});

const createEntry = (userId, poolId, requestId, overrides = {}) => ({
  user: userId,
  pool: poolId,
  request: requestId,
  entryNumber: faker.number.int({ min: 1, max: 3 }),
  status: 'active',
  ...overrides
});

const createPick = (entryId, overrides = {}) => ({
    entry: entryId,
    entryNumber: overrides.entryNumber || faker.number.int({ min: 1, max: 3 }),
    week: overrides.week || faker.number.int({ min: 1, max: 18 }),
    team: faker.company.name(),
    result: overrides.result || 'pending',
    ...overrides
  });

const createGame = (overrides = {}) => ({
  _id: createObjectId(),
  event_id: faker.string.uuid(),
  event_uuid: faker.string.uuid(),
  sport_id: 1,
  event_date: faker.date.future(),
  away_team_id: faker.number.int({ min: 1, max: 32 }),
  home_team_id: faker.number.int({ min: 1, max: 32 }),
  away_team: faker.company.name() + ' ' + faker.animal.type(),
  home_team: faker.company.name() + ' ' + faker.animal.type(),
  score: {
    event_status: faker.helpers.arrayElement(['scheduled', 'in_progress', 'final']),
    winner_away: faker.number.int({ min: 0, max: 1 }),
    winner_home: faker.number.int({ min: 0, max: 1 }),
    score_away: faker.number.int({ min: 0, max: 50 }),
    score_home: faker.number.int({ min: 0, max: 50 }),
    score_away_by_period: Array.from({ length: 4 }, () => faker.number.int({ min: 0, max: 14 })),
    score_home_by_period: Array.from({ length: 4 }, () => faker.number.int({ min: 0, max: 14 })),
    game_clock: faker.number.int({ min: 0, max: 3600 }),
    game_period: faker.number.int({ min: 1, max: 4 })
  },
  teams_normalized: [
    {
      team_id: faker.number.int({ min: 1, max: 32 }),
      name: faker.company.name(),
      mascot: faker.animal.type(),
      abbreviation: faker.string.alpha({ length: 3, casing: 'upper' }),
      is_away: true,
      is_home: false
    },
    {
      team_id: faker.number.int({ min: 1, max: 32 }),
      name: faker.company.name(),
      mascot: faker.animal.type(),
      abbreviation: faker.string.alpha({ length: 3, casing: 'upper' }),
      is_away: false,
      is_home: true
    }
  ],
  schedule: {
    season_year: faker.date.future().getFullYear(),
    week: faker.number.int({ min: 1, max: 18 }),
    season_type: faker.helpers.arrayElement(['regular', 'preseason', 'postseason'])
  },
  ...overrides
});

module.exports = {
  createUser,
  createAdmin,
  createRequest,
  createPool,
  createEntry,
  createPick,
  createGame,
  createObjectId
};