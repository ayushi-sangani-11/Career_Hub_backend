const express = require('express');
const router = express.Router();
const { uploadAndAnalyzeResume, getMyResume, deleteResume } = require('../controllers/resumeController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/upload', protect, upload.single('file'), uploadAndAnalyzeResume);
router.get('/my-resume', protect, getMyResume);
router.delete('/my-resume', protect, deleteResume);

module.exports = router;
