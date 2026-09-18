const express = require('express');
const router = express.Router();
const { applyJob, getMyApplications, getAllApplications, updateApplicationStatus } = require('../controllers/applicationController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

router.post('/apply', protect, applyJob);
router.get('/my-applications', protect, getMyApplications);

// Admin Routes
router.get('/admin/all', protect, adminOnly, getAllApplications);
router.put('/admin/:id/status', protect, adminOnly, updateApplicationStatus);

module.exports = router;
