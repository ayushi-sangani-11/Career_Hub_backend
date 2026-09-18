const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  category: {
    type: String,
    enum: ['Frontend', 'Backend', 'Database', 'Cloud & DevOps', 'Data & AI', 'Tools & Workflow', 'Mobile', 'Soft Skills'],
    default: 'Frontend'
  },
  description: { type: String, default: '' },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Intermediate'
  },
  importance: { type: Number, default: 5 } // 1-10
});

module.exports = mongoose.model('Skill', skillSchema);
