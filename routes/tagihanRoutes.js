// routes/tagihanRoutes.js
const express = require('express');
const router = express.Router();
const tagihanController = require('../controllers/tagihanController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Cetak nota tagihan (PDF) berdasarkan id penggunaan
router.get('/nota/:id', verifyToken, tagihanController.generateNota);

// Export laporan per bulan ke PDF dan Excel (filter dengan query: ?bulan=...&tahun=...)
router.get('/export/pdf', verifyToken, tagihanController.exportLaporanPDF);
router.get('/export/excel', verifyToken, tagihanController.exportLaporanExcel);

module.exports = router;
