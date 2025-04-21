const db = require('../config/db');

exports.createPembayaran = async (req, res) => {
    try {
        const { penggunaan_id, tanggal_pembayaran, jumlah_pembayaran, metode_pembayaran, keterangan } = req.body;
        const [penggunaanRows] = await db.execute('SELECT id FROM penggunaan WHERE id = ?', [penggunaan_id]);
        if (penggunaanRows.length === 0) {
            return res.status(404).json({ message: 'Data penggunaan tidak ditemukan' });
        }

        const [result] = await db.execute(
            'INSERT INTO pembayaran (penggunaan_id, tanggal_pembayaran, jumlah_pembayaran, metode_pembayaran, keterangan) VALUES (?, ?, ?, ?, ?)',
            [penggunaan_id, tanggal_pembayaran, jumlah_pembayaran, metode_pembayaran, keterangan]
        );
        res.status(201).json({ message: 'Pembayaran berhasil dicatat', id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Teradi kesalahan pada server' });
    }
};

exports.getPembayaraByPenggunaan = async (req, res) => {
    try {
        const { penggunaan_id } = req.params;
        const [rows] = await db.execute('SELECT * FROM pembayaran WHERE penggunaan_id = ?', [penggunaan_id]);
        res.status(200).json(rows);
    } catch (err) {
        console.error (err);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};

exports.getAllPembayaran = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM pembayaran');
        res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};