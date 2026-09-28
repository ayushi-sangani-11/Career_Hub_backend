const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  company: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  type: {
    type: String,
    enum: ['Full-Time', 'Part-Time', 'Remote', 'Contract', 'Internship'],
    default: 'Full-Time'
  },
  salary: { type: String, default: 'Competitive' },
  description: { type: String, required: true },
  responsibilities: [{ type: String }],
  requiredSkills: [{ type: String, required: true }],
  preferredSkills: [{ type: String }],
  education: { type: String, default: 'Bachelor Degree' },
  experience: { type: String, default: '0-2 Years' },
  applicationUrl: { type: String, default: '' },
  deadline: { type: Date },
  category: {
    type: String,
    default: 'Software Development'
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Job', jobSchema);
