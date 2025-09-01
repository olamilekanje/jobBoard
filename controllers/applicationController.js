const fs = require('fs');
const path = require('path');
const Application = require('../models/Application');
const Job = require('../models/Job');
const sendEmail = require('../utils/mailer');

/// APPLY FOR A JOB
exports.applyForJob = async (req, res) => {
try {
    const { jobId } = req.params;
    const { coverLetter } = req.body;
    const applicantId = req.user.id;

    // ✅ Check if job exists
    const job = await Job.findById(jobId).populate('createdBy', 'email name');
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // ✅ Check for existing application by this user
    const existing = await Application.findOne({ job: jobId, applicant: req.user._id });
    if (existing) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    // ✅ Handle resume upload
    const resume = req.file ? req.file.path : null;

    // ✅ Create application
    let application = await Application.create({
      job: jobId,
      applicant: req.user._id,
      resume,
      coverLetter
    });

    // ✅ Populate applicant info for email
    application = await application.populate('applicant', 'name email');

    // ✅ Send confirmation email to applicant
    await sendEmail(
      application.applicant.email,
      `📢 Application Received for ${job.title}`,
      `<p>Hello ${application.applicant.name},</p>
       <p>Your application for "<strong>${job.title}</strong>" has been received.</p>`
    );

    // ✅ Send notification email to employer
    await sendEmail(
      job.createdBy.email,
      `📥 New Application for ${job.title}`,
      `<p>Hello ${job.createdBy.name},</p>
       <p>${application.applicant.name} has applied for your job posting "<strong>${job.title}</strong>".</p>
       <p>Login to your dashboard to review the application.</p>`
    );

    res.status(201).json({
      message: 'Application submitted successfully',
      application
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



// GET APPLICATIONS FOR LOGGED-IN APPLICANT (with filtering & sorting)
exports.getMyApplications = async (req, res) => {
  try {
    const { status } = req.query;

    // Build query filter
    const filter = { applicant: req.user._id };
    if (status) {
      filter.status = status;
    }

    // Fetch applications
    const applications = await Application.find(filter)
      .populate({
        path: 'job',
        select: 'title company location', // only the fields we need
      })
      .sort({ createdAt: -1 }); // newest first

    res.status(200).json({
      count: applications.length,
      applications,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// GET APPLICATIONS FOR A JOB (EMPLOYER)
exports.getApplicationsForJob = async (req, res) => {
  try {
    const jobId = req.params.jobId;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if employer owns the job
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view applications for this job' });
    }

   const applications = await Application.find({ job: jobId }).populate('applicant'); 
    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET SINGLE APPLICATION BY ID
exports.getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('applicant')
      .populate('job');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.status(200).json(application);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// UPDATE APPLICATION STATUS (employer only)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Find application with job + employer info + applicant info
    const application = await Application.findById(id)
      .populate({
        path: 'job',
        select: 'postedBy title',
        populate: { path: 'postedBy', select: '_id name email' }
      })
      .populate({
        path: 'applicant',
        select: '_id name email'
      });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // ✅ Check employer ownership correctly
    if (application.job.postedBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to update this application' });
    }

    // ✅ Update status
    application.status = status;
    await application.save();

    // ✅ Send notification email to applicant
    await sendEmail(
      application.applicant.email,
      `📢 Your Application Status for ${application.job.title} Has Changed`,
      `<p>Hello ${application.applicant.name},</p>
       <p>Your application for "<strong>${application.job.title}</strong>" is now marked as: <strong>${status}</strong>.</p>
       <p>Please log in to your dashboard for more details.</p>`
    );

    res.status(200).json({ message: 'Application status updated', application });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// DELETE APPLICATION
exports.deleteApplication = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      applicant: req.user._id
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Optionally delete resume file
    if (application.resume && fs.existsSync(application.resume)) {
      fs.unlinkSync(application.resume);
    }

    await application.deleteOne();

    res.status(200).json({ message: 'Application deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



exports.testApplicationEmail = async (req, res) => {
  try {
    const { to, subject, text } = req.body;

    if (!to || !subject || !text) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const result = await sendEmail(to, subject, text);

    if (result) {
      res.json({ message: 'Email sent successfully' });
    } else {
      res.status(500).json({ message: 'Failed to send email' });
    }
  } catch (err) {
    console.error('Error in testApplicationEmail:', err.message);
    res.status(500).json({
      message: 'Failed to send email',
      error: err.message,
    });
  }
};

