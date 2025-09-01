const router = require('express').Router();
const { protect, adminOnly } = require('../middlewares/authMiddleware'); 
const A = require('../controllers/adminController');


router.get('/summary', protect, adminOnly, A.getSummary);
router.get('/users', protect, adminOnly, A.listUsers);
router.patch('/users/:userId/toggle', protect, adminOnly, A.toggleUserActive);

router.get('/jobs', protect, adminOnly, A.listJobs);
router.patch('/jobs/:jobId/moderate', protect, adminOnly, A.moderateJob);

router.get('/applications', protect, adminOnly, A.listApplications);

module.exports = router;
