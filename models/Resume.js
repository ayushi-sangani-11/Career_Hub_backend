const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  fileName: { type: String, required: true },
  fileUrl: { type: String, default: '' },
  extractedText: { type: String, default: '' },
  detectedSkills: [{ type: String }],
  resumeScore: { type: Number, default: 0 },
  categoryScores: {
    skills: { type: Number, default: 0 },
    projects: { type: Number, default: 0 },
    education: { type: Number, default: 0 },
    experience: { type: Number, default: 0 },
    keywords: { type: Number, default: 0 }
  },
  detectedSections: [{ type: String }],
  suggestions: [{ type: String }],
  wordCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Resume', resumeSchema);
