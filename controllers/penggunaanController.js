// controllers/penggunaanController.js
const db = require('../config/db');

// Input penggunaan air beserta foto
exports.createPenggunaan = async (req, res) => {
  try {
    const { pelanggan_id, jumlah_penggunaan, tanggal } = req.body;
    const foto = req.file ? req.file.filename : null;

    // Dapatkan data pelanggan untuk menentukan tarif
    const [pelangganRows] = await db.execute('SELECT jenis_pelayanan FROM pelanggan WHERE id = ?', [pelanggan_id]);
    if (pelangganRows.length === 0) {
      return res.status(404).json({ message: 'Pelanggan tidak ditemukan' });
    }
    const jenis_pelayanan = pelangganRows[0].jenis_pelayanan;

    let tarif = 0;
    if (jenis_pelayanan.toLowerCase() === 'reguler') {
      tarif = 4000;
    } else if (jenis_pelayanan.toLowerCase() === 'subsidi') {
      tarif = 3000;
    }

    const total_tagihan = jumlah_penggunaan * tarif;

    // Masukkan record penggunaan
    const [result] = await db.execute(
      `INSERT INTO penggunaan (pelanggan_id, jumlah_penggunaan, tanggal, foto, total_tagihan) 
       VALUES (?, ?, ?, ?, ?)`,
      [pelanggan_id, jumlah_penggunaan, tanggal, foto, total_tagihan]
    );

    res.status(201).json({ message: 'Data penggunaan berhasil ditambahkan', id: result.insertId, total_tagihan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};


exports.getAllPenggunaanHistory = async (req, res) => {
  try {
    // Mengambil query parameter bulan dan tahun
    const { bulan, tahun } = req.query;

    // Validasi: Pastikan parameter bulan dan tahun disediakan
    if (!bulan || !tahun) {
      return res.status(400).json({ message: "Parameter 'bulan' dan 'tahun' harus disediakan." });
    }

    // Pastikan parameter berupa angka
    const bulanNum = parseInt(bulan);
    const tahunNum = parseInt(tahun);
    
    if (isNaN(bulanNum) || isNaN(tahunNum)) {
      return res.status(400).json({ message: "Parameter 'bulan' dan 'tahun' harus berupa angka." });
    }

    // Query dengan filter berdasarkan MONTH dan YEAR dari tanggal penggunaan
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
        pg.foto
      FROM penggunaan pg
      JOIN pelanggan p ON pg.pelanggan_id = p.id
      WHERE MONTH(pg.tanggal) = ? AND YEAR(pg.tanggal) = ?
      ORDER BY pg.tanggal DESC
      `,
      [bulanNum, tahunNum]
    );

    // Menambahkan properti foto_url agar frontend dapat menampilkan gambar dengan URL lengkap
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