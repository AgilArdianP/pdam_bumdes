const express = require("express");
const router = express.Router();
const backupController = require("../controllers/backupController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.get("/backup", verifyToken, backupController.backupData);
router.post("/restore", verifyToken, backupController.restoreData);

module.exports = router;