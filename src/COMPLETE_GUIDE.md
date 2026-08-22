# 📖 Panduan Lengkap - Printer Bluetooth Epson RPPO2

## Daftar Isi
1. [File yang Disediakan](#file-yang-disediakan)
2. [Instalasi](#instalasi)
3. [Cara Kerja](#cara-kerja)
4. [API Reference](#api-reference)
5. [Customization](#customization)
6. [Production Deployment](#production-deployment)
7. [FAQ](#faq)

---

## File yang Disediakan

### 1. **PrinterService.js** (Service Core)
Service untuk mengelola koneksi dan komunikasi printer Bluetooth.

**Features:**
- Multi-UUID support untuk berbagai tipe printer
- Auto-reconnect saat disconnect
- Write queue untuk multiple writes
- Chunking otomatis (20 bytes per chunk)
- ESC/POS command builder
- Status monitoring

**Methods:**
```javascript
// Connect ke printer
await PrinterService.connect()

// Disconnect
await PrinterService.disconnect()

// Reconnect jika putus
await PrinterService.reconnect()

// Kirim data raw
await PrinterService.write(data)

// Kirim text
await PrinterService.printText(text)

// Print receipt
await PrinterService.printReceipt(transaction, settings)

// Test print
await PrinterService.testPrint()

// Get status
PrinterService.getStatus()

// Clear queue
PrinterService.clearQueue()
```

### 2. **PrinterSettings.jsx** (UI Component)
Komponen settings untuk manage printer connection.

**Features:**
- Connection scanner
- Status display dengan expandable info
- Test print button
- Disconnect button
- Support requirements checklist
- Troubleshooting tips

**Props:**
```javascript
<PrinterSettings
  onClose={() => {}}              // Callback saat close
  settings={settings}             // Current app settings
  onSettingsChange={fn}          // Callback saat setting berubah
  addToast={fn}                  // Callback untuk toast notifications
/>
```

### 3. **PrinterDebug.jsx** (Debug Console)
Console untuk debugging koneksi printer (optional).

**Features:**
- Real-time status monitor
- Console log capture
- Test print from debug
- Write queue monitor

**Usage:**
```javascript
import { PrinterDebugPanel, useDebugPanel } from "./PrinterDebug";

function App() {
  const { isOpen, setIsOpen } = useDebugPanel();
  
  return (
    <>
      <YourApp />
      <PrinterDebugPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

// Toggle dengan Ctrl+Shift+D
```

### 4. **App.jsx.new** (Updated App)
File App.jsx yang sudah terintegrasi printer.

**Changes:**
- Import PrinterService & PrinterSettings
- Add printerDevice state
- Update handleCheckout untuk print otomatis
- Update handleReceipt untuk manual print
- Add printer settings UI

---

## Instalasi

### Step 1: Copy File
```bash
# Copy ke src/
cp PrinterService.js src/
cp PrinterSettings.jsx src/
cp PrinterDebug.jsx src/        # Optional
cp App.jsx.new src/App.jsx      # Replace existing
```

Atau manual copy-paste ke editor.

### Step 2: Update App.jsx (Jika Manual)

**A. Tambah Imports**
```javascript
import PrinterService from "./PrinterService";
import { PrinterSettings } from "./PrinterSettings";
import { PrinterDebugPanel, useDebugPanel } from "./PrinterDebug"; // Optional
```

**B. Add State**
```javascript
const DEFAULT_SETTINGS = {
  // ... existing settings
  printerDevice: null,  // <-- Add this
};

const [showPrinterSettings, setShowPrinterSettings] = useState(false);
```

**C. Update handleCheckout**
```javascript
const handleCheckout = async () => {
  // ... existing code ...
  
  // Add: Auto print ke printer jika terkoneksi
  if (settings.printerDevice) {
    try {
      const printerDeviceObj = JSON.parse(settings.printerDevice);
      if (printerDeviceObj.connected) {
        const printResult = await PrinterService.printReceipt(trx, settings);
        if (printResult.success) {
          addToast("✅ Struk dicetak!", "success");
        } else {
          addToast("⚠️ Print gagal", "error");
        }
      }
    } catch (error) {
      console.error("Print error:", error);
    }
  }
  
  // ... rest of existing code ...
};
```

**D. Add Printer Settings UI**
Di settings panel, tambah:
```javascript
<div className="m3-settings-section">
  <div className="settings-section-title">🖨️ Printer Bluetooth</div>
  <div className="settings-row">
    <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%"}}>
      <div>
        <div className="slbl">Epson RPPO2</div>
        <div className="sval">
          {settings.printerDevice ? `✅ Connected` : "❌ Not connected"}
        </div>
      </div>
      <button className="btn btn-filled" onClick={() => setShowPrinterSettings(true)}>
        Atur
      </button>
    </div>
  </div>
</div>
```

**E. Add Modal di Return**
```javascript
{showPrinterSettings && (
  <PrinterSettings
    onClose={() => setShowPrinterSettings(false)}
    settings={settings}
    onSettingsChange={(newSettings) => {
      setSettings(newSettings);
      localStorage.setItem("kasir_settings", JSON.stringify(newSettings));
    }}
    addToast={addToast}
  />
)}

{/* Optional: Debug Console */}
{import.meta.env.DEV && (
  <PrinterDebugPanel isOpen={debugOpen} onClose={() => setDebugOpen(false)} />
)}
```

**F. Update Print Button**
```javascript
<button 
  className="btn btn-filled" 
  onClick={async () => {
    if (settings.printerDevice) {
      const result = await PrinterService.printReceipt(showReceipt, settings);
      if (result.success) {
        addToast("✅ Struk dicetak!");
      } else {
        addToast("❌ " + result.error, "error");
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

### Step 3: Run
```bash
npm run dev
```

---

## Cara Kerja

### Connection Flow

```
User click "Hubungkan Printer"
    ↓
Web Bluetooth API scan devices dengan filter
    ↓
User pilih printer dari list
    ↓
Connect ke GATT server
    ↓
Find service & characteristic
    ↓
Store device reference
    ↓
Status: Connected ✅
```

### Print Flow

```
User checkout transaksi
    ↓
handleCheckout() dipanggil
    ↓
Check: printer connected?
    ↓
YES → Call PrinterService.printReceipt()
    ↓
Initialize printer (ESC @)
    ↓
Send text, format, alignment commands
    ↓
Write data via Bluetooth (in chunks)
    ↓
Auto cut paper
    ↓
Struk keluar dari printer ✅
```

### Auto-Reconnect Flow

```
Write command → Bluetooth error (e.g., NetworkError)
    ↓
Catch error → Detect disconnect
    ↓
Auto-call reconnect()
    ↓
Try reconnect to saved device
    ↓
Retry write command
    ↓
OK → Continue ✅
FAIL → Show error message
```

---

## API Reference

### PrinterService

#### connect()
Scan dan connect ke printer.

```javascript
const result = await PrinterService.connect();
// Returns:
// { success: true, device: "RPPO2-1234" }
// { success: false, error: "User cancelled" }
```

#### disconnect()
Putuskan koneksi printer.

```javascript
const result = await PrinterService.disconnect();
// Returns: { success: true/false, error?: string }
```

#### reconnect()
Reconnect ke printer jika terputus (auto-called).

```javascript
const result = await PrinterService.reconnect();
```

#### write(data)
Kirim raw data ke printer.

```javascript
const result = await PrinterService.write(new Uint8Array([0x1b, 0x40]));
// Returns: { success: true/false, error?: string }
```

#### printText(text)
Print text dengan newline otomatis.

```javascript
await PrinterService.printText("Hello World");
```

#### printReceipt(transaction, settings)
Print receipt lengkap dari transaksi.

```javascript
const result = await PrinterService.printReceipt(
  { id, items, total, ... },  // transaction object
  { storeName, address, ... }  // app settings
);
// Returns: { success: true/false, error?: string }
```

#### testPrint()
Print test untuk cek koneksi.

```javascript
const result = await PrinterService.testPrint();
```

#### getStatus()
Get current connection status.

```javascript
const status = PrinterService.getStatus();
// Returns:
// {
//   isConnected: boolean,
//   device: string | null,
//   isWriting: boolean,
//   queueLength: number
// }
```

#### clearQueue()
Clear pending write queue (jika ada backlog).

```javascript
PrinterService.clearQueue();
```

### ESC/POS Commands

PrinterService support standar ESC/POS commands:

```javascript
// Initialize printer
await PrinterService.initialize();  // ESC @

// Set alignment: "left", "center", "right"
await PrinterService.setAlign("center");

// Set font size: width (1-4), height (1-4)
await PrinterService.setFontSize(2, 2);

// Bold on/off
await PrinterService.setBold(true);

// Line feed (newlines)
await PrinterService.lineFeed(3);

// Cut paper: "full" or "partial"
await PrinterService.cutPaper("full");
```

---

## Customization

### Custom Receipt Format

Edit `PrinterService.printReceipt()` method:

```javascript
async printReceipt(transaction, settings) {
  try {
    await this.initialize();
    
    // Customize di sini:
    await this.setAlign("center");
    await this.setFontSize(1, 1);
    await this.printText("CUSTOM HEADER");
    
    // ... rest of receipt ...
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### Custom Settings UI

Edit `PrinterSettings.jsx` return JSX:

```javascript
return (
  <div className="m3-overlay" ...>
    <div className="m3-sheet" ...>
      {/* Custom UI di sini */}
    </div>
  </div>
);
```

### Support Printer Lain

Edit filter di `PrinterService.js` line ~17:

```javascript
filters: [
  { namePrefix: "RPPO2" },
  { namePrefix: "TM-" },
  // Add custom printer:
  { namePrefix: "CUSTOM_NAME" },
  // Or use UUIDs:
  { services: ["custom-service-uuid"] },
],
```

### Change Chunk Size

Di `PrinterService.processWriteQueue()` line ~140:

```javascript
const chunkSize = 20;  // <-- Edit ini (default 20 bytes)
```

Rekomendasi: 20 bytes untuk stability. Max bisa 512 bytes tapi risiko packet loss.

### Change Write Delay

Di `PrinterService.processWriteQueue()` line ~155:

```javascript
await new Promise(res => setTimeout(res, 30)); // <-- Edit delay (ms)
```

Rekomendasi: 30ms untuk stability. Min 10ms, max 100ms.

---

## Production Deployment

### HTTPS Requirement

Web Bluetooth API hanya berfungsi di HTTPS (kecuali localhost).

**Deployment checklist:**
- [ ] Domain punya SSL certificate
- [ ] URL dimulai dengan `https://`
- [ ] Service Workers (jika PWA) juga HTTPS

### PWA Setup

Untuk PWA dengan offline support:

1. Install service worker
2. Add manifest.json dengan Bluetooth permissions
3. Build dengan `npm run build`

### Testing di Production

```bash
# Build untuk production
npm run build

# Preview local (HTTPS)
npm run preview

# Atau deploy ke Vercel/Netlify (auto HTTPS)
vercel deploy
```

### Monitoring

Add logging untuk production:

```javascript
// Di PrinterService.js, add logging:
console.log('📊 Print event:', {
  timestamp: new Date(),
  device: this.device?.name,
  status: this.isConnected,
  queueLength: this.writeQueue.length,
});
```

### Fallback

Jika printer tidak terkoneksi, app bisa fallback ke browser print:

```javascript
if (settings.printerDevice) {
  // Print ke printer
} else {
  // Fallback: print ke browser
  window.print();
}
```

---

## FAQ

### Q: Apakah iOS support?
**A:** Safari di iOS tidak support Web Bluetooth API. Gunakan Android atau desktop Chrome.

### Q: Berapa banyak struk bisa dicetak per hari?
**A:** Tidak ada limit dari software. Tergantung kapasitas printer (biasanya 10,000+ struk).

### Q: Bisa cetak barcode/QR code?
**A:** Ya, tapi perlu library tambahan untuk generate barcode. Saat ini support text only.

### Q: Printer disconnect sering, gimana?
**A:** 
- Check battery printer (charge jika perlu)
- Kurangi interference (jauh dari microwave, WiFi router)
- App punya auto-reconnect jadi biasanya bisa recovery otomatis

### Q: Multiple printer support?
**A:** Saat ini hanya 1 printer. Untuk multiple, perlu refactor state management.

### Q: Bisa custom header/footer?
**A:** Ya, edit `printReceipt()` method di PrinterService.js

### Q: Berapa lama koneksi Bluetooth awet?
**A:** Terus terhubung selama app open. Auto-reconnect jika putus.

### Q: Bagaimana dengan printer thermal lain (bukan Epson)?
**A:** Kemungkinan besar support ESC/POS commands. Edit filter dengan nama printer dan test.

### Q: Bisa offline (tanpa koneksi internet)?
**A:** Ya! Bluetooth printer bekerja tanpa internet. Hanya butuh Bluetooth.

### Q: Bagaimana security/privacy?
**A:** Bluetooth connection encrypted. Data tidak dikirim ke server, hanya ke printer local.

### Q: Bisa backup struk?
**A:** Ya, transaksi tersimpan di localStorage/Supabase. Bisa export ke PDF/Excel.

---

## Support & Issues

### Debug Mode
Tekan **Ctrl + Shift + D** untuk buka debug console.

### Check Browser Console
**F12 → Console** untuk lihat error detail.

### Test Offline
Disconnect WiFi, test Bluetooth printer - harus tetap berfungsi.

### Report Issue
Cek error message di toast/console, lihat QUICK_START.md troubleshooting section.

---

## Changelog

### v1.0 (August 2024)
- ✅ Epson RPPO2 support
- ✅ Web Bluetooth API implementation
- ✅ ESC/POS command set
- ✅ Auto-reconnect
- ✅ Write queue
- ✅ Debug console
- ✅ Settings UI
- ✅ Test print
- ✅ Receipt formatting

---

**Dokumentasi ini akan terus diupdate seiring dengan development.**

Last Updated: August 2024
Status: ✅ Production Ready
