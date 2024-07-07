module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.js'],
  setupFilesAfterEnv: ['./jest.setup.js'],
  testTimeout: 10000
};