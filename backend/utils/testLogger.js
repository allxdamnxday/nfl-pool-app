/**
 * @module testLogger
 */

const winston = require('winston');

/**
 * Winston logger instance configured for test environment.
 * @type {winston.Logger}
 */
const testLogger = winston.createLogger({
  level: process.env.NODE_ENV === 'test' ? 'error' : 'info',
  silent: process.env.NODE_ENV === 'test',
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

module.exports = testLogger;