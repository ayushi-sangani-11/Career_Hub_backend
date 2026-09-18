const Skill = require('../models/Skill');
const Course = require('../models/Course');
const User = require('../models/User');
const Resume = require('../models/Resume');
const { getSkillGapFromPython } = require('../services/pythonService');

// @desc Get list of skills
// @route GET /api/skills
// @access Public
exports.getSkills = async (req, res) => {
  try {
    const { category } = req.query;
    const query = category ? { category } : {};
    const skills = await Skill.find(query).sort({ importance: -1, name: 1 });
    return res.status(200).json({ success: true, count: skills.length, skills });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Create skill (Admin)
// @route POST /api/skills
// @access Private/Admin
exports.createSkill = async (req, res) => {
  try {
    const skill = await Skill.create(req.body);
    return res.status(201).json({ success: true, skill });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete skill (Admin)
// @route DELETE /api/skills/:id
// @access Private/Admin
exports.deleteSkill = async (req, res) => {
  try {
    await Skill.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: 'Skill deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get courses with recommendations for missing student skills
// @route GET /api/courses
// @access Public / Private
exports.getCourses = async (req, res) => {
  try {
    let missingSkills = [];
    let user = null;

    if (req.user) {
      user = await User.findById(req.user.id);
      const resume = await Resume.findOne({ userId: req.user.id });
      const userSkills = resume?.detectedSkills?.length ? resume.detectedSkills : (user?.skills || []);
      const skillGap = await getSkillGapFromPython(userSkills, user?.careerGoal || 'Full Stack Developer');
      missingSkills = skillGap.recommendedSkillsToLearn || [];
    }

    const courses = await Course.find().sort({ createdAt: -1 });

    // Mark recommended courses matching missing skills
    const enhancedCourses = courses.map(course => {
      const isRecommended = missingSkills.some(s => s.toLowerCase() === course.skill.toLowerCase());
      return {
        ...course.toObject(),
        isRecommended,
        recommendationReason: isRecommended ? `Recommended to bridge your skill gap in ${course.skill}` : ''
      };
    });

    return res.status(200).json({
      success: true,
      count: enhancedCourses.length,
      courses: enhancedCourses,
      missingSkills
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Create course (Admin)
// @route POST /api/courses
// @access Private/Admin
exports.createCourse = async (req, res) => {
  try {
    const course = await Course.create(req.body);
    return res.status(201).json({ success: true, course });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete course (Admin)
// @route DELETE /api/courses/:id
// @access Private/Admin
exports.deleteCourse = async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: 'Course deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get skill gap analysis for student
// @route GET /api/skills/gap-analysis
// @access Private
exports.getSkillGapAnalysis = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const resume = await Resume.findOne({ userId: req.user.id });
    const userSkills = resume?.detectedSkills?.length ? resume.detectedSkills : (user?.skills || []);
    
    const analysis = await getSkillGapFromPython(userSkills, user.careerGoal || 'Full Stack Developer');
    
    return res.status(200).json({
      success: true,
      userSkills,
      careerGoal: user.careerGoal || 'Full Stack Developer',
      analysis
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
