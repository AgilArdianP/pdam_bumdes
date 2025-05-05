const db = require("../config/db");
const XLSX = require("xlsx");

exports.backupData = async (req, res) => {
    try {
        const [usageRows] = await db.execute("SELECT * FROM penggunaan");
        const host = req.get("host");
        const protocol = req.protocol;
        usageRows.forEach(row => {
            if (row.foto) {
                row.foto_url = `${protocol}://${host}/uploads/${row.foto}`;
            } else {
                row.foto_url = "";
            }
        });

        const [pelangganRows] = await db.execute("SELECT * FROM pelanggan");
        const [pembayaranRows] = await db.execute("SELECT * FROM pembayaran");

        const workbook = XLSX.utils.book_new();

        const usageSheet = XLSX.utils.json_to_sheet(usageRows);
        XLSX.utils.book_append_sheet(workbook, usageSheet, "Penggunaan");

        const pelangganSheet = XLSX.utils.json_to_sheet(pelangganRows);
        XLSX.utils.book_append_sheet(workbook, pelangganSheet, "Pelanggan");

        const pembayaranSheet = XLSX.utils.json_to_sheet(pembayaranRows);
        XLSX.utils.book_append_sheet(workbook, pembayaranRows, "Pembayaran");

        const fileBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

        res.setHeader("Content-Disposition", "attachment; filename=backup.xlsx");
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.send(fileBuffer);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan saat backup Data." });
    }
};


exports.restoreData = async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ message: "File tidak ditemukan." });
        }

        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });

        const usageSheet = workbook.Sheets["Penggunaan"];
        if (!usageSheet) {
            res.status(400).json({ message: "'Penggunaan' tidak ditemukan di File Excel." });
        }
        const usageData = XLSX.utils.sheet_to_json(usageSheet);

        for (const row of usageData) {
            await db.execute(
                `INSERT INTO penggunaan (pelanggan_id, jumlah_penggunaan, tanggal, foto, total_tagihan, status) 
                VALUES (?, ?, ?, ?, ?, ?)`,
                [row.pelanggan_id, row.jumlah_penggunaan, row.tanggal, row.foto, row.total_tagihan, row.status]
            );
        }
        res.status(200).json({ message: "Restore data berhasil." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan saat Restore Data." });
    }
};