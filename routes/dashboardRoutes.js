const express = require('express');
const router = express.Router();
const { getDashboardStats, getMonthlyUsageStats } = require('../controllers/dashboardController');
const { verifyToken } = require('../middlewares/authMiddleware');


router.get('/stats', verifyToken, getDashboardStats);
router.get('/monthly-usage', verifyToken, getMonthlyUsageStats)

module.exports = router;