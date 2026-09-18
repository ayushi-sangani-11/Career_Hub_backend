const express = require('express');
const router = express.Router();
const { getJobs, getJobById, getRecommendations, createJob, updateJob, deleteJob } = require('../controllers/jobController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

// Optional auth helper to extract user if token present for public routes
const optionalProtect = (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return protect(req, res, next);
  }
  next();
};

router.get('/', optionalProtect, getJobs);
router.get('/recommendations', protect, getRecommendations);
router.get('/:id', optionalProtect, getJobById);

// Admin Routes
router.post('/', protect, adminOnly, createJob);
router.put('/:id', protect, adminOnly, updateJob);
router.delete('/:id', protect, adminOnly, deleteJob);

module.exports = router;
