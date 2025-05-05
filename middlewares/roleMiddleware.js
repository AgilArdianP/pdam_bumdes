module.exports = {
    requireAdmin: (req, res, next) => {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Akses hanya untuk admin" });
        }
        next();
    },

    requirePetugas: (req, res, next) => {
        if (req.user.role !== "petugas" && req.user.role !== "admin") {
            return res.status(403).json({ message: "Akses ditolak." });
        }
        next();
    },
};