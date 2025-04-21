const express = require('express');
const router = express.Router();
const pelangganController = require('../controllers/pelangganController');
const { verifyToken } = require('../middlewares/authMiddleware');


router.get('/search', verifyToken, pelangganController.searchPelanggan);
router.post('/', verifyToken, pelangganController.createPelanggan);
router.get('/', verifyToken, pelangganController.getAllPelanggan);
router.get('/:id', verifyToken, pelangganController.getPelangganById);
router.put('/:id', verifyToken, pelangganController.updatePelanggan);
router.delete('/:id', verifyToken, pelangganController.deletePelanggan);

module.exports = router;