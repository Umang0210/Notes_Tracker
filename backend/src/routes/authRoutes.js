const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
  updateDetails,
  updatePassword,
  deleteAccount
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/details', protect, updateDetails);
router.put('/password', protect, updatePassword);
router.delete('/account', protect, deleteAccount);

module.exports = router;
