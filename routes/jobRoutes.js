const express = require("express");
const router = express.Router();
const { protect, restrictTo } = require("../middlewares/authMiddleware");
const { createJob, approveJob, getJobs, getAllJobs, updateJob, deleteJob, rejectJob } = require("../controllers/jobController");

// Employers & Admins can create jobs
router.post("/create", protect, restrictTo("admin", "employer"), createJob);

// Admin approves a job
router.patch("/:id/approve", protect, restrictTo("admin"), approveJob);

router.patch("/:id/reject", protect, restrictTo("admin"), rejectJob);
// Applicants see only approved jobs
router.get("/", getJobs);

// Admin dashboard: see all jobs
router.get("/all", protect, restrictTo("admin"), getAllJobs);

// Update job (admin or employer)
router.put("/:id", protect, updateJob);

// Delete job (admin only)
router.delete("/:id", protect, deleteJob);

module.exports = router;
