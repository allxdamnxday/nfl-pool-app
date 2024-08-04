//backend/services/baseService.js

const mongoose = require('mongoose');
const ErrorResponse = require('../utils/errorResponse');

class BaseService {
  constructor(model) {
    this.model = model;
  }

  async getAll(filter = {}) {
    return await this.model.find(filter);
  }

  async getById(id) {
    const item = await this.model.findById(id);
    if (!item) {
      throw new ErrorResponse(`${this.model.modelName} not found with id of ${id}`, 404);
    }
    return item;
  }

  async create(data) {
    return await this.model.create(data);
  }

  async update(id, data) {
    const item = await this.model.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true
    });
    if (!item) {
      throw new ErrorResponse(`${this.model.modelName} not found with id of ${id}`, 404);
    }
    return item;
  }

  async delete(id) {
    const item = await this.model.findByIdAndDelete(id);
    if (!item) {
      throw new ErrorResponse(`${this.model.modelName} not found with id of ${id}`, 404);
    }
    return item;
  }
}

module.exports = BaseService;