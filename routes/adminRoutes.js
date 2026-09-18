const express = require('express');
const router = express.Router();
const { getPlatformStats, getUsers, toggleUserStatus, deleteUser } = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

router.use(protect);
router.use(adminOnly);

router.get('/stats', getPlatformStats);
router.get('/users', getUsers);
router.put('/users/:id/toggle-status', toggleUserStatus);
router.delete('/users/:id', deleteUser);

module.exports = router;
