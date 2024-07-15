// routes/requests.js
const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { createRequest, approveRequest, getRequests } = require('../controllers/requests');

const router = express.Router();

router.post('/', protect, createRequest);
router.put('/:id/approve', protect, authorize('admin'), approveRequest);
router.get('/', protect, authorize('admin'), getRequests);

module.exports = router;
