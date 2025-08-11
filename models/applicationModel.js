// models/applicationModel.js
const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resume: {
    type: String, // PDF file path or URL
    required: true
  },
  coverLetter: {
    type: String,
    maxlength: 1000
  },
  status: {
  type: String,
  enum: ['submitted', 'under_review', 'shortlisted', 'rejected', 'accepted'],
  default: 'submitted',
},
statusHistory: [
  {
    status: { type: String },
    date: { type: Date, default: Date.now }
  }
],
  appliedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Application', applicationSchema);
