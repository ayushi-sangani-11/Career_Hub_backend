const User = require('../models/User');
const Resume = require('../models/Resume');
const Application = require('../models/Application');
const SavedJob = require('../models/SavedJob');
const Job = require('../models/Job');
const { getSkillGapFromPython, getRecommendationsFromPython } = require('../services/pythonService');

// @desc Get student profile
// @route GET /api/users/profile
// @access Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const resume = await Resume.findOne({ userId: req.user.id });
    return res.status(200).json({ success: true, user, resume });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update student profile
// @route PUT /api/users/profile
// @access Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, location, education, college, degree, gradYear, careerGoal, skills, bio } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        name,
        phone,
        location,
        education,
        college,
        degree,
        gradYear,
        careerGoal,
        skills,
        bio
      },
      { new: true, runValidators: true }
    );

    return res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get student dashboard statistics & metrics
// @route GET /api/users/dashboard
// @access Private
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    const resume = await Resume.findOne({ userId });

    const totalApplications = await Application.countDocuments({ userId });
    const shortlistedCount = await Application.countDocuments({ userId, status: 'Shortlisted' });
    const interviewCount = await Application.countDocuments({ userId, status: 'Interview' });
    const savedJobsCount = await SavedJob.countDocuments({ userId });

    const recentApplications = await Application.find({ userId })
      .populate('jobId', 'title company location type status')
      .sort({ appliedAt: -1 })
      .limit(5);

    // Get skills from resume or profile
    const userSkills = resume?.detectedSkills?.length ? resume.detectedSkills : (user.skills?.length ? user.skills : ['React', 'JavaScript', 'Node.js', 'MongoDB']);

    // Get skill gap analysis
    const skillGap = await getSkillGapFromPython(userSkills, user.careerGoal || 'Full Stack Developer');

    // Get top job recommendations
    const activeJobs = await Job.find({ status: 'active' }).limit(10);
    const topRecommendedJobs = await getRecommendationsFromPython(userSkills, user.careerGoal, activeJobs);

    return res.status(200).json({
      success: true,
      stats: {
        totalApplications,
        shortlistedCount,
        interviewCount,
        savedJobsCount,
        resumeScore: resume?.resumeScore || 82,
        skillMatchPct: skillGap?.readinessScore || 78,
        careerGoal: user.careerGoal || 'Full Stack Developer'
      },
      skills: userSkills,
      skillGap,
      recentApplications,
      topRecommendedJobs: topRecommendedJobs.slice(0, 4)
    });
  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
