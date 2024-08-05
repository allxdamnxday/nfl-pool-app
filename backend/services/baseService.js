/**
 * @module BaseService
 * @description Provides a base service class with common CRUD operations for Mongoose models
 */

const mongoose = require('mongoose');
const ErrorResponse = require('../utils/errorResponse');

/**
 * Base service class for common CRUD operations
 * @class BaseService
 */
class BaseService {
  /**
   * Create a BaseService
   * @param {mongoose.Model} model - The Mongoose model to operate on
   * 
   * @example
   * const UserModel = require('../models/User');
   * const userService = new BaseService(UserModel);
   */
  constructor(model) {
    this.model = model;
  }

  /**
   * Get all documents that match the filter
   * @param {Object} [filter={}] - The filter to apply (MongoDB query object)
   * @returns {Promise<mongoose.Document[]>} Array of documents
   * @throws {ErrorResponse} If there's an error retrieving the documents
   * 
   * @example
   * // Get all active users
   * const activeUsers = await userService.getAll({ status: 'active' });
   */
  async getAll(filter = {}) {
    try {
      return await this.model.find(filter);
    } catch (error) {
      throw new ErrorResponse(`Error retrieving ${this.model.modelName} documents: ${error.message}`, 500);
    }
  }

  /**
   * Get a document by its ID
   * @param {string} id - The ID of the document to retrieve (must be a valid MongoDB ObjectId)
   * @returns {Promise<mongoose.Document>} The found document
   * @throws {ErrorResponse} If the document is not found or if there's an error retrieving it
   * 
   * @example
   * // Get a user by ID
   * const user = await userService.getById('60d5ecb74d6bb830b8e70bfb');
   */
  async getById(id) {
    try {
      const item = await this.model.findById(id);
      if (!item) {
        throw new ErrorResponse(`${this.model.modelName} not found with id of ${id}`, 404);
      }
      return item;
    } catch (error) {
      if (error instanceof ErrorResponse) throw error;
      throw new ErrorResponse(`Error retrieving ${this.model.modelName}: ${error.message}`, 500);
    }
  }

  /**
   * Create a new document
   * @param {Object} data - The data to create the document with (must match the model's schema)
   * @returns {Promise<mongoose.Document>} The created document
   * @throws {ErrorResponse} If there's an error creating the document (e.g., validation error)
   * 
   * @example
   * // Create a new user
   * const newUser = await userService.create({ name: 'John Doe', email: 'john@example.com' });
   */
  async create(data) {
    try {
      return await this.model.create(data);
    } catch (error) {
      throw new ErrorResponse(`Error creating ${this.model.modelName}: ${error.message}`, 400);
    }
  }

  /**
   * Update a document by its ID
   * @param {string} id - The ID of the document to update (must be a valid MongoDB ObjectId)
   * @param {Object} data - The data to update the document with
   * @returns {Promise<mongoose.Document>} The updated document
   * @throws {ErrorResponse} If the document is not found or if there's an error updating it
   * 
   * @example
   * // Update a user's name
   * const updatedUser = await userService.update('60d5ecb74d6bb830b8e70bfb', { name: 'Jane Doe' });
   */
  async update(id, data) {
    try {
      const item = await this.model.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true
      });
      if (!item) {
        throw new ErrorResponse(`${this.model.modelName} not found with id of ${id}`, 404);
      }
      return item;
    } catch (error) {
      if (error instanceof ErrorResponse) throw error;
      throw new ErrorResponse(`Error updating ${this.model.modelName}: ${error.message}`, 400);
    }
  }

  /**
   * Delete a document by its ID
   * @param {string} id - The ID of the document to delete (must be a valid MongoDB ObjectId)
   * @returns {Promise<mongoose.Document>} The deleted document
   * @throws {ErrorResponse} If the document is not found or if there's an error deleting it
   * 
   * @example
   * // Delete a user
   * const deletedUser = await userService.delete('60d5ecb74d6bb830b8e70bfb');
   */
  async delete(id) {
    try {
      const item = await this.model.findByIdAndDelete(id);
      if (!item) {
        throw new ErrorResponse(`${this.model.modelName} not found with id of ${id}`, 404);
      }
      return item;
    } catch (error) {
      if (error instanceof ErrorResponse) throw error;
      throw new ErrorResponse(`Error deleting ${this.model.modelName}: ${error.message}`, 500);
    }
  }
}

module.exports = BaseService;