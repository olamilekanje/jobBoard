const express = require('express');
const {
  applyForJob,
  getMyApplications,
  getApplicationsForJob,
  updateApplicationStatus,
  deleteApplication,
  testApplicationEmail // ✅ New: Test email controller
} = require('../controllers/applicationController');

const { protect, restrictTo } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/resumeUpload'); // handles resume uploads

const router = express.Router();

router.use(protect);

// Applicant routes
router.post(
  '/:jobId',
  restrictTo('applicant'),
  upload.single('resume'), // resume upload
  applyForJob
);

router.get('/my', restrictTo('applicant'), getMyApplications);
router.delete('/:id', restrictTo('applicant'), deleteApplication);

// Employer routes
router.get('/job/:jobId', restrictTo('employer'), getApplicationsForJob);
router.patch('/:id/status', restrictTo('employer'), updateApplicationStatus);

// ✅ Test email sending
router.post('/test-email', restrictTo('applicant'), testApplicationEmail);

module.exports = router;
