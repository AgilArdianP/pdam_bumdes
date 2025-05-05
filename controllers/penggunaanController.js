// controllers/penggunaanController.js
const db = require('../config/db');
const { logAudit } = require("../helpers/auditLogger");

// Fungsi untuk membuat data penggunaan baru dengan perhitungan tarif dinamis
exports.createPenggunaan = async (req, res) => {
  try {
    const { pelanggan_id, jumlah_penggunaan, tanggal } = req.body;
    const foto = req.file ? req.file.filename : null;

    // Ambil jenis pelayanan pelanggan
    const [pelangganRows] = await db.execute(
      'SELECT jenis_pelayanan FROM pelanggan WHERE id = ?',
      [pelanggan_id]
    );
    if (pelangganRows.length === 0) {
      return res.status(404).json({ message: 'Pelanggan tidak ditemukan' });
    }
    const jenis_pelayanan = pelangganRows[0].jenis_pelayanan; // Contoh: "Reguler" atau "Subsidi"

    // Cari tarif yang sesuai dari tabel tarif_penggunaan berdasarkan jenis pelayanan & tanggal penggunaan.
    const [tarifRows] = await db.execute(
      `SELECT * FROM tarif_penggunaan 
       WHERE jenis_pelayanan = ? 
         AND efektif_dari <= ? 
         AND (efektif_sampai IS NULL OR efektif_sampai >= ?)
       ORDER BY efektif_dari DESC LIMIT 1`,
      [jenis_pelayanan, tanggal, tanggal]
    );
    
    if (tarifRows.length === 0) {
      return res.status(404).json({
        message: 'Tarif tidak ditemukan untuk jenis pelayanan ini pada tanggal tersebut.'
      });
    }
    
    const tarif_dasar = parseFloat(tarifRows[0].tarif_dasar);
    // Hitung total tagihan berdasarkan jumlah penggunaan dan tarif dasar yang ditemukan
    const total_tagihan = jumlah_penggunaan * tarif_dasar;
    
    // Simpan data penggunaan beserta total tagihan, dan set status "pending"
    const [result] = await db.execute(
      `INSERT INTO penggunaan (pelanggan_id, jumlah_penggunaan, tanggal, foto, total_tagihan, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [pelanggan_id, jumlah_penggunaan, tanggal, foto, total_tagihan, 'pending']
    );
    
    await logAudit(
      req.user && req.user.id,
      "CREATE_PENGGUNAAN",
      `Data penggunaan untuk pelanggan_id ${pelanggan_id} ditambahkan dengan total tagihan Rp ${total_tagihan} menggunakan tarif Rp ${tarif_dasar}.`
    );
    
    res.status(201).json({
      message: 'Data penggunaan berhasil ditambahkan',
      id: result.insertId,
      total_tagihan
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};


// Fungsi untuk mengambil seluruh riwayat penggunaan berdasarkan bulan dan tahun.
// Sekarang termasuk field "status" agar frontend dapat memfilter tagihan.
exports.getAllPenggunaanHistory = async (req, res) => {
  try {
    const { bulan, tahun } = req.query;
    if (!bulan || !tahun) {
      return res.status(400).json({ message: "Parameter 'bulan' dan 'tahun' harus disediakan." });
    }

    const bulanNum = parseInt(bulan);
    const tahunNum = parseInt(tahun);
    
    if (isNaN(bulanNum) || isNaN(tahunNum)) {
      return res.status(400).json({ message: "Parameter 'bulan' dan 'tahun' harus berupa angka." });
    }

    const [rows] = await db.execute(
      `
      SELECT 
        pg.id, 
        pg.pelanggan_id, 
        p.nama, 
        p.alamat, 
        pg.jumlah_penggunaan, 
        pg.total_tagihan, 
        pg.tanggal, 
        pg.foto,
        pg.status
      FROM penggunaan pg
      JOIN pelanggan p ON pg.pelanggan_id = p.id
      WHERE MONTH(pg.tanggal) = ? AND YEAR(pg.tanggal) = ?
      ORDER BY pg.tanggal DESC
      `,
      [bulanNum, tahunNum]
    );

    const usageHistory = rows.map((row) => {
      if (row.foto) {
        row.foto_url = `${req.protocol}://${req.get("host")}/uploads/${row.foto}`;
      } else {
        row.foto_url = null;
      }
      return row;
    });

    res.status(200).json(usageHistory);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan saat mengambil riwayat penggunaan." });
  }
};
