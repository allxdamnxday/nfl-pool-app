// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const { protect } = require('../middleware/auth');

console.log('Auth Controller:', authController);
console.log('Protect Middleware:', protect);

// Debug each route handler
const debugRoute = (name, handler) => {
  console.log(`Setting up ${name} route`);
  console.log(`${name} handler:`, handler);
  return typeof handler === 'function' ? handler : (req, res) => res.status(500).json({ error: `${name} not implemented` });
};

router.post('/register', debugRoute('register', authController.register));
router.post('/login', debugRoute('login', authController.login));
router.get('/logout', debugRoute('logout', authController.logout));
router.get('/me', protect, debugRoute('getMe', authController.getMe));
router.post('/forgotpassword', debugRoute('forgotPassword', authController.forgotPassword));
router.put('/resetpassword/:resettoken', debugRoute('resetPassword', authController.resetPassword));
router.put('/updatedetails', protect, debugRoute('updateDetails', authController.updateDetails));
router.put('/updatepassword', protect, debugRoute('updatePassword', authController.updatePassword));

module.exports = router;