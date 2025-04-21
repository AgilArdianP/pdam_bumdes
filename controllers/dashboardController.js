const db = require('../config/db');

exports.getDashboardStats = async (req, res) => {
  try {
    const { bulan, tahun } = req.query;
    if (!bulan || !tahun) {
      return res.status(400).json({ message: 'Parameter bulan dan tahun harus disediakan' });
    }

    const [usageRows] = await db.execute(
        `SELECT COUNT(*) AS total_penggunaan, 
                SUM(total_tagihan) AS total_tagihan 
         FROM penggunaan 
         WHERE MONTH(tanggal) = ? AND YEAR(tanggal) = ?`,
        [bulan, tahun]
      );

      const [paymentRows] = await db.execute(
        `SELECT SUM(jumlah_pembayaran) AS total_pembayaran 
         FROM pembayaran 
         WHERE MONTH(tanggal_pembayaran) = ? AND YEAR(tanggal_pembayaran) = ?`,
        [bulan, tahun]
      );

      const dashboardData = {
        totalPenggunaan: usageRows[0].total_penggunaan,
        totalTagihan: usageRows[0].total_tagihan || 0,
        totalPembayaran: paymentRows[0].total_pembayaran || 0,
        outstanding: (usageRows[0].total_tagihan || 0) - (paymentRows[0].total_pembayaran || 0)
      };
      res.status(200).json(dashboardData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

exports.getMonthlyUsageStats = async (req, res) => {
  try {
    const { tahun } = req.query;

    if(!tahun || isNaN(parseInt(tahun))) {
      return res.status(400).json({ message: "Parameter Tahun harus berupa angka." });
    }

      const [rows] = await db.execute(
        `
        SELECT MONTH(tanggal) AS bulan, SUM(jumlah_penggunaan) AS total_penggunaan 
        FROM penggunaan 
        WHERE YEAR(tanggal) = ?
        GROUP BY MONTH(tanggal)
        ORDER BY MONTH(tanggal)
        `,
        [tahun]
      );
      res.status(200).json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Terjadi kesalahan saat mengambil data" });
  }
}