# ✅ Checklist Implementasi Printer Bluetooth

## Phase 1: Setup (Today - 30 minutes)

### Step 1.1: Copy File (5 min)
- [ ] Copy `PrinterService.js` → `src/`
- [ ] Copy `PrinterSettings.jsx` → `src/`
- [ ] Copy `App.jsx.new` → `src/App.jsx` (replace existing)
- [ ] Copy `PrinterDebug.jsx` → `src/` (optional)

### Step 1.2: Prepare Hardware (5 min)
- [ ] Printer Epson RPPO2 power on
- [ ] Battery printer penuh
- [ ] Paper ada di printer
- [ ] Pair printer di Bluetooth settings OS
- [ ] Note printer name (RPPO2-XXXX)

### Step 1.3: Test Lokal (20 min)
- [ ] `npm run dev` di terminal
- [ ] Buka http://localhost:5173 di **Chrome**
- [ ] Settings (⚙️) → "🖨️ Printer Bluetooth"
- [ ] Click "Cari & Hubungkan Printer"
- [ ] Select printer dari list
- [ ] Click "Test Print" → struk keluar ✅
- [ ] Lakukan 1-2 transaksi fake
- [ ] Click "Cetak" di receipt → struk keluar ✅

---

## Phase 2: Testing (This Week)

### Step 2.1: Real Transaction (3-5 transaksi)
- [ ] Add 2-3 item ke cart
- [ ] Apply discount (jika ada)
- [ ] Pilih metode pembayaran
- [ ] Click "Proses" → auto print
- [ ] Check struk format OK
- [ ] Check struk amount benar
- [ ] Repeat 3-5 kali

### Step 2.2: Stress Test (10-20 transaksi)
- [ ] Buat 10-20 transaksi beruntun
- [ ] Disconnect printer di tengah jalan (test reconnect)
- [ ] Reconnect printer → harus berfungsi lagi
- [ ] Test print manual dari receipt
- [ ] Check semua struk tercetak

### Step 2.3: Edge Cases
- [ ] Transaksi tanpa discount
- [ ] Transaksi dengan pajak
- [ ] Transaksi cash besar (~Rp1juta)
- [ ] Struk re-print dari history
- [ ] Test di berbagai jam

---

## Phase 3: Documentation (Optional but Recommended)

### Step 3.1: Document Setup
- [ ] Foto printer & konfigurasi
- [ ] Catat printer model & MAC address
- [ ] Catat nama device Bluetooth
- [ ] Catat success/failure rate

### Step 3.2: Create Internal Docs
- [ ] Step-by-step setup untuk staff
- [ ] Troubleshooting guide untuk user
- [ ] Contact person jika printer error
- [ ] Backup printer (jika ada)

---

## Phase 4: Production Deployment (Next Week)

### Step 4.1: Environment Setup
- [ ] HTTPS domain siap (Vercel/Netlify)
- [ ] SSL certificate valid
- [ ] Build & deploy app
- [ ] Test HTTPS access

### Step 4.2: Production Test
- [ ] Access via https://yourdomain.com
- [ ] Test printer connect di production
- [ ] Test real transaction
- [ ] Check struk format still OK
- [ ] Monitor logs untuk error

### Step 4.3: Backup & Monitoring
- [ ] Setup localStorage/Supabase backup
- [ ] Export transaksi ke backup
- [ ] Monitor printer uptime
- [ ] Setup alert jika printer offline

### Step 4.4: Launch
- [ ] Announce ke user/staff
- [ ] Train staff cara pakai
- [ ] Monitor first 24 hours
- [ ] Collect feedback

---

## Phase 5: Ongoing Maintenance

### Monthly
- [ ] [ ] Check printer battery
- [ ] [ ] Check paper stock
- [ ] [ ] Test print 5-10 struk
- [ ] [ ] Review error logs

### Quarterly
- [ ] [ ] Clean printer head (jika perlu)
- [ ] [ ] Update browser di komputer
- [ ] [ ] Backup semua transaksi data
- [ ] [ ] Check app for updates

### Yearly
- [ ] [ ] Review printer warranty
- [ ] [ ] Plan printer replacement
- [ ] [ ] Audit semua transaksi data
- [ ] [ ] Plan next features

