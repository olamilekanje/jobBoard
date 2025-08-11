const express = require('express');
const router = express.Router();
const { testApplicationEmail } = require('../controllers/applicationController');

// Route to test sending application email
router.post('/', testApplicationEmail);

module.exports = router;
