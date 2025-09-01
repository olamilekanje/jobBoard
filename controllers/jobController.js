const Job = require("../models/Job");

// Create Job (Employer only)
exports.createJob = async (req, res) => {
  try {
    const job = await Job.create({
      ...req.body,
      createdBy: req.user._id, // employer who posts
      status: "pending"        // default until admin approves
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Approve job (Admin only)
exports.approveJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: "Job not found" });

    job.status = "approved";
    await job.save();

    res.json({ message: "✅ Job approved", job });
  } catch (error) {
    res.status(500).json({ error: "Failed to approve job" });
  }
};

// Reject job (Admin only)
exports.rejectJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: "Job not found" });

    job.status = "rejected";
    await job.save();

    res.json({ message: "❌ Job rejected", job });
  } catch (error) {
    res.status(500).json({ error: "Failed to reject job" });
  }
};

// Get approved jobs (Applicants)
exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ status: "approved" });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
};

// Get all jobs (Admin dashboard)
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find().populate("createdBy", "name email role");
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch all jobs" });
  }
};

// Update Job (Employer who created it OR Admin)
exports.updateJob = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Only creator or admin
    if (req.user.role !== "admin" && job.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this job" });
    }

    Object.assign(job, req.body);

    // If employer updates after approval, reset to pending
    if (req.user.role === "employer") {
      job.status = "pending";
    }

    const updatedJob = await job.save();

    res.status(200).json({
      message: "✅ Job updated successfully",
      job: updatedJob,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Job (Admin only)
exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can delete jobs" });
    }

    await job.deleteOne();

    res.json({ message: "Job deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
