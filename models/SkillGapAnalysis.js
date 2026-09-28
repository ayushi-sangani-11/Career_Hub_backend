const mongoose = require('mongoose');

const skillGapAnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume'
  },
  jobTitle: { type: String, required: true },
  company: { type: String, required: true },
  matchedSkills: [{ type: String }],
  missingSkills: [{ type: String }],
  partialSkills: [{ type: String }],
  matchPercentage: { type: Number, required: true, default: 0 },
  matchedCount: { type: Number, default: 0 },
  totalRequired: { type: Number, default: 0 },
  recommendations: [{ type: String }],
  disclaimer: {
    type: String,
    default: 'This match percentage is an AI skill comparison based on job requirements and resume text, not a guarantee of employment.'
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SkillGapAnalysis', skillGapAnalysisSchema);
