// routes/pembayaranRoutes.js
const express = require("express");
const router = express.Router();
const pembayaranController = require("../controllers/pembayaranController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.post("/", verifyToken, pembayaranController.createPembayaran);
router.get("/history", verifyToken, pembayaranController.getPaymentHistory);
router.get("/by-penggunaan/:penggunaan_id", verifyToken, pembayaranController.getPembayaranByPenggunaan);
router.get("/search", verifyToken, pembayaranController.searchPelangganByName);
router.get("/", verifyToken, pembayaranController.getAllPembayaran);

module.exports = router;
