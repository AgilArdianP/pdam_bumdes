// controllers/tagihanController.js
const db = require('../config/db');
const PDFDocument = require('pdfkit');
const Excel = require('exceljs');

// Generate nota tagihan sebagai PDF untuk penggunaan tertentu
exports.generateNota = async (req, res) => {
  try {
    const { id } = req.params; // id penggunaan
    // Gabungkan data penggunaan dan data pelanggan
    const [rows] = await db.execute(
      `SELECT p.nama, p.alamat, pg.jumlah_penggunaan, pg.total_tagihan, pg.tanggal, p.keterangan 
       FROM penggunaan pg 
       JOIN pelanggan p ON pg.pelanggan_id = p.id 
       WHERE pg.id = ?`, [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Data tidak ditemukan' });
    }
    const data = rows[0];

    // Buat dokumen PDF
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=nota_tagihan.pdf');

    doc.pipe(res);
    doc.fontSize(18).text('Nota Tagihan PDAM Desa', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Nama Warga: ${data.nama}`);
    doc.text(`Alamat: ${data.alamat}`);
    doc.text(`Jumlah Penggunaan: ${data.jumlah_penggunaan} m3`);
    doc.text(`Total Tagihan: Rp ${data.total_tagihan}`);
    doc.text(`Tanggal Tagihan: ${data.tanggal}`);

    // Hitung tanggal jatuh tempo (misalnya 14 hari setelah tanggal tagihan)
    const dueDate = new Date(data.tanggal);
    dueDate.setDate(dueDate.getDate() + 14);
    doc.text(`Tanggal Jatuh Tempo: ${dueDate.toISOString().split('T')[0]}`);
    doc.moveDown();
    doc.text(`Keterangan: ${data.keterangan || '-'}`);

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan saat membuat nota' });
  }
};

// Export laporan per bulan ke PDF
exports.exportLaporanPDF = async (req, res) => {
  try {
    const { bulan, tahun } = req.query; // filter berdasarkan bulan & tahun
    const [rows] = await db.execute(
      `SELECT p.nama, p.alamat, pg.jumlah_penggunaan, pg.total_tagihan, pg.tanggal 
       FROM penggunaan pg 
       JOIN pelanggan p ON pg.pelanggan_id = p.id 
       WHERE MONTH(pg.tanggal) = ? AND YEAR(pg.tanggal) = ?`,
      [bulan, tahun]
    );
    
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=laporan.pdf');

    doc.pipe(res);
    doc.fontSize(16).text(`Laporan Bulanan ${bulan}/${tahun}`, { align: 'center' });
    doc.moveDown();

    rows.forEach((row, index) => {
      doc.fontSize(12).text(`${index + 1}. Nama: ${row.nama}, Alamat: ${row.alamat}, Penggunaan: ${row.jumlah_penggunaan} m3, Tagihan: Rp ${row.total_tagihan}, Tanggal: ${row.tanggal}`);
      doc.moveDown();
    });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan saat export laporan PDF' });
  }
};

// Export laporan per bulan ke Excel
exports.exportLaporanExcel = async (req, res) => {
  try {
    const { bulan, tahun } = req.query;
    if (!bulan || !tahun) {
      return res.status(400).json({ message: 'Parameter Bulan dan Tahun harus ditambahkan' });
    }
    const [rows] = await db.execute(
      `SELECT p.nama, p.alamat, pg.jumlah_penggunaan, pg.total_tagihan, pg.tanggal 
       FROM penggunaan pg 
       JOIN pelanggan p ON pg.pelanggan_id = p.id 
       WHERE MONTH(pg.tanggal) = ? AND YEAR(pg.tanggal) = ?`,
      [bulan, tahun]
    );
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet(`Laporan ${bulan}-${tahun}`);

    worksheet.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'Nama', key: 'nama', width: 25 },
      { header: 'Alamat', key: 'alamat', width: 30 },
      { header: 'Jumlah Penggunaan (m3)', key: 'jumlah_penggunaan', width: 20 },
      { header: 'Total Tagihan', key: 'total_tagihan', width: 15 },
      { header: 'Tanggal', key: 'tanggal', width: 15 },
    ];

    rows.forEach((row, index) => {
      worksheet.addRow({
        no: index + 1,
        nama: row.nama,
        alamat: row.alamat,
        jumlah_penggunaan: row.jumlah_penggunaan,
        total_tagihan: row.total_tagihan,
        tanggal: row.tanggal,
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=laporan.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan saat export laporan Excel' });
  }
};
