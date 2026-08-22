# KasirPro - Aplikasi Kasir POS

Aplikasi kasir lengkap berbasis React + Vite dengan penyimpanan localStorage.

## Fitur
- 🛒 Kasir / Point of Sale (POS)
- 📷 Scanner barcode (kamera & USB)
- 💳 5 metode pembayaran (Cash, Debit, Kredit, QRIS, Transfer)
- 🧾 Struk / Receipt dengan tombol cetak
- 📊 Dashboard laporan & statistik
- 📦 Manajemen produk (CRUD + SKU + Barcode)
- 🧾 Riwayat transaksi
- ⚙️ Pengaturan toko (nama, pajak, kasir, dll)
- 💾 Data tersimpan otomatis di localStorage (tidak hilang saat browser ditutup)

## Cara Install

### 1. Pastikan Node.js sudah terinstall
Download di https://nodejs.org (pilih versi LTS)

Cek instalasi:
```
node -v
npm -v
```

### 2. Install dependencies
Buka folder ini di terminal / Command Prompt, lalu jalankan:
```
npm install
```

### 3. Jalankan aplikasi
```
npm run dev
```

Buka browser → http://localhost:5173

### 4. Build untuk produksi (opsional)
```
npm run build
```
Hasil build ada di folder `dist/`

## Cara Pakai Scanner Barcode

### Scanner Kamera (HP/Webcam)
- Klik tombol 📷 di halaman Kasir atau Form Produk
- Izinkan akses kamera
- Arahkan barcode ke dalam kotak bidik
- **Syarat**: Chrome 88+, Edge 88+, atau Samsung Internet

### Scanner USB/Bluetooth
- Colokkan scanner USB/Bluetooth
- Klik pada field input barcode
- Scan produk → kode otomatis terisi
- Tekan Enter untuk konfirmasi

## Struktur File
```
kasir-pos/
├── src/
│   ├── App.jsx        ← Seluruh kode aplikasi kasir
│   ├── main.jsx       ← Entry point React
│   └── index.css      ← CSS reset minimal
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Koneksi ke Supabase (opsional)
Lihat dokumentasi di dalam App.jsx atau tanya ke Claude untuk panduan integrasi Supabase.
