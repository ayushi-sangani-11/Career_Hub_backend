const Application = require('../models/Application');
const Job = require('../models/Job');
const Notification = require('../models/Notification');

// @desc Apply for a job
// @route POST /api/applications/apply
// @access Private
exports.applyJob = async (req, res) => {
  try {
    const { jobId, notes } = req.body;

    if (!jobId) {
      return res.status(400).json({ success: false, message: 'Job ID is required' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const existingApp = await Application.findOne({ userId: req.user.id, jobId });
    if (existingApp) {
      return res.status(400).json({ success: false, message: 'You have already applied for this job' });
    }

    const application = await Application.create({
      userId: req.user.id,
      jobId,
      notes: notes || '',
      status: 'Applied'
    });

    // Create Notification
    await Notification.create({
      userId: req.user.id,
      title: 'Application Submitted',
      message: `Your application for "${job.title}" at ${job.company} was successfully submitted.`,
      type: 'application',
      link: '/applications'
    });

    return res.status(201).json({ success: true, application });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get student applications with status timeline
// @route GET /api/applications/my-applications
// @access Private
exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.user.id })
      .populate('jobId')
      .sort({ appliedAt: -1 });

    return res.status(200).json({ success: true, count: applications.length, applications });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get all candidate applications (Admin)
// @route GET /api/applications/admin/all
// @access Private/Admin
exports.getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('userId', 'name email phone education skills careerGoal')
      .populate('jobId', 'title company location type')
      .sort({ appliedAt: -1 });

    return res.status(200).json({ success: true, count: applications.length, applications });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update application status (Admin)
// @route PUT /api/applications/admin/:id/status
// @access Private/Admin
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const application = await Application.findById(req.params.id).populate('jobId');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    application.status = status || application.status;
    if (notes) application.notes = notes;
    application.updatedAt = Date.now();
    await application.save();

    // Create user notification for status update
    const jobTitle = application.jobId ? application.jobId.title : 'the position';
    await Notification.create({
      userId: application.userId,
      title: 'Application Status Updated',
      message: `Status for your application "${jobTitle}" has been updated to "${application.status}".`,
      type: 'application',
      link: '/applications'
    });

    return res.status(200).json({ success: true, application });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
