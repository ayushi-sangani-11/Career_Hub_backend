const Resume = require('../models/Resume');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { analyzeResumeWithPython } = require('../services/pythonService');

// @desc Upload & analyze PDF resume
// @route POST /api/resumes/upload
// @access Private
exports.uploadAndAnalyzeResume = async (req, res) => {
  try {
    if (!req.file && !req.body.text) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF resume file or provide text' });
    }

    const filePath = req.file ? req.file.path : null;
    const textContent = req.body.text || '';
    const originalFileName = req.file ? req.file.originalname : 'uploaded-resume.pdf';

    // Send file/text to Python AI service
    const aiAnalysis = await analyzeResumeWithPython(filePath, textContent);

    // Save or Update in database
    let resume = await Resume.findOne({ userId: req.user.id });

    if (resume) {
      resume.fileName = originalFileName;
      resume.fileUrl = filePath ? `/uploads/${req.file.filename}` : resume.fileUrl;
      resume.extractedText = aiAnalysis.extractedText || textContent;
      resume.detectedSkills = aiAnalysis.detectedSkills || [];
      resume.resumeScore = aiAnalysis.score || 80;
      resume.categoryScores = aiAnalysis.categoryScores || {};
      resume.detectedSections = aiAnalysis.detectedSections || [];
      resume.suggestions = aiAnalysis.suggestions || [];
      resume.wordCount = aiAnalysis.wordCount || 0;
      resume.updatedAt = Date.now();
      await resume.save();
    } else {
      resume = await Resume.create({
        userId: req.user.id,
        fileName: originalFileName,
        fileUrl: filePath ? `/uploads/${req.file.filename}` : '',
        extractedText: aiAnalysis.extractedText || textContent,
        detectedSkills: aiAnalysis.detectedSkills || [],
        resumeScore: aiAnalysis.score || 80,
        categoryScores: aiAnalysis.categoryScores || {},
        detectedSections: aiAnalysis.detectedSections || [],
        suggestions: aiAnalysis.suggestions || [],
        wordCount: aiAnalysis.wordCount || 0
      });
    }

    // Also sync detected skills into User profile
    if (aiAnalysis.detectedSkills && aiAnalysis.detectedSkills.length > 0) {
      await User.findByIdAndUpdate(req.user.id, {
        $addToSet: { skills: { $each: aiAnalysis.detectedSkills } }
      });
    }

    // Create system notification
    await Notification.create({
      userId: req.user.id,
      title: 'Resume Analysis Complete',
      message: `Your resume "${originalFileName}" has been parsed. Score: ${aiAnalysis.score}/100.`,
      type: 'resume',
      link: '/resume-analysis'
    });

    return res.status(200).json({
      success: true,
      message: 'Resume analyzed successfully',
      resume
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get student resume analysis
// @route GET /api/resumes/my-resume
// @access Private
exports.getMyResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.user.id });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'No resume found for this user' });
    }
    return res.status(200).json({ success: true, resume });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete resume
// @route DELETE /api/resumes/my-resume
// @access Private
exports.deleteResume = async (req, res) => {
  try {
    await Resume.findOneAndDelete({ userId: req.user.id });
    return res.status(200).json({ success: true, message: 'Resume deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
