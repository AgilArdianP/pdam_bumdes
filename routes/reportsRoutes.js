const express = require("express");
const router = express.Router();
const reportsController = require("../controllers/reportsController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.get("/usage-report", verifyToken, reportsController.getUsageReport);

module.exports = router;
