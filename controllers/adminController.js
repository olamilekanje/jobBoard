const User = require('../models/User');                 
const Job = require('../models/Job');                   
const Application = require('../models/Application');  

exports.getSummary = async (_req, res) => {
  try {
    const [users, employers, applicants, jobs, applications] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: 'employer' }),
      User.countDocuments({ role: 'applicant' }),
      Job.countDocuments({}),
      Application.countDocuments({}),
    ]);
    res.json({ users, employers, applicants, jobs, applications });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to load summary' });
  }
};

exports.listUsers = async (req, res) => {
  try {
    const { q = '', role, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (q) filter.$or = [{ name: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }];
    if (role) filter.role = role;

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      User.find(filter)
        .select('name email role isActive createdAt')
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      User.countDocuments(filter),
    ]);

    res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to list users' });
  }
};

exports.toggleUserActive = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isActive = !user.isActive;
    await user.save();

    res.json({ _id: user._id, isActive: user.isActive });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to toggle user' });
  }
};

exports.listJobs = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Job.find(filter)
        .populate('employer', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Job.countDocuments(filter),
    ]);

    res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to list jobs' });
  }
};

exports.moderateJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { action } = req.body; // 'approve' | 'reject' | 'delete'
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (action === 'delete') {
      await job.deleteOne();
      return res.json({ ok: true });
    }

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    job.status = action === 'approve' ? 'approved' : 'rejected';
    await job.save();
    res.json({ _id: job._id, status: job.status });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to moderate job' });
  }
};

exports.listApplications = async (req, res) => {
  try {
    const { jobId, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (jobId) filter.job = jobId;

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Application.find(filter)
        .populate('job', 'title')
        .populate('applicant', 'name email')
        .populate('employer', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Application.countDocuments(filter),
    ]);

    res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to list applications' });
  }
};
