// controllers/pembayaranController.js
const db = require('../config/db');
const { logAudit } = require("../helpers/auditLogger");

// Fungsi untuk membuat pembayaran
exports.createPembayaran = async (req, res) => {
  try {
    // Ambil data dari body
    const { penggunaan_id, tanggal_pembayaran, jumlah_pembayaran, metode_pembayaran, keterangan } = req.body;
    
    // Cek data penggunaan dengan status 'pending'
    const [usageRows] = await db.execute(
      "SELECT * FROM penggunaan WHERE id = ? AND status = 'pending'",
      [penggunaan_id]
    );
    
    if (usageRows.length === 0) {
      return res.status(404).json({ message: "Data penggunaan tidak ditemukan atau sudah dibayar." });
    }
    
    // Insert data ke tabel pembayaran
    const [result] = await db.execute(
      "INSERT INTO pembayaran (penggunaan_id, tanggal_pembayaran, jumlah_pembayaran, metode_pembayaran, keterangan) VALUES (?, ?, ?, ?, ?)",
      [penggunaan_id, tanggal_pembayaran, jumlah_pembayaran, metode_pembayaran, keterangan]
    );
    
    // Update status pada tabel penggunaan (menandai tagihan sudah lunas)
    await db.execute(
      "UPDATE penggunaan SET status = 'paid' WHERE id = ?",
      [penggunaan_id]
    );
    
    // Catat aktivitas ke audit log jika informasi user tersedia
    if (req.user && req.user.id) {
      await logAudit(
        req.user.id,
        "CREATE_PEMBAYARAN",
        `Pembayaran untuk penggunaan_id ${penggunaan_id} dicatat dengan jumlah Rp ${jumlah_pembayaran}. Tagihan diupdate menjadi 'paid'.`
      );
    }
    
    res.status(201).json({ 
      message: "Pembayaran berhasil dicatat dan tagihan telah diperbarui.",
      id: result.insertId 
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

// Fungsi untuk mendapatkan pembayaran berdasarkan ID penggunaan
exports.getPembayaranByPenggunaan = async (req, res) => {
  try {
      const { penggunaan_id } = req.params;
      const [rows] = await db.execute("SELECT * FROM pembayaran WHERE penggunaan_id = ?", [penggunaan_id]);
      res.status(200).json(rows);
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// Fungsi pencarian pelanggan berdasarkan nama
exports.searchPelangganByName = async (req, res) => {
  try {
      const { nama } = req.query;
      if (!nama)
          return res.status(400).json({ message: "Parameter nama harus disediakan." });
      const searchQuery = `%${nama}%`;
      const [rows] = await db.execute("SELECT id, nama, alamat FROM pelanggan WHERE nama LIKE ?", [searchQuery]);
      res.json(rows);
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

// Fungsi untuk mendapatkan semua data pembayaran (opsional)
exports.getAllPembayaran = async (req, res) => {
  try {
      const [rows] = await db.execute('SELECT * FROM pembayaran');
      res.status(200).json(rows);
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// Fungsi untuk mendapatkan riwayat pembayaran berdasarkan bulan dan tahun
exports.getPaymentHistory = async (req, res) => {
    try {
      const { bulan, tahun } = req.query;
      const [rows] = await db.execute(
        `SELECT 
           pb.id,
           pb.penggunaan_id,
           pb.tanggal_pembayaran,
           pb.jumlah_pembayaran,
           pb.metode_pembayaran,
           pb.keterangan,
           pl.nama,
           pl.alamat
         FROM pembayaran pb
         JOIN penggunaan pg ON pb.penggunaan_id = pg.id
         JOIN pelanggan pl ON pg.pelanggan_id = pl.id
         WHERE MONTH(pb.tanggal_pembayaran) = ? AND YEAR(pb.tanggal_pembayaran) = ?
         ORDER BY pb.tanggal_pembayaran DESC`,
        [bulan, tahun]
      );
      res.status(200).json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Terjadi kesalahan saat mengambil riwayat pembayaran." });
    }
  };
