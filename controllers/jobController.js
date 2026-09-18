const Job = require('../models/Job');
const User = require('../models/User');
const Resume = require('../models/Resume');
const SavedJob = require('../models/SavedJob');
const { getJobMatchFromPython, getRecommendationsFromPython } = require('../services/pythonService');

// @desc Get all jobs with backend filtering, search & pagination
// @route GET /api/jobs
// @access Public / Optional Auth
exports.getJobs = async (req, res) => {
  try {
    const { search, category, location, type, experience, skill, sort } = req.query;

    const query = { status: 'active' };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (type) {
      query.type = type;
    }

    if (experience) {
      query.experience = { $regex: experience, $options: 'i' };
    }

    if (skill) {
      query.requiredSkills = { $in: [new RegExp(skill, 'i')] };
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'latest') {
      sortOptions = { createdAt: -1 };
    } else if (sort === 'salary') {
      sortOptions = { salary: -1 };
    }

    const jobs = await Job.find(query).sort(sortOptions);

    return res.status(200).json({
      success: true,
      count: jobs.length,
      jobs
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get job by ID with candidate match details
// @route GET /api/jobs/:id
// @access Public / Private
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    let matchDetails = null;
    let isSaved = false;

    if (req.user) {
      const user = await User.findById(req.user.id);
      const resume = await Resume.findOne({ userId: req.user.id });
      const userSkills = resume?.detectedSkills?.length ? resume.detectedSkills : (user?.skills || []);

      matchDetails = await getJobMatchFromPython(userSkills, job.requiredSkills, job.preferredSkills);

      const saved = await SavedJob.findOne({ userId: req.user.id, jobId: job._id });
      isSaved = !!saved;
    }

    return res.status(200).json({
      success: true,
      job,
      matchDetails,
      isSaved
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get smart job recommendations for logged in student
// @route GET /api/jobs/recommendations
// @access Private
exports.getRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const resume = await Resume.findOne({ userId: req.user.id });
    const userSkills = resume?.detectedSkills?.length ? resume.detectedSkills : (user.skills?.length ? user.skills : ['React', 'JavaScript', 'Node.js', 'MongoDB']);

    const jobs = await Job.find({ status: 'active' });
    const recommendations = await getRecommendationsFromPython(userSkills, user.careerGoal, jobs);

    return res.status(200).json({
      success: true,
      count: recommendations.length,
      recommendations
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Create a new job posting (Admin)
// @route POST /api/jobs
// @access Private/Admin
exports.createJob = async (req, res) => {
  try {
    const { title, company, location, type, salary, description, responsibilities, requiredSkills, preferredSkills, experience, deadline, category } = req.body;

    const job = await Job.create({
      title,
      company,
      location,
      type: type || 'Full-Time',
      salary: salary || 'Competitive',
      description,
      responsibilities: Array.isArray(responsibilities) ? responsibilities : (responsibilities ? responsibilities.split('\n') : []),
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : (requiredSkills ? requiredSkills.split(',').map(s => s.trim()) : []),
      preferredSkills: Array.isArray(preferredSkills) ? preferredSkills : (preferredSkills ? preferredSkills.split(',').map(s => s.trim()) : []),
      experience: experience || '0-2 Years',
      deadline: deadline || null,
      category: category || 'Software Engineering',
      createdBy: req.user.id
    });

    return res.status(201).json({ success: true, job });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update job posting (Admin)
// @route PUT /api/jobs/:id
// @access Private/Admin
exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    return res.status(200).json({ success: true, job });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete job posting (Admin)
// @route DELETE /api/jobs/:id
// @access Private/Admin
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    return res.status(200).json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
