require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

const authRoutes = require('./routes/authRoutes');
const pelangganRoutes = require('./routes/pelangganRoutes');
const penggunaanRoutes = require('./routes/penggunaanRoutes');
const tagihanRoutes = require('./routes/tagihanRoutes');
const pembayaranRoutes = require('./routes/pembayaranRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const backupRoutes = require('./routes/backupRoutes');
const reportsRoutes = require('./routes/reportsRoutes');
const tarifRoutes = require('./routes/tarifRoutes');

app.use(express.json());
app.use(cors({
  origin: 'https://pdambumdes-production.up.railway.app'
}));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/pelanggan', pelangganRoutes);
app.use('/api/penggunaan', penggunaanRoutes);
app.use('/api/tagihan', tagihanRoutes);
app.use('/api/pembayaran', pembayaranRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/backup", backupRoutes);
app.use("/api/tarif_penggunaan", tarifRoutes);

app.use('/uploads', express.static('uploads'));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});