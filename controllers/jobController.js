const Job = require('../models/Job');
const User = require('../models/User');
const Resume = require('../models/Resume');
const SavedJob = require('../models/SavedJob');
const SkillGapAnalysis = require('../models/SkillGapAnalysis');
const { getJobMatchFromPython, getRecommendationsFromPython, analyzeJobResumeWithPython } = require('../services/pythonService');

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

// @desc Analyze candidate resume specifically against a target job's requirements
// @route POST /api/jobs/:id/analyze-resume
// @access Private
exports.analyzeJobResume = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job posting not found' });
    }

    let filePath = req.file ? req.file.path : null;
    let resumeText = req.body.text || '';
    let savedResume = null;

    if (!filePath && !resumeText) {
      // Look up candidate's saved master resume
      savedResume = await Resume.findOne({ userId: req.user.id });
      if (!savedResume) {
        return res.status(400).json({
          success: false,
          message: 'No resume found. Please upload a PDF resume to analyze against this job.'
        });
      }
      resumeText = savedResume.extractedText || savedResume.detectedSkills.join(' ');
    }

    // Call Python AI microservice for job-specific analysis
    const aiResult = await analyzeJobResumeWithPython(filePath, resumeText, {
      title: job.title,
      company: job.company,
      requiredSkills: job.requiredSkills,
      preferredSkills: job.preferredSkills,
      description: job.description
    });

    // Save job-specific analysis in database
    const analysis = await SkillGapAnalysis.create({
      userId: req.user.id,
      jobId: job._id,
      resumeId: savedResume ? savedResume._id : null,
      jobTitle: job.title,
      company: job.company,
      matchedSkills: aiResult.matchedSkills || [],
      missingSkills: aiResult.missingSkills || [],
      partialSkills: aiResult.partialSkills || [],
      matchPercentage: aiResult.matchPercentage || 0,
      matchedCount: aiResult.matchedCount || 0,
      totalRequired: aiResult.totalRequired || 0,
      recommendations: aiResult.recommendations || [],
      disclaimer: aiResult.disclaimer || 'This match percentage is an AI-assisted skill comparison based on job requirements and resume text, not a guarantee of employment.'
    });

    return res.status(201).json({
      success: true,
      analysis,
      job
    });
  } catch (error) {
    console.error('Job Resume Analysis Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get historical skill gap analyses for logged-in user
// @route GET /api/jobs/analyses/user
// @access Private
exports.getUserAnalyses = async (req, res) => {
  try {
    const analyses = await SkillGapAnalysis.find({ userId: req.user.id })
      .populate('jobId', 'title company location salary category type')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: analyses.length,
      analyses
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get a specific skill gap analysis report by ID
// @route GET /api/jobs/analyses/:id
// @access Private
exports.getAnalysisById = async (req, res) => {
  try {
    const analysis = await SkillGapAnalysis.findById(req.params.id)
      .populate('jobId');

    if (!analysis) {
      return res.status(404).json({ success: false, message: 'Analysis report not found' });
    }

    if (analysis.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this analysis report' });
    }

    return res.status(200).json({
      success: true,
      analysis
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
    const userSkills = resume?.detectedSkills?.length ? resume.detectedSkills : (user.skills?.length ? user.skills : ['Java', 'Python', 'React', 'JavaScript', 'SQL']);

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
    const { title, company, location, type, salary, description, responsibilities, requiredSkills, preferredSkills, education, experience, applicationUrl, deadline, category } = req.body;

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
      education: education || 'Bachelor Degree',
      experience: experience || '0-2 Years',
      applicationUrl: applicationUrl || '',
      deadline: deadline || null,
      category: category || 'Software Development',
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
