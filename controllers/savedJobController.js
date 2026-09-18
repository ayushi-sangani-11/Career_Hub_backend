const SavedJob = require('../models/SavedJob');

// @desc Save a job bookmark
// @route POST /api/saved-jobs/save
// @access Private
exports.saveJob = async (req, res) => {
  try {
    const { jobId } = req.body;
    if (!jobId) {
      return res.status(400).json({ success: false, message: 'Job ID is required' });
    }

    const existing = await SavedJob.findOne({ userId: req.user.id, jobId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Job is already saved' });
    }

    const saved = await SavedJob.create({
      userId: req.user.id,
      jobId
    });

    return res.status(201).json({ success: true, saved });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Unsave/remove job bookmark
// @route DELETE /api/saved-jobs/:jobId
// @access Private
exports.unsaveJob = async (req, res) => {
  try {
    await SavedJob.findOneAndDelete({ userId: req.user.id, jobId: req.params.jobId });
    return res.status(200).json({ success: true, message: 'Job removed from saved list' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get saved jobs list
// @route GET /api/saved-jobs
// @access Private
exports.getSavedJobs = async (req, res) => {
  try {
    const savedJobs = await SavedJob.find({ userId: req.user.id })
      .populate('jobId')
      .sort({ savedAt: -1 });

    return res.status(200).json({ success: true, count: savedJobs.length, savedJobs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
