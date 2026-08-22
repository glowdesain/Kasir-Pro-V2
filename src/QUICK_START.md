# 🚀 Quick Start - Printer Bluetooth Epson RPPO2

## Instalasi Cepat (5 Menit)

### Step 1: Copy File (1 Menit)
Salin ke folder `src/`:
```bash
cp PrinterService.js src/
cp PrinterSettings.jsx src/
cp PrinterDebug.jsx src/
cp App.jsx.new src/App.jsx
```

### Step 2: Jalankan Aplikasi
```bash
npm run dev
```

### Step 3: Test di Browser
1. Buka http://localhost:5173 di **Chrome**
2. Pergi ke **Settings** (⚙️)
3. Scroll ke **"🖨️ Printer Bluetooth"**
4. Klik **"Cari & Hubungkan Printer"**
5. Pilih printer dari list
6. Klik **"Test Print"** - struk harus keluar!

---

## Troubleshooting Cepat

### ❌ "Printer tidak ditemukan saat scan"

**✓ Solusi 1 - Pastikan Printer Ter-Pair**
```
Windows:
1. Settings → Bluetooth & devices
2. Pastikan printer sudah ada di list
3. Klik printer → Connected

Android:
1. Settings → Bluetooth
2. Pastikan printer ter-pair
3. Jangan perlu di-connect, cukup ter-pair

macOS:
1. System Preferences → Bluetooth
2. Pastikan printer ter-pair
```

**✓ Solusi 2 - Restart Printer & Browser**
- Matikan printer, tunggu 30 detik
- Hidupkan lagi
- Restart browser

**✓ Solusi 3 - Check Nama Printer**
- Di Bluetooth settings, cek nama device printer
- Harus mengandung: RPPO2, TM-, FP-, T88, M30, M50, Printer, atau ESC
- Jika nama berbeda, edit filter di PrinterService.js line 17

### ❌ "Browser show error 'Bluetooth tidak tersedia'"

**✓ Gunakan Browser Supported:**
- ✅ Chrome (terbaru)
- ✅ Edge (terbaru)  
- ✅ Opera (terbaru)
- ❌ Firefox - tidak support
- ❌ Safari - tidak support

**✓ Untuk Mobile:**
- Download Chrome di Android
- Buka PWA app (Add to home screen)

### ❌ "Test print tidak keluar, printer offline"

**✓ Cek Hardware:**
1. Printer LED hijau (power on)
2. Lampu biru berkedip (Bluetooth ready)
3. Ada paper di printer
4. Printer tidak dalam kondisi error/jam

**✓ Cek Koneksi:**
1. Printer masih ter-pair di Bluetooth settings
2. Printer dalam jarak ~10 meter
3. Tidak ada interference (microwave, WiFi kuat)

**✓ Soft Reset Printer:**
1. Matikan printer
2. Tahan tombol power 5 detik sambil menyala → reset
3. Tunggu 1 menit
4. Coba connect lagi

### ❌ "Struk ke-print 2x atau error printer"

**✓ Check:**
- Jangan double-click tombol cetak
- Check paper tidak tersumbat
- Coba test print dulu sebelum transaksi

**✓ Reset Printer:**
- Power off printer 30 detik
- Power on
- Coba print lagi

### ❌ "Koneksi tiba-tiba putus saat transaksi"

**✓ Cek Battery Printer:**
- Battery printer mungkin habis
- Charge printer ~2-3 jam

**✓ Reduce Interference:**
- Jauhkan dari microwave
- Jauhkan dari WiFi router kuat

**✓ Auto-Reconnect:**
- Aplikasi sudah punya auto-reconnect
- Coba transaksi lagi, biasanya berhasil

---

## Testing Checklist

- [ ] Chrome sudah install (terbaru)
- [ ] Printer sudah ter-pair di Bluetooth
- [ ] Printer punya paper
- [ ] Printer battery penuh
- [ ] Printer masih dalam jarak 10 meter
- [ ] Aplikasi sudah di-copy
- [ ] `npm run dev` sudah jalan
- [ ] Bisa connect ke printer
- [ ] Test print berhasil
- [ ] Struk keluar dengan format benar

---

## Debugging Mode (Optional)

Untuk developers yang ingin debug detail:

### Enable Debug Console
Ketika app jalan, tekan: **Ctrl + Shift + D**

Akan muncul debug panel di bawah kanan yang show:
- Real-time connection status
- Console logs
- Test print button
- Write queue info

### Check Console Errors
Buka DevTools: **F12 → Console**

Lihat error/warning messages untuk debug lebih detail.

---

## File Structure

```
src/
├── App.jsx                 (sudah terintegrasi printer)
├── PrinterService.js       (service Bluetooth)
├── PrinterSettings.jsx     (UI settings)
└── PrinterDebug.jsx        (debug console)
```

---

## Format Struk yang Akan Dicetak

```
         KASIR-PRO
   Bandung, Jawa Barat
============================
No: TRX-20240823-001
Tgl: 23 Aug 2024 14:30:00
Kasir: Admin
============================

Nasi Goreng Spesial
  2x Rp25.000 = Rp50.000
Es Teh Manis
  2x Rp5.000 = Rp10.000

============================
Subtotal: Rp60.000
Diskon: -Rp6.000
Pajak: Rp6.000
    TOTAL: Rp60.000
============================
Metode: CASH
Bayar: Rp70.000
Kembalian: Rp10.000

============================
      Terima kasih!
     Powered by Kasir-Pro
```

---

## Performance Notes

- **Chunk size:** 20 bytes per Bluetooth write
- **Write delay:** 30ms antar chunk (untuk stabilitas)
- **Auto reconnect:** Jika disconnect, auto-retry
- **Write queue:** Support multiple writes secara berurutan

---

## Support Printer Lain

Untuk printer lain selain Epson, edit **PrinterService.js** line ~17:

```javascript
filters: [
  { namePrefix: "NAMA_PRINTER_ANDA" },
  // Tambah nama printer lain di sini
],
```

Contoh:
- Brother printer: `{ namePrefix: "QL-" }`
- Zebra printer: `{ namePrefix: "Zebra" }`
- Generic: `{ namePrefix: "Printer" }`

---

## Next Steps

1. ✅ Setup berhasil
2. Lanjut ke production deployment
3. Backup struk ke cloud (Google Drive, Supabase)
4. Export transaksi ke Excel/PDF

---

**Last Updated:** August 2024  
**Status:** ✅ Production Ready  
**Support:** Epson RPPO2, TM-Series, ESC/POS Compatible
