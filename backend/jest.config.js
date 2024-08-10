module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./__tests__/testSetup.js'],
  testMatch: ['**/__tests__/**/*.test.js'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  modulePathIgnorePatterns: ['__tests__/testSetup.js', '__tests__/controllerTestSetup.js'],
  projects: [
    {
      displayName: 'controllers',
      testMatch: ['**/__tests__/controllers/**/*.test.js'],
      setupFilesAfterEnv: ['./__tests__/controllerTestSetup.js'],
    },
    {
      displayName: 'models and services',
      testMatch: ['**/__tests__/models/**/*.test.js', '**/__tests__/services/**/*.test.js'],
      setupFilesAfterEnv: ['./__tests__/testSetup.js'],
    },
  ],
};