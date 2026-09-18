const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, getDashboardStats } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/dashboard', protect, getDashboardStats);

module.exports = router;
