const mongoose = require('mongoose');

const statusSchema = new mongoose.Schema({
  status: { type: String, enum: ['applied','viewed','shortlisted','rejected','hired'], required: true },
  by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // who changed it
  at: { type: Date, default: Date.now },
  note: String
});


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
  currentStatus: { type: String, default: 'applied' },
  appliedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Application', applicationSchema);