---

## Troubleshooting Quick Reference

### Printer tidak ditemukan saat scan
```
1. Pastikan printer ter-pair di Bluetooth settings ✓
2. Restart printer dan browser ✓
3. Cek nama printer di Bluetooth (harus RPPO2/TM-/FP-) ✓
4. Gunakan Chrome terbaru ✓
```

### Struk tidak keluar
```
1. Cek ada paper di printer ✓
2. Printer LED hijau (power on) ✓
3. Tidak ada kertas tersangkut ✓
4. Coba test print dari settings ✓
5. Power cycle printer (off 30s, on) ✓
```

### Koneksi sering putus
```
1. Charge printer battery ✓
2. Jauhkan dari microwave/WiFi kuat ✓
3. App auto-reconnect, coba lagi ✓
4. Restart printer ✓
```

### "Browser tidak support Bluetooth"
```
1. Gunakan Chrome/Edge/Opera ✓
2. Update ke versi terbaru ✓
3. Firefox dan Safari tidak support ✓
```

---

## File Reference

| File | Tujuan | Status |
|------|--------|--------|
| `PrinterService.js` | Bluetooth & ESC/POS service | ✅ Ready |
| `PrinterSettings.jsx` | UI settings printer | ✅ Ready |
| `PrinterDebug.jsx` | Debug console | ✅ Ready |
| `App.jsx.new` | Updated app with integration | ✅ Ready |
| `README.md` | Overview & index | ✅ Ready |
| `QUICK_START.md` | Setup guide cepat | ✅ Ready |
| `COMPLETE_GUIDE.md` | Technical reference | ✅ Ready |
| `PRINTER_INTEGRATION.md` | Integration detail | ✅ Ready |
| `SETUP_PRINTER.md` | Requirement & troubleshooting | ✅ Ready |

---

## Success Criteria

✅ **Phase 1 Success:**
- [ ] Setup selesai < 30 menit
- [ ] Test print berhasil
- [ ] Minimal 3 transaksi test berhasil

✅ **Phase 2 Success:**
- [ ] Minimal 10 transaksi real berhasil
- [ ] Struk format benar
- [ ] Reconnect bekerja
- [ ] Stress test 20 transaksi OK

✅ **Phase 3 Success:**
- [ ] Documentation lengkap
- [ ] Staff sudah train
- [ ] SOP siap

✅ **Phase 4 Success:**
- [ ] Production deployment berhasil
- [ ] No errors di first 24 hours
- [ ] User feedback positive

---

## Contact & Support

### Technical Issues
- Check: QUICK_START.md (instant solutions)
- Debug: Ctrl+Shift+D (debug console)
- Console: F12 → Console (error messages)

### Advanced Issues
- Read: COMPLETE_GUIDE.md (API reference)
- Read: PRINTER_INTEGRATION.md (implementation detail)

### Hardware Issues
- Contact: Printer manufacturer
- Backup: Punya printer backup?

---

## Timeline Summary

| Phase | Timeline | Status |
|-------|----------|--------|
| Phase 1: Setup | Today (30 min) | ⏳ Start here |
| Phase 2: Testing | This week (2-3 hours) | ⏳ After Phase 1 |
| Phase 3: Docs | This week (1 hour) | ⏳ Optional |
| Phase 4: Production | Next week (2-4 hours) | ⏳ After Phase 2 |
| Phase 5: Maintenance | Ongoing | ⏳ Monthly/Quarterly |

---

## Go Live Checklist

- [ ] Checklist Phase 1 complete
- [ ] Checklist Phase 2 complete
- [ ] Checklist Phase 3 complete (optional)
- [ ] Staff trained
- [ ] Printer backup ready (jika ada)
- [ ] Backup plan jika printer error
- [ ] Monitoring setup
- [ ] Support person assigned
- [ ] User notified
- [ ] ✅ **LAUNCH!**

---

**Print this checklist dan tick off setiap item saat selesai!**

**Estimated Total Time: 5 hours (1 day)**

Last Updated: August 2024  
Status: ✅ Ready to Deploy
