// nfl-pool-app/backend/middleware/requestLogger.js
const requestLogger = (req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
};

module.exports = requestLogger;
