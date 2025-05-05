// controllers/tagihanController.js
const db = require('../config/db');
const PDFDocument = require('pdfkit');
const Excel = require('exceljs');
const fs = require('fs');
const path = require('path');

// Generate nota tagihan sebagai PDF untuk penggunaan tertentu dengan tampilan profesional
exports.generateNota = async (req, res) => {
  try {
    const { id } = req.params; // id penggunaan
    
    // Gabungkan data penggunaan dan data pelanggan (removed nomor_pelanggan)
    const [rows] = await db.execute(
      `SELECT p.id as pelanggan_id, p.nama, p.alamat, pg.id as penggunaan_id, 
       pg.jumlah_penggunaan, pg.total_tagihan, pg.tanggal, p.keterangan
       FROM penggunaan pg 
       JOIN pelanggan p ON pg.pelanggan_id = p.id 
       WHERE pg.id = ?`, [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Data tidak ditemukan' });
    }
    
    const data = rows[0];
    const invoiceNumber = `INV/${data.penggunaan_id}/${new Date(data.tanggal).getFullYear()}`;
    
    // Hitung tanggal jatuh tempo (14 hari setelah tanggal tagihan)
    const invoiceDate = new Date(data.tanggal);
    const dueDate = new Date(data.tanggal);
    dueDate.setDate(dueDate.getDate() + 14);
    
    // Format tanggal Indonesia
    const formatTanggal = (date) => {
      const options = { day: 'numeric', month: 'long', year: 'numeric' };
      return date.toLocaleDateString('id-ID', options);
    };

    // Buat dokumen PDF
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=nota_tagihan_${data.pelanggan_id}.pdf`);

    doc.pipe(res);
    
    // Header
    doc.fontSize(20).font('Helvetica-Bold').text('PDAM DESA SEJAHTERA', { align: 'center' });
    doc.fontSize(12).font('Helvetica').text('Jl. Raya Desa No. 123, Kecamatan Maju Bersama', { align: 'center' });
    doc.text('Telp: (021) 123-4567 | Email: info@pdamdesa.co.id', { align: 'center' });
    
    // Garis pembatas
    doc.moveDown();
    doc.strokeColor('#000000').lineWidth(1).moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
    doc.moveDown();

    // Judul Nota
    doc.fontSize(16).font('Helvetica-Bold').text('NOTA TAGIHAN', { align: 'center' });
    doc.moveDown();
    
    // Informasi Nota dan Pelanggan - layout 2 kolom
    const startY = doc.y;
    
    // Kolom kiri - Info Pelanggan
    doc.font('Helvetica-Bold').fontSize(11).text('Kepada:', 50, startY);
    doc.font('Helvetica').fontSize(10).text(data.nama, 50, startY + 15);
    doc.text(data.alamat, 50, startY + 30);
    doc.text(`No. Pelanggan: P-${data.pelanggan_id}`, 50, startY + 45); // Using pelanggan_id instead
    
    // Kolom kanan - Info Tagihan
    doc.font('Helvetica-Bold').fontSize(11).text('Informasi Tagihan:', 300, startY);
    doc.font('Helvetica').fontSize(10).text(`No. Tagihan: ${invoiceNumber}`, 300, startY + 15);
    doc.text(`Tanggal Tagihan: ${formatTanggal(invoiceDate)}`, 300, startY + 30);
    doc.text(`Tanggal Jatuh Tempo: ${formatTanggal(dueDate)}`, 300, startY + 45);
    
    doc.moveDown(5);
    
    // Detail Penggunaan
    doc.font('Helvetica-Bold').fontSize(12).text('RINCIAN TAGIHAN', { align: 'center' });
    doc.moveDown();
    
    // Header tabel
    const tableTop = doc.y;
    const tableHeaders = ['Deskripsi', 'Jumlah', 'Satuan', 'Harga'];
    const tableWidths = [250, 80, 80, 100];
    
    // Buat header tabel
    doc.font('Helvetica-Bold').fontSize(10);
    let xPos = 50;
    tableHeaders.forEach((header, i) => {
      doc.text(header, xPos, tableTop);
      xPos += tableWidths[i];
    });
    
    doc.moveDown();
    const contentStart = doc.y;
    
    // Isi tabel
    doc.font('Helvetica').fontSize(10);
    doc.text('Penggunaan Air', 50, contentStart);
    doc.text(`${data.jumlah_penggunaan}`, 300, contentStart);
    doc.text('m³', 380, contentStart);
    doc.text(`Rp ${data.total_tagihan.toLocaleString('id-ID')}`, 460, contentStart);
    
    // Garis bawah tabel
    doc.moveDown(2);
    doc.strokeColor('#000000').lineWidth(1).moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
    doc.moveDown();
    
    // Total
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text(`Total Tagihan: Rp ${data.total_tagihan.toLocaleString('id-ID')}`, 350, doc.y);
    
    doc.moveDown(2);
    
    // Informasi pembayaran
    doc.font('Helvetica-Bold').fontSize(11).text('Informasi Pembayaran:', { underline: true });
    doc.moveDown(2);
    doc.font('Helvetica').fontSize(10);
    doc.text('1. Pembayaran dapat dilakukan melalui kantor PDAM atau bank yang ditunjuk.');
    doc.text('2. Harap cantumkan nomor tagihan pada saat melakukan pembayaran.');
    doc.text('3. Keterlambatan pembayaran akan dikenakan denda sesuai ketentuan.');
    
    // Keterangan tambahan
    if (data.keterangan) {
      doc.moveDown();
      doc.font('Helvetica-Bold').fontSize(11).text('Catatan:', { underline: true });
      doc.font('Helvetica').fontSize(10).text(data.keterangan);
    }
    
    // Footer
    const pageHeight = doc.page.height;
    doc.font('Helvetica-Oblique').fontSize(8)
      .text('Dokumen ini dibuat secara otomatis dan sah tanpa tanda tangan.', 
        50, pageHeight - 50, { align: 'center' });
    
    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan saat membuat nota' });
  }
};

// Export laporan per bulan ke PDF dengan tampilan profesional
exports.exportLaporanPDF = async (req, res) => {
  try {
    const { bulan, tahun } = req.query; // filter berdasarkan bulan & tahun
    
    if (!bulan || !tahun) {
      return res.status(400).json({ message: 'Parameter Bulan dan Tahun harus ditambahkan' });
    }
    
    // Mendapatkan nama bulan dalam Bahasa Indonesia
    const namaBulan = new Date(tahun, bulan - 1, 1).toLocaleDateString('id-ID', { month: 'long' });
    
    // Remove nomor_pelanggan from SQL query
   // Untuk exportLaporanPDF
   const [rows] = await db.execute(
    `SELECT p.id, p.nama, p.alamat, 
     pg.jumlah_penggunaan, pg.total_tagihan, pg.tanggal, pg.status
     FROM penggunaan pg 
     JOIN pelanggan p ON pg.pelanggan_id = p.id 
     WHERE MONTH(pg.tanggal) = ? AND YEAR(pg.tanggal) = ?
     ORDER BY p.nama ASC`,
    [bulan, tahun]
  );

// Untuk exportLaporanExcel
// Gunakan query yang sama seperti di atas
    
    // Hitung total
    const totalTagihan = rows.reduce((sum, row) => sum + Number(row.total_tagihan), 0);
    const totalPenggunaan = rows.reduce((sum, row) => sum + Number(row.jumlah_penggunaan), 0);
    
    // Buat dokumen PDF
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      bufferPages: true
    });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=laporan_${bulan}_${tahun}.pdf`);

    doc.pipe(res);
    
    // Header
    doc.fontSize(16).font('Helvetica-Bold').text('PDAM DESA SEJAHTERA', { align: 'center' });
    doc.fontSize(12).font('Helvetica').text('Jl. Raya Desa No. 123, Kecamatan Maju Bersama', { align: 'center' });
    doc.moveDown(0.5);
    
    // Judul Laporan
    doc.fontSize(14).font('Helvetica-Bold')
      .text(`LAPORAN PENGGUNAAN AIR BULAN ${namaBulan.toUpperCase()} ${tahun}`, { align: 'center' });
    doc.moveDown();
    
    // Tanggal laporan
    const today = new Date();
    doc.fontSize(10).font('Helvetica')
      .text(`Tanggal Cetak: ${today.toLocaleDateString('id-ID')}`, { align: 'right' });
    doc.moveDown();
    
    // Tabel laporan
    const tableHeaders = ['No', 'ID Pelanggan', 'Nama', 'Alamat', 'Penggunaan (m³)', 'Tagihan (Rp)', 'Status'];
    const tableWidths = [30, 80, 100, 140, 70, 70, 50];
    
    // Buat header tabel dengan background
    const drawTableHeader = (y) => {
      // Background header
      doc.rect(50, y - 5, doc.page.width - 100, 20).fill('#f2f2f2');
      
      // Header teks
      doc.font('Helvetica-Bold').fontSize(9);
      let xPos = 50;
      tableHeaders.forEach((header, i) => {
        const options = {};
        if (i > 2) options.align = 'center';
        
        doc.fillColor('#000000').text(header, xPos, y, options);
        xPos += tableWidths[i];
      });
      return y + 20;
    };
    
    let y = drawTableHeader(doc.y);
    
    // Isi tabel
    doc.font('Helvetica').fontSize(8);
    
    // Fungsi untuk mengecek apakah perlu pindah halaman
    const checkNewPage = () => {
      if (doc.y > doc.page.height - 100) {
        doc.addPage();
        doc.font('Helvetica-Italic').fontSize(8)
          .text(`Laporan Penggunaan Air - ${namaBulan} ${tahun} (lanjutan)`, 50, 50);
        doc.moveDown();
        y = drawTableHeader(doc.y);
      }
    };
    
    // Gambar garis horizontal
    const drawHorizontalLine = (yPos) => {
      doc.strokeColor('#dddddd').lineWidth(0.5)
        .moveTo(50, yPos).lineTo(doc.page.width - 50, yPos).stroke();
    };
    
    rows.forEach((row, index) => {
      checkNewPage();
      
      // Alternating row colors
      if (index % 2 === 0) {
        doc.rect(50, y - 5, doc.page.width - 100, 20).fill('#f9f9f9');
      }
      
      doc.fillColor('#000000');
      doc.text(String(index + 1), 50, y, { width: 30 });
      doc.text(`P-${row.id}`, 80, y, { width: 80 }); // Using P- prefix with ID
      doc.text(row.nama, 160, y, { width: 100 });
      doc.text(row.alamat, 260, y, { width: 140 });
      doc.text(String(row.jumlah_penggunaan), 400, y, { width: 70, align: 'center' });
      doc.text(row.total_tagihan.toLocaleString('id-ID'), 470, y, { width: 70, align: 'center' });
      
      // Status dengan warna
      const status = row.status === 'paid' ? 'Lunas' : 'Belum';
      const statusColor = row.status === 'paid' ? '#28a745' : '#dc3545';
      doc.fillColor(statusColor).text(status, 540, y, { width: 50, align: 'center' });
      doc.fillColor('#000000');
      
      y += 20;
      drawHorizontalLine(y - 5);
    });
    
    // Ringkasan
    doc.moveDown();
    doc.font('Helvetica-Bold').fontSize(10).text('Ringkasan:', 50, y + 10);
    doc.moveDown();
    
    const summaryStartY = doc.y;
    doc.font('Helvetica').fontSize(9);
    doc.text('Jumlah Pelanggan:', 50, summaryStartY);
    doc.text(`${rows.length} orang`, 150, summaryStartY, { align: 'left' });
    
    doc.text('Total Penggunaan Air:', 50, summaryStartY + 15);
    doc.text(`${totalPenggunaan.toLocaleString('id-ID')} m³`, 150, summaryStartY + 15, { align: 'left' });
    
    doc.text('Total Tagihan:', 50, summaryStartY + 30);
    doc.text(`Rp ${totalTagihan.toLocaleString('id-ID')}`, 150, summaryStartY + 30, { align: 'left' });
    
    // Tambahkan nomor halaman
    const pageCount = doc.bufferedPageCount;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).text(
        `Halaman ${i + 1} dari ${pageCount}`,
        50,
        doc.page.height - 50,
        { align: 'center' }
      );
    }
    
    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan saat export laporan PDF' });
  }
};

