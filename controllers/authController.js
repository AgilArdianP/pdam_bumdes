const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../config/db');

const secretKey = process.env.JWT_SECRET || 'agilardian25';

exports.registerAdmin = async (req, res) => {
    try {
      const { username, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.execute('INSERT INTO admin (username, password) VALUES (?, ?)', [username, hashedPassword]);
      res.status(201).json({ message: 'Admin berhasil didaftarkan' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  };


exports.login = async (req, res,) => {
    try {
        const { username, password } = req.body;
        const [rows] = await db.execute('SELECT * FROM admin WHERE username = ?', [username]);
        if (rows.length === 0) {
            return res.status(400).json({ message: 'Username tidak ditemukan' });
        }
        const admin = rows[0];
        const validPassword = await bcrypt.compare(password, admin.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Password salah' });
        }
        const token = jwt.sign({ id: admin.id, username: admin.username }, secretKey, { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ message: 'Terjadi kesalahan pada Server' });
    }
};