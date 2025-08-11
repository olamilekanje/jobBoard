const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

  personalInfo: {
    fullName: String,
    email: String,
    phone: String,
    address: String,
    summary: String
  },

  education: [
    {
      school: String,
      degree: String,
      field: String,
      startDate: String,
      endDate: String
    }
  ],

  experience: [
    {
      company: String,
      position: String,
      startDate: String,
      endDate: String,
      description: String
    }
  ],

  skills: [String],

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Resume', resumeSchema);
