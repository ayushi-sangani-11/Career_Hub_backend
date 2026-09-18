const express = require('express');
const router = express.Router();
const {
  getSkills, createSkill, deleteSkill,
  getCourses, createCourse, deleteCourse,
  getSkillGapAnalysis
} = require('../controllers/skillCourseController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

const optionalProtect = (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return protect(req, res, next);
  }
  next();
};

// Skill Routes
router.get('/skills', getSkills);
router.get('/skills/gap-analysis', protect, getSkillGapAnalysis);
router.post('/skills', protect, adminOnly, createSkill);
router.delete('/skills/:id', protect, adminOnly, deleteSkill);

// Course Routes
router.get('/courses', optionalProtect, getCourses);
router.post('/courses', protect, adminOnly, createCourse);
router.delete('/courses/:id', protect, adminOnly, deleteCourse);

module.exports = router;
