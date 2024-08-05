/**
 * @module AsyncMiddleware
 * @description Provides a wrapper for asynchronous middleware functions to handle errors consistently.
 */

/**
 * Wraps an asynchronous middleware function to catch any errors and pass them to the next middleware.
 * @function asyncHandler
 * @param {Function} fn - The asynchronous middleware function to wrap
 * @returns {Function} A middleware function that handles asynchronous errors
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;

/**
 * @example
 * // Using asyncHandler to wrap an asynchronous route handler
 * const someAsyncOperation = async () => {
 *   // ... some async operation that might throw an error
 * };
 * 
 * router.get('/async-route', asyncHandler(async (req, res) => {
 *   await someAsyncOperation();
 *   res.json({ message: 'Async operation completed successfully' });
 * }));
 */

/**
 * Additional Notes:
 * - This middleware is useful for avoiding try-catch blocks in every asynchronous route handler.
 * - It ensures that any errors thrown in the wrapped function are passed to Express's error handling middleware.
 * - The wrapped function should be an async function or return a Promise.
 * - This pattern helps in keeping the code clean and maintaining consistent error handling across the application.
 */