const db = require('../config/db');

exports.getTarif = async (req, res) => {
    try {
        const { tanggal } = req.query;
        let query = "SELECT * FROM tarif_penggunaan";
        let params = []
        if (tanggal) {
            query += "WHERE efektif_dari <= ? AND (efektif_sampai IS NULL OR efektif_sampai >= ?)";
            params.push(tanggal, tanggal);
        }
        const [rows] = await db.execute(query, params);
        res.status(200).json(rows);
    } catch (err) {
        console.error("Error retriving tarif:", err);
        res.status(500).json({ message: "Terjadi kesalahan saat mengambil tarif" });
    }
};

exports.createTarif = async (req, res) => {
    try {
        const { jenis_pelayanan, tarif_dasar, denda, efektif_dari, efektif_sampai, keterangan } = req.body;
        const [result] = await db.execute(
            `INSERT INTO tarif_penggunaan 
            (jenis_pelayanan, tarif_dasar, denda, efektif_dari, efektif_sampai, keterangan) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [jenis_pelayanan, tarif_dasar, denda, efektif_dari, efektif_sampai || null, keterangan || null]
        );
        res.status(201).json({ message: "Tarif berhasil ditambahkan" });
    } catch (err) {
        console.error("Error retrieving data:", err);
        res.status(500).json({ message: "Terjadi kesalahan saat menambahkan tarif penggunaan." });
    }
};

exports.updateTarif = async (req, res) => {
    try {
        const tarifId = req.params.id;
        const { jenis_pelayanan, tarif_dasar, denda, efektif_dari, efektif_sampai, keterangan } = req.body;
        await db.execute(
            `UPDATE tarif_penggunaan 
            SET jenis_pelayanan = ?, tarif_dasar = ?, denda = ?, efektif_dari = ?, efektif_sampai = ?, keterangan =? 
            WHERE id = ?`,
            [jenis_pelayanan, tarif_dasar, denda, efektif_dari, efektif_sampai || null, keterangan || null]
        );
        res.status(200).json({ message: "Tarif berhasil diperbarui" });
    } catch (err) {
        console.error("Error updating tarif", err);
        res.status(500).json({ message: "Gagal memperbarui tarif penggunaan" });
    }
};

exports.deleteTarif = async (req, res) => {
    try {
        const tarifId = req.params.id;
        await db.execute("DELETE FROM tarif_penggunaan WHERE id = ?", [tarifId]);
        res.status(200).json({ message: "Tarif penggunaan berhasil dihapus" });
    } catch (err) {
        console.error("Error saat menghapus tarif:", err);
        res.status(500).json({ message: "Gagal menghapus tarif" });
    }
};