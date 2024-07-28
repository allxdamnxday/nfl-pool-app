// routes/requests.js
const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { 
  createRequest, 
  approveRequest, 
  getRequests, 
  getPoolRequests, 
  getUserRequests,
  confirmPayment
} = require('../controllers/requests');

const router = express.Router();

router.post('/', protect, createRequest);
router.put('/:id/approve', protect, authorize('admin'), approveRequest);
router.get('/', protect, authorize('admin'), getRequests);
router.get('/pool/:poolId', protect, authorize('admin'), getPoolRequests);
router.get('/user', protect, getUserRequests);
router.put('/:id/confirm-payment', protect, confirmPayment);

module.exports = router;