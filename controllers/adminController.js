const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Skill = require('../models/Skill');
const Resume = require('../models/Resume');

// @desc Get platform statistics & analytics for admin dashboard
// @route GET /api/admin/stats
// @access Private/Admin
exports.getPlatformStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'student' });
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ status: 'active' });
    const totalApplications = await Application.countDocuments();
    const totalResumes = await Resume.countDocuments();

    // Applications breakdown by status
    const statusCounts = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Jobs breakdown by category
    const categoryCounts = await Job.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Top detected skills across resumes
    const skillAggregation = await Resume.aggregate([
      { $unwind: '$detectedSkills' },
      { $group: { _id: '$detectedSkills', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 }
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalJobs,
        activeJobs,
        totalApplications,
        totalResumes
      },
      statusDistribution: statusCounts.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {}),
      categoryDistribution: categoryCounts.map(item => ({ category: item._id, count: item.count })),
      topSkills: skillAggregation.map(item => ({ skill: item._id, count: item.count }))
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get all registered users (Admin)
// @route GET /api/admin/users
// @access Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Toggle active/inactive user account (Admin)
// @route PUT /api/admin/users/:id/toggle-status
// @access Private/Admin
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User account has been ${user.isActive ? 'activated' : 'deactivated'}`,
      user
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete user (Admin)
// @route DELETE /api/admin/users/:id
// @access Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    await Resume.deleteMany({ userId: req.params.id });
    await Application.deleteMany({ userId: req.params.id });
    return res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
