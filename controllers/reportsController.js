const db = require("../config/db");

exports.getUsageReport = async (req, res) => {
    try {
        const { tahun } = req.query;
        if (!tahun || isNaN(parseInt(tahun))) {
            return res.status(400).json({ message: "Parameter 'tahun' harus diisi dan berupa angka." });
        }

        const [monthlyRows] = await db.execute(
            `SELECT MONTH(tanggal) AS bulan, SUM(jumlah_penggunaan) AS total_penggunaan 
            FROM penggunaan 
            WHERE YEAR(tanggal) = ?
            GROUP BY MONTH(tanggal)
            ORDER BY MONTH(tanggal)`,
            [tahun]
        );

        const [outstandingRows] = await db.execute(
            `SELECT p.id, p.nama, p.alamat, pg.total_tagihan 
       FROM pelanggan p 
       JOIN penggunaan pg ON p.id = pg.pelanggan_id
       WHERE pg.id IS NOT NULL`
        );

        const report = { monthlyUsage: monthlyRows, outstandingCustomers: outstandingRows };
        res.status(200).json(report);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan saat menghasilkan laporan detail penggunaan" });
    }
};