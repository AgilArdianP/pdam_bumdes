// routes/tarifRoutes.js
const express = require("express");
const router = express.Router();
const tarifController = require("../controllers/settingController");
const { verifyToken } = require("../middlewares/authMiddleware");

// Pastikan setiap request diverifikasi token-nya jika perlu
router.get("/", verifyToken, settingController.getTarif);
router.post("/", verifyToken, settingController.createTarif);
router.put("/:id", verifyToken, settingController.updateTarif);
router.delete("/:id", verifyToken, settingController.deleteTarif);

module.exports = router;
