module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./__tests__/testSetup.js'],
  testMatch: ['**/__tests__/**/*.test.js'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};