// __tests__/controllerTestSetup.js
const dotenv = require('dotenv');
const path = require('path');

// Load env vars from .env.test file
dotenv.config({ path: path.join(__dirname, '..', '.env.test') });

// Add any global setup needed for controller tests here
// For example, you might want to set up global mocks

global.console = {
  ...console,
  // uncomment to ignore a specific log level
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};