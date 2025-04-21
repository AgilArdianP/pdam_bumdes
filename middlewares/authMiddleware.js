const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET || 'secret123';

function verifyToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: 'Akses ditolak. Token tidak ditemukan' });
    try {
        const decoded = jwt.verify(token.split(' ')[1], secretKey);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(400).json({ message: 'Token tidak valid' });
    }
}

module.exports = { verifyToken };