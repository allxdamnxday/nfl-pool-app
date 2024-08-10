/**
 * @module testLogger
 */

const winston = require('winston');
const path = require('path');

/**
 * Winston logger instance configured for test environment.
 * @type {winston.Logger}
 */
const testLogger = winston.createLogger({
  level: process.env.NODE_ENV === 'test' ? 'error' : 'info',
  silent: process.env.NODE_ENV === 'test',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
    new winston.transports.File({
      filename: path.join(__dirname, '..', 'logs', 'testError.log'),
      level: 'error'
    })
  ],
});

module.exports = testLogger;