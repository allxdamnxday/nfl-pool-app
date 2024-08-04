// nfl-pool-app/backend/middleware/requestLogger.js
const requestLogger = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} - ${res.statusCode} - ${duration}ms - ${new Date().toISOString()}`);
  });
  next();
};

module.exports = requestLogger;