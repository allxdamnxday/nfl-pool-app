/**
 * @module AdvancedResultsMiddleware
 * @description Provides advanced querying, filtering, sorting, and pagination functionality for API endpoints.
 */

/**
 * Creates a middleware function for advanced results processing.
 * @function advancedResults
 * @param {mongoose.Model} model - The Mongoose model to query
 * @param {string|Object} [populate] - The populate options for the query
 * @returns {Function} Express middleware function
 */
const advancedResults = (model, populate) => async (req, res, next) => {
    let query;
  
    // Copy req.query
    const reqQuery = { ...req.query };
  
    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];
  
    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);
  
    // Create query string
    let queryStr = JSON.stringify(reqQuery);
  
    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
  
    // Finding resource
    query = model.find(JSON.parse(queryStr));
  
    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }
  
    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }
  
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await model.countDocuments(JSON.parse(queryStr));
  
    query = query.skip(startIndex).limit(limit);
  
    if (populate) {
      query = query.populate(populate);
    }
  
    // Executing query
    const results = await query;
  
    // Pagination result
    const pagination = {};
  
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }
  
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }
  
    res.advancedResults = {
      success: true,
      count: results.length,
      pagination,
      data: results
    };
  
    next();
  };
  
  module.exports = advancedResults;

/**
 * @example
 * // Using advancedResults middleware in a route
 * router.get('/users', advancedResults(User), (req, res) => {
 *   res.status(200).json(res.advancedResults);
 * });
 * 
 * // Example API call: GET /api/v1/users?select=name,email&sort=-createdAt&page=2&limit=10
 */

/**
 * Additional Notes:
 * - This middleware supports filtering, sorting, selecting specific fields, pagination, and population of related documents.
 * - Query parameters:
 *   - select: Comma-separated list of fields to include
 *   - sort: Comma-separated list of fields to sort by (prefix with '-' for descending order)
 *   - page: Page number for pagination
 *   - limit: Number of results per page
 * - Advanced filtering is supported using MongoDB query operators (e.g., gte, lte, in)
 * - The middleware attaches the processed results to res.advancedResults
 * - Default sort is by '-createdAt' if not specified
 * - Default pagination is 25 items per page
 */