const express = require('express');
const router = express.Router();
const { getJobs, saveJob } = require('../controller/jobController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getJobs);
router.post('/save', protect, saveJob);

module.exports = router;
