const db = require ('../config/db');
const { logAudit } = require("../helpers/auditLogger");

exports.createPelanggan = async (req, res) => {
    try {
        const { nama, alamat, jenis_pelayanan, keterangan } = req.body;
        const [result] = await db.execute(
            'INSERT INTO pelanggan (nama, alamat, jenis_pelayanan, keterangan) VALUES (?, ?, ?, ?)',
            [nama, alamat, jenis_pelayanan, keterangan]
        );
        res.status(201).json({ message: 'Pelanggan berhasil ditambahkan', id: result.insertId });
        await logAudit(req.user.id, "CREATE_PELANGGAN", `Pelanggan ${nama} ditambahkan.`);
    } catch (err) {
        res.status(500).json({ message: 'Gagal menambahkan pelanggan' });
    }
}

exports.getAllPelanggan = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM pelanggan');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};

exports.getPelangganById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.execute('SELECT * FROM pelanggan WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Pelanggan tidak ditemukan' });
        }
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};

exports.updatePelanggan = async (req, res) => {
    try {
        const { id } = req.params;
        const { nama, alamat, jenis_pelayanan, keterangan } = req.body;
        await db.execute(
            'UPDATE pelanggan SET nama = ?, alamat = ?, jenis_pelayanan = ?, keterangan = ? WHERE id = ?',
            [nama, alamat, jenis_pelayanan, keterangan, id]
       );
       res.json ({ message: 'Pelanggan berhasil diperbarui' });
    } catch (err) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};

exports.deletePelanggan = async (req, res) => {
    try {
        const { id } = req.params;
        await db.execute('DELETE FROM pelanggan WHERE id = ?', [id]);
        res.json({ message: 'Pelanggan berhasil dihapus' });
    } catch (err) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};


exports.searchPelanggan = async (req, res) => {
    try {
      const { query } = req.query;
      if (!query) {
        return res.status(400).json({ message: 'Parameter query harus disertakan' });
      }
      const searchQuery = `%${query}%`;
      const [rows] = await db.execute(
        'SELECT * FROM pelanggan WHERE nama LIKE ? OR alamat LIKE ?',
        [searchQuery, searchQuery]
      );
      res.status(200).json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  }