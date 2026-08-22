# Integrasi Printer Bluetooth Epson RPPO2

## File yang Ditambahkan

1. **PrinterService.js** - Service untuk handle koneksi dan perintah printer
2. **PrinterSettings.jsx** - Komponen UI untuk manage printer connection

## Perubahan pada App.jsx

### 1. Import PrinterService dan PrinterSettings

Tambahkan di bagian atas App.jsx (setelah imports yang sudah ada):

```javascript
import PrinterService from "./PrinterService";
import { PrinterSettings } from "./PrinterSettings";
```

### 2. Tambahkan State untuk Printer Settings

Cari bagian `const [settings, setSettings] = useState` dan pastikan printerDevice ada:

```javascript
const [settings, setSettings] = useState({
  storeName: "KASIR-PRO",
  address: "Bandung, Jawa Barat",
  cashier: "Admin",
  taxEnabled: true,
  taxRate: 10,
  printerDevice: null, // <- Tambahkan ini
});
```

### 3. Tambahkan State untuk Modal Settings Printer

Tambahkan state baru di dekat state lainnya:

```javascript
const [showPrinterSettings, setShowPrinterSettings] = useState(false);
```

### 4. Update handleCheckout untuk Print ke Printer

Cari function `const handleCheckout = async () => {` dan ubah bagian terakhirnya:

**SEBELUM:**
```javascript
const handleCheckout = async () => {
  // ... kode sebelumnya ...
  
  addToast("✅ Transaksi berhasil!");
  setShowReceipt(transaction);
  resetCart();
};
```

**SESUDAH:**
```javascript
const handleCheckout = async () => {
  // ... kode sebelumnya yang sama ...
  
  // Try print ke printer jika sudah connected
  if (settings.printerDevice) {
    try {
      const printerDeviceObj = JSON.parse(settings.printerDevice);
      if (printerDeviceObj.connected) {
        const printResult = await PrinterService.printReceipt(transaction, settings);
        if (printResult.success) {
          addToast("✅ Struk dicetak!", "success");
        } else {
          addToast("⚠️ Print gagal, tapi transaksi tersimpan", "warning");
        }
      }
    } catch (error) {
      console.error("Print error:", error);
    }
  }
  
  addToast("✅ Transaksi berhasil!");
  setShowReceipt(transaction);
  resetCart();
};
```

### 5. Update handleSettingsUpdate untuk Save Printer Settings

Cari function `const handleSettingsUpdate = (newSettings) => {` dan update:

```javascript
const handleSettingsUpdate = (newSettings) => {
  setSettings(newSettings);
  localStorage.setItem("kasirpro_settings", JSON.stringify(newSettings));
  addToast("✅ Pengaturan disimpan!");
};
```

### 6. Tambahkan Tombol di Settings Panel

Cari bagian dalam settings sheet di render return, cari section untuk pengaturan umum, tambahkan:

```javascript
{/* Printer Settings Button */}
<div className="m3-settings-section">
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
    <div>
      <h3 style={{ fontSize: "14px", fontWeight: "500", marginBottom: "4px" }}>🖨️ Printer Bluetooth</h3>
      <p style={{ fontSize: "12px", color: "var(--md-on-surface-variant)" }}>
        {settings.printerDevice ? `✅ Terhubung` : "❌ Tidak terhubung"}
      </p>
    </div>
    <button 
      className="btn btn-filled"
      onClick={() => setShowPrinterSettings(true)}
      style={{ padding: "8px 16px" }}
    >
      Atur
    </button>
  </div>
</div>
```

### 7. Tambahkan Modal di Bagian Akhir Return

Tambahkan sebelum `{/* ── Toasts ── */}`:

```javascript
{/* ── Printer Settings Modal ── */}
{showPrinterSettings && (
  <PrinterSettings
    onClose={() => setShowPrinterSettings(false)}
    settings={settings}
    onSettingsChange={handleSettingsUpdate}
    addToast={addToast}
  />
)}
```

### 8. Update tombol Cetak di Receipt Sheet

Cari bagian `<button className="btn btn-filled" onClick={()=>{window.print();addToast("Mencetak...");}}>🖨️ Cetak</button>`

Ubah menjadi:

```javascript
<button 
  className="btn btn-filled" 
  onClick={async () => {
    if (settings.printerDevice) {
      try {
        const result = await PrinterService.printReceipt(showReceipt, settings);
        if (result.success) {
          addToast("✅ Struk dicetak!");
        } else {
          addToast("❌ Error print: " + result.error, "error");
        }
      } catch (error) {
        addToast("❌ Error: " + error.message, "error");
      }
    } else {
      window.print();
      addToast("Mencetak ke browser...");
    }
  }}
>
  🖨️ Cetak
</button>
```

## Fitur

✅ Connect ke printer Bluetooth Epson RPPO2
✅ Auto print saat checkout (jika printer terkoneksi)
✅ Manual print dari receipt view
✅ Test print untuk testing koneksi
✅ Formatting receipt dengan ESC/POS commands
✅ Support alignment, font size, bold, line feed, cut paper
✅ Fallback ke browser print jika printer tidak terkoneksi

## Troubleshooting

### 1. "Device tidak ditemukan saat scanning"
- Pastikan printer sudah di-pair di Bluetooth settings
- Restart printer dan scan ulang
- Check apakah browser support Web Bluetooth API (Chrome, Edge, Opera)

### 2. "Error write" / "Printer tidak terhubung"
- Printer mungkin disconnect
- Coba test print dulu sebelum transaksi
- Re-connect printer

### 3. "Struk tidak keluar"
- Check paper di printer
- Pastikan printer dalam posisi online
- Coba test print dulu

### 4. Printer support lain
Untuk printer Epson lain atau brand lain:
- Update filter di `connect()` method di PrinterService.js
- Test dengan nama device printer Anda

### 5. Web Bluetooth API tidak available
- Gunakan browser berbasis Chromium (Chrome, Edge)
- Firefox dan Safari tidak support Web Bluetooth API
- Untuk mobile, gunakan web app (add to home screen)

## Testing

1. Buka app di Chrome/Chromium
2. Pergi ke Settings → Printer Bluetooth
3. Klik "Cari & Hubungkan Printer"
4. Pilih printer dari list
5. Klik "Test Print" untuk test
6. Lakukan transaksi dan printer akan auto print

## Notes

- Data dikirim dalam chunk 20 bytes dengan delay 50ms antar chunk (untuk stabilitas)
- Receipt format menggunakan standar ESC/POS
- Printer akan auto-cut paper setelah print
- Max retry connection bisa ditambah jika diperlukan
