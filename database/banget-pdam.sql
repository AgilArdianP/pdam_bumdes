-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 21, 2025 at 10:28 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `banget-pdam`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`id`, `username`, `password`) VALUES
(1, 'admin', '$2b$10$GiQNxg4obAmYKL1Aadq5G.DeY6s6LDXbOnVPAOLa46J59NfTR7qE2'),
(2, 'admin2', '$2b$10$Fywko1ilFbkG79jHg/VqquXUM650oc/Hic9gZv3IhMQkovIf9oKlu');

-- --------------------------------------------------------

--
-- Table structure for table `pelanggan`
--

CREATE TABLE `pelanggan` (
  `id` int(11) NOT NULL,
  `nama` varchar(255) NOT NULL,
  `alamat` text NOT NULL,
  `jenis_pelayanan` enum('Reguler','Subsidi') NOT NULL,
  `keterangan` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pelanggan`
--

INSERT INTO `pelanggan` (`id`, `nama`, `alamat`, `jenis_pelayanan`, `keterangan`) VALUES
(2, 'Wisnu Ardyansah', 'Jl. Citandui No. 5, Desa Karangsono', 'Reguler', 'Pelanggan baru'),
(3, 'Sori', 'Jl. Yos Sudarso No. 5, Desa Tirak', 'Subsidi', 'Pelanggan baru'),
(5, 'Glendoh', 'Ds.Banget', 'Reguler', 'Ini adalah percobaan'),
(6, 'Tio', 'Ds.Ngadipahit', 'Subsidi', 'Mencoba'),
(8, 'Iyan', 'Ds.Banget', 'Reguler', ''),
(9, 'Sofi', 'Ds.Banget', 'Subsidi', 'Pelanggan baru');

-- --------------------------------------------------------

--
-- Table structure for table `pembayaran`
--

CREATE TABLE `pembayaran` (
  `id` int(11) NOT NULL,
  `penggunaan_id` int(11) NOT NULL,
  `tanggal_pembayaran` date NOT NULL,
  `jumlah_pembayaran` decimal(10,2) NOT NULL,
  `metode_pembayaran` varchar(50) DEFAULT NULL,
  `keterangan` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pembayaran`
--

INSERT INTO `pembayaran` (`id`, `penggunaan_id`, `tanggal_pembayaran`, `jumlah_pembayaran`, `metode_pembayaran`, `keterangan`) VALUES
(1, 1, '2023-10-30', 40000.00, 'Transfer', 'Pembayaran pertama'),
(2, 2, '2023-10-30', 40000.00, 'Transfer', 'Pembayaran pertama'),
(3, 3, '2025-04-18', 100000.00, 'Cash', 'hai'),
(4, 8, '2025-04-18', 50000.00, 'Cash', 'lunas'),
(5, 7, '2025-04-18', 40000.00, 'Cash', 'lunassss'),
(6, 6, '2025-04-18', 50000.00, 'Transfer Bank', 'oke');

-- --------------------------------------------------------

--
-- Table structure for table `penggunaan`
--

CREATE TABLE `penggunaan` (
  `id` int(11) NOT NULL,
  `pelanggan_id` int(11) NOT NULL,
  `jumlah_penggunaan` decimal(10,2) NOT NULL,
  `tanggal` date NOT NULL,
  `foto` varchar(255) DEFAULT NULL,
  `total_tagihan` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `penggunaan`
--

INSERT INTO `penggunaan` (`id`, `pelanggan_id`, `jumlah_penggunaan`, `tanggal`, `foto`, `total_tagihan`) VALUES
(1, 2, 10.00, '2023-10-25', '1744902914349.png', 30000.00),
(2, 3, 10.00, '2023-10-25', '1744902938427.png', 40000.00),
(3, 2, 10.00, '2025-04-17', '1744908181669.jpg', 30000.00),
(4, 3, 20.00, '2025-04-17', '1744908962153.jpg', 60000.00),
(5, 3, 20.00, '2025-04-17', '1744908966374.jpg', 60000.00),
(6, 5, 10.00, '2025-04-17', '1744910598510.jpg', 40000.00),
(7, 6, 10.00, '2025-04-17', '1744921916200.jpg', 30000.00),
(8, 3, 13.56, '2025-04-17', '1744921988405.jpg', 40680.00),
(9, 2, 15.00, '2025-04-18', '1744952489730.jpg', 60000.00);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `pelanggan`
--
ALTER TABLE `pelanggan`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `pembayaran`
--
ALTER TABLE `pembayaran`
  ADD PRIMARY KEY (`id`),
  ADD KEY `penggunaan_id` (`penggunaan_id`);

--
-- Indexes for table `penggunaan`
--
ALTER TABLE `penggunaan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pelanggan_id` (`pelanggan_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `pelanggan`
--
ALTER TABLE `pelanggan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `pembayaran`
--
ALTER TABLE `pembayaran`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `penggunaan`
--
ALTER TABLE `penggunaan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `pembayaran`
--
ALTER TABLE `pembayaran`
  ADD CONSTRAINT `pembayaran_ibfk_1` FOREIGN KEY (`penggunaan_id`) REFERENCES `penggunaan` (`id`);

--
-- Constraints for table `penggunaan`
--
ALTER TABLE `penggunaan`
  ADD CONSTRAINT `penggunaan_ibfk_1` FOREIGN KEY (`pelanggan_id`) REFERENCES `pelanggan` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
