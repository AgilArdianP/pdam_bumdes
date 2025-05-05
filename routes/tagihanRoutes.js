const express = require('express');
const router = express.Router();
const tagihanController = require('../controllers/tagihanController');
const { verifyToken } = require('../middlewares/authMiddleware');


router.get('/nota/:id', verifyToken, tagihanController.generateNota);
router.get('/export/pdf', verifyToken, tagihanController.exportLaporanPDF);
router.get('/export/excel', verifyToken, tagihanController.exportLaporanExcel);

module.exports = router;
