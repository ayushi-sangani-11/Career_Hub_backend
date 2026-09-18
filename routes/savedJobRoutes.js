const express = require('express');
const router = express.Router();
const { saveJob, unsaveJob, getSavedJobs } = require('../controllers/savedJobController');
const { protect } = require('../middleware/auth');

router.post('/save', protect, saveJob);
router.get('/', protect, getSavedJobs);
router.delete('/:jobId', protect, unsaveJob);

module.exports = router;
