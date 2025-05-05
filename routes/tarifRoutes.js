// routes/tarifRoutes.js
const express = require("express");
const router = express.Router();
const tarifController = require("../controllers/settingController");
const { verifyToken } = require("../middlewares/authMiddleware");

// Pastikan setiap request diverifikasi token-nya jika perlu
router.get("/", verifyToken, tarifController.getTarif);
router.post("/", verifyToken, tarifController.createTarif);
router.put("/:id", verifyToken, tarifController.updateTarif);
router.delete("/:id", verifyToken, tarifController.deleteTarif);

module.exports = router;
