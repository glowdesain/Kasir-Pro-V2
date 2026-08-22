# 🖨️ Setup Printer Bluetooth Epson RPPO2 - KasirPro

## File yang Diberikan

1. **PrinterService.js** - Service untuk koneksi dan kontrol printer
2. **PrinterSettings.jsx** - UI komponen untuk settings printer
3. **App.jsx.new** - File App.jsx yang sudah diintegrasikan
4. **PRINTER_INTEGRATION.md** - Dokumentasi lengkap perubahan
5. **SETUP_PRINTER.md** - File ini

## ⚡ Cara Install (3 Langkah)

### Langkah 1: Copy File

Copy 3 file ke folder `src/`:
```bash
cp PrinterService.js src/
cp PrinterSettings.jsx src/
cp App.jsx.new src/App.jsx
```

Atau manual:
- Copy **PrinterService.js** ke folder `src/`
- Copy **PrinterSettings.jsx** ke folder `src/`  
- Replace **App.jsx** dengan **App.jsx.new** (atau update manual sesuai PRINTER_INTEGRATION.md)

### Langkah 2: Install Dependencies (Optional)

Tidak perlu install package tambahan. App sudah menggunakan Web Bluetooth API bawaan browser.

### Langkah 3: Test di Browser

```bash
npm run dev
```

Buka di **Chrome/Chromium** (Firefox/Safari tidak support Web Bluetooth):
1. Pergi ke Settings (⚙️)
2. Scroll ke section "🖨️ Printer Bluetooth"
3. Klik tombol "Atur"
4. Klik "Cari & Hubungkan Printer"
5. Pilih printer dari list
6. Klik "Test Print" untuk test koneksi

## 📋 Fitur

✅ **Koneksi Bluetooth** - Scan dan connect ke printer RPPO2  
✅ **Auto Print** - Print otomatis saat checkout  
✅ **Manual Print** - Print dari receipt view  
✅ **Test Print** - Test koneksi printer  
✅ **Disconnect** - Putuskan koneksi dengan mudah  
✅ **Fallback** - Print ke browser jika printer tidak terkoneksi  

## 🔧 Printer Support

Teruji dengan:
- ✅ Epson RPPO2 (58mm Thermal)
- ✅ Epson TM-M30 / TM-M50
- ✅ Printer ESC/POS lainnya

Untuk printer lain, update filter di `PrinterService.js` line ~17:
```javascript
filters: [
  { namePrefix: "YOUR_PRINTER_NAME" },
  // tambahkan nama printer Anda
],
```

## ⚠️ Penting!

### Persyaratan Browser
- **Chrome/Chromium** (versi terbaru)
- **Edge** (versi baru)  
- **Opera** (versi baru)
- ❌ **Firefox & Safari** - Tidak support Web Bluetooth API

### Persyaratan Hardware
- Printer Bluetooth Epson (series RPPO2, TM, FP)
- Printer sudah **di-pair** di Bluetooth settings OS
- Printer dalam jarak Bluetooth (~10 meter)
- Battery printer penuh

### CORS & HTTPS
- Hanya bisa dijalankan di **localhost** atau **HTTPS**
- Web Bluetooth API tidak berfungsi di HTTP (kecuali localhost)

## 🐛 Troubleshooting

### 1. "Tidak ada device ditemukan saat scan"
```
✓ Pastikan printer sudah di-pair di Bluetooth settings
✓ Restart printer dan coba scan lagi
✓ Check printer namanya (harus ada di filter)
✓ Gunakan Chrome terbaru
```

### 2. "Printer disconnect setelah beberapa jam"
```
✓ Hubungkan ulang printer
✓ Restart browser
✓ Check battery printer
✓ Ganti charger printer jika perlu
```

### 3. "Struk tidak keluar"
```
✓ Check paper di printer (harus ada)
✓ Pastikan printer dalam status online
✓ Cek indikator lampu printer
✓ Coba test print terlebih dahulu
```

### 4. "Chrome di mobile tidak mau connect"
```
✓ Update Chrome ke versi terbaru
✓ Reset Bluetooth Android
✓ Add app ke home screen (PWA mode)
✓ Coba browser lain seperti Edge
```

### 5. "Struk ke-print 2 kali"
```
✓ Ini normal di test print
✓ Jika real transaksi, check auto-print di receipt
✓ Bisa disable auto-print di handleCheckout jika perlu
```

## 📝 Format Struk

Struk akan dicetak dengan format:
```
        KASIR-PRO
  Bandung, Jawa Barat
================================
No: TRX-20240618-001
Tgl: 18 Jun 2024 08:30:00
Kasir: Budi
================================

Nasi Goreng Spesial
  2x Rp25.000 = Rp50.000
Mie Ayam Bakso
  1x Rp18.000 = Rp18.000

================================
Subtotal: Rp68.000
Diskon: -Rp6.800
Pajak: Rp6.120
     TOTAL: Rp67.320
================================
Metode: CASH
Bayar: Rp70.000
Kembalian: Rp2.680

================================
        Terima kasih!
       Powered by Kasir-Pro
```

## 🚀 Advanced Usage

### Auto-Connect di Startup
Edit `useEffect` di App.jsx untuk auto-connect saat load:
```javascript
useEffect(() => {
  if (settings.printerDevice) {
    PrinterService.connect();
  }
}, []);
```

### Custom Receipt Format
Edit `PrinterService.printReceipt()` method untuk customize format struk.

### Send to Different Printer
Printer bisa di-switch di Settings tanpa restart app.

## 📞 Support

Untuk issue atau pertanyaan:
1. Check troubleshooting section di atas
2. Lihat console browser (F12 → Console) untuk error messages
3. Test dengan printer lain jika ada untuk validasi hardware

## 📚 Referensi

- [Web Bluetooth API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API)
- [ESC/POS Command Set](https://www.epson.co.jp/Products/escpos/)
- [Thermal Printer Docs](https://www.datecs.com/en/products/printers)

---

**Status**: ✅ Siap Produksi  
**Versi**: 1.0  
**Support**: Printer ESC/POS Bluetooth  
**Last Updated**: August 2024
