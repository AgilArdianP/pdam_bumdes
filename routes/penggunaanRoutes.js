// routes/penggunaanRoutes.js
const express = require('express');
const router = express.Router();
const penggunaanController = require('../controllers/penggunaanController');
const { verifyToken } = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');

// Konfigurasi Multer untuk upload foto
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = Date.now() + ext;
    cb(null, filename);
  }
});
const upload = multer({ storage });

// Endpoint tambah data penggunaan (dengan field foto)
router.post('/', verifyToken, upload.single('foto'), penggunaanController.createPenggunaan);
router.get('/history', verifyToken, penggunaanController.getAllPenggunaanHistory);

module.exports = router;
