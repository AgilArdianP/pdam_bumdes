const express = require('express');
const router = express.Router();
const pembayaranController = require('../controllers/pembayaranController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.post('/', verifyToken, pembayaranController.createPembayaran);
router.get('/', verifyToken, pembayaranController.getAllPembayaran);
router.get('/:penggunaan_id', verifyToken, pembayaranController.getPembayaraByPenggunaan);

module.exports = router;