// Export laporan per bulan ke Excel dengan tampilan profesional
exports.exportLaporanExcel = async (req, res) => {
  try {
    const { bulan, tahun } = req.query;
    if (!bulan || !tahun) {
      return res.status(400).json({ message: 'Parameter Bulan dan Tahun harus ditambahkan' });
    }
    
    // Mendapatkan nama bulan dalam Bahasa Indonesia
    const namaBulan = new Date(tahun, bulan - 1, 1).toLocaleDateString('id-ID', { month: 'long' });
    
    // Remove nomor_pelanggan from SQL query
    const [rows] = await db.execute(
      `SELECT p.id, p.nama, p.alamat, 
       pg.jumlah_penggunaan, pg.total_tagihan, pg.tanggal, pg.status
       FROM penggunaan pg 
       JOIN pelanggan p ON pg.pelanggan_id = p.id 
       WHERE MONTH(pg.tanggal) = ? AND YEAR(pg.tanggal) = ?
       ORDER BY p.nama ASC`,
      [bulan, tahun]
    );
    
    // Hitung ringkasan data
    const totalTagihan = rows.reduce((sum, row) => sum + Number(row.total_tagihan), 0);
    const totalPenggunaan = rows.reduce((sum, row) => sum + Number(row.jumlah_penggunaan), 0);
    const pelunasan = rows.filter(row => row.status === 'paid').length;
    const belumLunas = rows.length - pelunasan;
    
    // Buat workbook baru
    const workbook = new Excel.Workbook();
    workbook.creator = 'PDAM Desa System';
    workbook.created = new Date();
    
    // Buat worksheet
    const worksheet = workbook.addWorksheet(`Laporan ${namaBulan} ${tahun}`, {
      properties: { tabColor: { argb: '4F81BD' } }
    });
    
    // Header laporan
    worksheet.mergeCells('A1:G1');
    worksheet.mergeCells('A2:G2');
    worksheet.mergeCells('A3:G3');
    
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'PDAM DESA SEJAHTERA';
    titleCell.font = {
      name: 'Calibri',
      size: 16,
      bold: true
    };
    titleCell.alignment = { horizontal: 'center' };
    
    const addressCell = worksheet.getCell('A2');
    addressCell.value = 'Jl. Raya Desa No. 123, Kecamatan Maju Bersama';
    addressCell.font = { name: 'Calibri', size: 12 };
    addressCell.alignment = { horizontal: 'center' };
    
    const reportTitleCell = worksheet.getCell('A3');
    reportTitleCell.value = `LAPORAN PENGGUNAAN AIR BULAN ${namaBulan.toUpperCase()} ${tahun}`;
    reportTitleCell.font = {
      name: 'Calibri',
      size: 14,
      bold: true
    };
    reportTitleCell.alignment = { horizontal: 'center' };
    
    // Tanggal cetak
    worksheet.mergeCells('F5:G5');
    const dateCell = worksheet.getCell('F5');
    dateCell.value = `Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`;
    dateCell.font = { italic: true, size: 10 };
    dateCell.alignment = { horizontal: 'right' };
    
    // Definisikan kolom tabel
    worksheet.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'ID Pelanggan', key: 'id_pelanggan', width: 15 }, // Changed from nomor_pelanggan
      { header: 'Nama', key: 'nama', width: 25 },
      { header: 'Alamat', key: 'alamat', width: 30 },
      { header: 'Penggunaan (m³)', key: 'jumlah_penggunaan', width: 15 },
      { header: 'Total Tagihan', key: 'total_tagihan', width: 15 },
      { header: 'Status', key: 'status_pembayaran', width: 10 }
    ];
    
    // Styling header tabel
    const headerRow = worksheet.getRow(7);
    headerRow.font = { bold: true };
    headerRow.alignment = { horizontal: 'center' };
    headerRow.height = 20;
    
    // Tambahkan background color ke header
    ['A7', 'B7', 'C7', 'D7', 'E7', 'F7', 'G7'].forEach(cell => {
      worksheet.getCell(cell).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '4F81BD' },
        bgColor: { argb: '4F81BD' }
      };
      worksheet.getCell(cell).font = {
        bold: true,
        color: { argb: 'FFFFFF' }
      };
      worksheet.getCell(cell).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    
    // Tambahkan data
    rows.forEach((row, index) => {
      const rowNumber = index + 8; // Start after header (row 7)
      
      worksheet.addRow({
        no: index + 1,
        id_pelanggan: `P-${row.id}`,
        nama: row.nama,
        alamat: row.alamat,
        jumlah_penggunaan: row.jumlah_penggunaan,
        total_tagihan: row.total_tagihan,
        status_pembayaran: row.status === 'paid' ? 'Lunas' : 'Belum'
      });
      
      // Format currency
      worksheet.getCell(`F${rowNumber}`).numFmt = 'Rp#,##0';
      
      // Format jumlah penggunaan
      worksheet.getCell(`E${rowNumber}`).alignment = { horizontal: 'center' };
      
      // Format status pembayaran dengan warna
      const statusCell = worksheet.getCell(`G${rowNumber}`);
      statusCell.alignment = { horizontal: 'center' };
      if (row.status === 'paid') {
        statusCell.font = { color: { argb: '008000' } }; // Green
      } else {
        statusCell.font = { color: { argb: 'FF0000' } }; // Red
      }
      
      // Alternating row colors
      if (index % 2 === 1) {
        ['A', 'B', 'C', 'D', 'E', 'F', 'G'].forEach(col => {
          worksheet.getCell(`${col}${rowNumber}`).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'F2F2F2' },
            bgColor: { argb: 'F2F2F2' }
          };
        });
      }
      
      // Border untuk semua cell
      ['A', 'B', 'C', 'D', 'E', 'F', 'G'].forEach(col => {
        worksheet.getCell(`${col}${rowNumber}`).border = {
          top: { style: 'thin', color: { argb: 'D3D3D3' } },
          left: { style: 'thin', color: { argb: 'D3D3D3' } },
          bottom: { style: 'thin', color: { argb: 'D3D3D3' } },
          right: { style: 'thin', color: { argb: 'D3D3D3' } }
        };
      });
    });
    
    // Buat ringkasan
    const summaryStartRow = rows.length + 10;
    
    worksheet.mergeCells(`A${summaryStartRow}:G${summaryStartRow}`);
    const summaryTitleCell = worksheet.getCell(`A${summaryStartRow}`);
    summaryTitleCell.value = 'RINGKASAN';
    summaryTitleCell.font = { bold: true, size: 12 };
    summaryTitleCell.alignment = { horizontal: 'center' };
    summaryTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '4F81BD' },
      bgColor: { argb: '4F81BD' }
    };
    summaryTitleCell.font = {
      bold: true,
      color: { argb: 'FFFFFF' }
    };
    
    // Tambahkan data ringkasan
    worksheet.mergeCells(`A${summaryStartRow+1}:C${summaryStartRow+1}`);
    worksheet.getCell(`A${summaryStartRow+1}`).value = 'Jumlah Pelanggan';
    worksheet.getCell(`A${summaryStartRow+1}`).font = { bold: true };
    
    worksheet.mergeCells(`D${summaryStartRow+1}:G${summaryStartRow+1}`);
    worksheet.getCell(`D${summaryStartRow+1}`).value = `${rows.length} orang`;
    
    worksheet.mergeCells(`A${summaryStartRow+2}:C${summaryStartRow+2}`);
    worksheet.getCell(`A${summaryStartRow+2}`).value = 'Total Penggunaan';
    worksheet.getCell(`A${summaryStartRow+2}`).font = { bold: true };
    
    worksheet.mergeCells(`D${summaryStartRow+2}:G${summaryStartRow+2}`);
    worksheet.getCell(`D${summaryStartRow+2}`).value = `${totalPenggunaan} m³`;
    
    worksheet.mergeCells(`A${summaryStartRow+3}:C${summaryStartRow+3}`);
    worksheet.getCell(`A${summaryStartRow+3}`).value = 'Total Tagihan';
    worksheet.getCell(`A${summaryStartRow+3}`).font = { bold: true };
    
    worksheet.mergeCells(`D${summaryStartRow+3}:G${summaryStartRow+3}`);
    worksheet.getCell(`D${summaryStartRow+3}`).value = totalTagihan;
    worksheet.getCell(`D${summaryStartRow+3}`).numFmt = 'Rp#,##0';
    
    worksheet.mergeCells(`A${summaryStartRow+4}:C${summaryStartRow+4}`);
    worksheet.getCell(`A${summaryStartRow+4}`).value = 'Status Pelunasan';
    worksheet.getCell(`A${summaryStartRow+4}`).font = { bold: true };
    
    worksheet.mergeCells(`D${summaryStartRow+4}:G${summaryStartRow+4}`);
    worksheet.getCell(`D${summaryStartRow+4}`).value = `Lunas: ${pelunasan} orang, Belum Lunas: ${belumLunas} orang`;
    
    // Border untuk data ringkasan
    for (let i = 1; i <= 4; i++) {
      ['A', 'B', 'C', 'D', 'E', 'F', 'G'].forEach(col => {
        worksheet.getCell(`${col}${summaryStartRow+i}`).border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    }
    
    // Footer
    const footerRow = summaryStartRow + 6;
    worksheet.mergeCells(`A${footerRow}:G${footerRow}`);
    const footerCell = worksheet.getCell(`A${footerRow}`);
    footerCell.value = 'Dokumen ini digenerate secara otomatis oleh Sistem PDAM Desa Sejahtera';
    footerCell.font = { italic: true, size: 10 };
    footerCell.alignment = { horizontal: 'center' };
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=laporan_${bulan}_${tahun}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan saat export laporan Excel' });
  }
};