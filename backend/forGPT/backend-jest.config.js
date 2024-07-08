module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.js?(x)', '**/?(*.)+(spec|test).js?(x)'],
  setupFilesAfterEnv: ['./jest.setup.js'],
  coveragePathIgnorePatterns: ['/node_modules/'],
  globalSetup: './jest.global-setup.js',
  globalTeardown: './jest.global-teardown.js',
  moduleNameMapper: {
    '^utils/sendEmail$': '<rootDir>/__mocks__/sendEmail.js'
  }
};
