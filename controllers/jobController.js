const Job = require('../models/Job');

// Employer: Create Job
exports.createJob = async (req, res) => {
  try {
    const job = new Job({
      title: req.body.title,
      company: req.body.company,
      location: req.body.location,
      salary: req.body.salary,
      category: req.body.category,
      description: req.body.description,
      deadline: req.body.deadline,
      postedBy: req.user._id // Automatically set from auth middleware
    });

    await job.save();
    res.status(201).json({ message: 'Job created successfully', job });
  } catch (error) {
    res.status(400).json({ message: 'Failed to create job', error: error.message });
  }
};

// Public: Get All Jobs (with filters)
exports.getAllJobs = async (req, res) => {
  try {
    const filters = {};
    if (req.query.location) filters.location = req.query.location;
    if (req.query.category) filters.category = req.query.category;

    const jobs = await Job.find(filters).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching jobs' });
  }
};


exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'name email'); // ✅ matches schema

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json(job);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching job', error: err.message });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to update this job' });
    }

    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json(updatedJob);
  } catch (err) {
    res.status(500).json({ message: 'Error updating job', error: err.message });
  }
};


const mongoose = require('mongoose');

exports.deleteJob = async (req, res) => {
  try {
    // 1️⃣ Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid job ID format' });
    }

    // 2️⃣ Check if job exists
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // 3️⃣ Ownership check
    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to delete this job' });
    }

    // 4️⃣ Delete
    await job.deleteOne();
    res.status(200).json({ message: 'Job deleted successfully' });

  } catch (err) {
    res.status(500).json({ message: 'Error deleting job', error: err.message });
  }
};
