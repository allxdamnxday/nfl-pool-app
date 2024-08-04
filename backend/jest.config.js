module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.js?(x)', '**/?(*.)+(spec|test).js?(x)'],
  coveragePathIgnorePatterns: ['/node_modules/'],
  moduleNameMapper: {
    '^utils/sendEmail$': '<rootDir>/__mocks__/sendEmail.js'
  },
  testTimeout: 30000,
};