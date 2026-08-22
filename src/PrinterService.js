/**
 * Printer Service - Epson RPPO2 Bluetooth
 * ESC/POS Command Implementation
 * Support: Epson RPPO2, TM-Series, FP-Series, etc.
 */

class PrinterService {
  constructor() {
    this.device = null;
    this.characteristic = null;
    this.isConnected = false;
    this.isWriting = false;
    this.writeQueue = [];
    
    // UUIDs untuk berbagai tipe printer
    this.PRINTER_SERVICES = [
      "000018f0-0000-1000-8000-00805f9b34fb", // Epson & most thermal
      "0000180a-0000-1000-8000-00805f9b34fb", // Device info
      "0000ffe0-0000-1000-8000-00805f9b34fb", // Nordic UART
    ];
    
    this.PRINTER_CHARACTERISTICS = [
      "00002af1-0000-1000-8000-00805f9b34fb", // Epson standard
      "0000ffe1-0000-1000-8000-00805f9b34fb", // Nordic TX
      "0000ffe9-0000-1000-8000-00805f9b34fb", // Generic write
    ];
  }

  /**
   * Scan dan connect ke printer Bluetooth (dengan timeout & better error handling)
   */
  async connect(timeoutMs = 30000) {
    try {
      if (!navigator.bluetooth) {
        throw new Error("Web Bluetooth API tidak tersedia. Gunakan Chrome, Edge, atau Opera (terbaru). iOS tidak support.");
      }

      console.log("🔍 Memulai Bluetooth device scan...");

      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("SCAN_TIMEOUT")), timeoutMs);
      });

      // Create scan promise
      const scanPromise = (async () => {
        this.device = await navigator.bluetooth.requestDevice({
          filters: [
            { namePrefix: "RPPO2" },
            { namePrefix: "TM-" },
            { namePrefix: "FP-" },
            { namePrefix: "T88" },
            { namePrefix: "M30" },
            { namePrefix: "M50" },
            { namePrefix: "Printer" },
            { namePrefix: "ESC" },
          ],
          optionalServices: this.PRINTER_SERVICES,
          timeout: timeoutMs,
        });

        return this.device;
      })();

      // Race between scan dan timeout
      this.device = await Promise.race([scanPromise, timeoutPromise]);

      console.log("✅ Device dipilih:", this.device.name);
      this.device.addEventListener("gattserverdisconnected", () => this.onDisconnected());

      // Connect ke GATT server dengan retry
      let server = null;
      let retries = 3;
      
      while (!server && retries > 0) {
        try {
          console.log("🔌 Connect ke GATT server... (retry", 4 - retries, "/3)");
          server = await this.device.gatt.connect();
          console.log("✅ GATT server connected");
        } catch (error) {
          retries--;
          if (retries > 0) {
            await new Promise(r => setTimeout(r, 1000));
          } else {
            throw error;
          }
        }
      }

      if (!server) {
        throw new Error("Tidak bisa connect ke GATT server setelah 3x retry");
      }

      // Try find service dan characteristic
      let characteristic = null;

      for (const serviceUUID of this.PRINTER_SERVICES) {
        try {
          const service = await server.getPrimaryService(serviceUUID);
          console.log("✅ Service found:", serviceUUID);
          
          for (const charUUID of this.PRINTER_CHARACTERISTICS) {
            try {
              characteristic = await service.getCharacteristic(charUUID);
              console.log("✅ Characteristic found:", charUUID);
              this.characteristic = characteristic;
              this.isConnected = true;
              
              console.log("✅ Printer berhasil terhubung:", this.device.name);
              return { success: true, device: this.device.name, status: "Terhubung" };
            } catch (e) {
              // Try next characteristic
            }
          }
        } catch (e) {
          // Try next service
        }
      }

      throw new Error("Characteristic tidak ditemukan. Printer mungkin tidak kompatibel atau belum ter-pair dengan benar.");
    } catch (error) {
      this.isConnected = false;
      console.error("❌ Connect error:", error);
      
      // Parse error
      if (error.message === "SCAN_TIMEOUT") {
        return { 
          success: false, 
          error: "Scanning timeout (30 detik). Printer tidak ditemukan. Coba: 1) Restart printer 2) Pastikan ter-pair di Bluetooth 3) Printer dalam jarak 10m" 
        };
      } else if (error.name === "NotFoundError") {
        return { 
          success: false, 
          error: "Printer tidak ditemukan. Pastikan sudah di-pair di Bluetooth settings dan dalam jarak 10 meter." 
        };
      } else if (error.message.includes("User cancelled")) {
        return { success: false, error: "Pembatalan pemilihan device." };
      } else if (error.message.includes("Characteristic tidak ditemukan")) {
        return { 
          success: false, 
          error: "Printer tidak compatible. Device ini bukan printer thermal. Coba printer lain." 
        };
      }
      
      return { success: false, error: error.message || "Koneksi printer gagal." };
    }
  }

  /**
   * Event handler saat printer disconnect
   */
  onDisconnected() {
    console.log("⚠️ Printer disconnected");
    this.isConnected = false;
    this.device = null;
    this.characteristic = null;
  }

  /**
   * Disconnect dari printer
   */
  async disconnect() {
    try {
      if (this.device?.gatt?.connected) {
        this.device.removeEventListener("gattserverdisconnected", () => this.onDisconnected());
        await this.device.gatt.disconnect();
      }
      this.isConnected = false;
      this.device = null;
      this.characteristic = null;
      console.log("✅ Printer disconnected");
      return { success: true };
    } catch (error) {
      console.error("❌ Error disconnect:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Reconnect ke printer jika terputus
   */
  async reconnect() {
    if (this.isConnected) return { success: true };
    
    try {
      if (!this.device) {
        return { success: false, error: "Device tidak tersimpan. Connect ulang." };
      }

      console.log("🔄 Reconnecting...");
      const server = await this.device.gatt.connect();
      
      for (const serviceUUID of this.PRINTER_SERVICES) {
        try {
          const service = await server.getPrimaryService(serviceUUID);
          for (const charUUID of this.PRINTER_CHARACTERISTICS) {
            try {
              this.characteristic = await service.getCharacteristic(charUUID);
              this.isConnected = true;
              console.log("✅ Reconnected");
              return { success: true };
            } catch (e) {}
          }
        } catch (e) {}
      }
      
      throw new Error("Tidak bisa reconnect ke printer");
    } catch (error) {
      console.error("❌ Reconnect failed:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Kirim data ke printer dengan queue
   */
  async write(data) {
    if (!data || data.length === 0) return { success: true };

    // Queue write jika sedang ada write sebelumnya
    return new Promise((resolve) => {
      this.writeQueue.push({ data, resolve });
      if (!this.isWriting) {
        this.processWriteQueue();
      }
    });
  }

  /**
   * Process write queue
   */
  async processWriteQueue() {
    if (this.isWriting || this.writeQueue.length === 0) return;

    this.isWriting = true;
    
    while (this.writeQueue.length > 0) {
      const { data, resolve } = this.writeQueue.shift();

      try {
        if (!this.isConnected || !this.characteristic) {
          // Try reconnect
          const reconnectResult = await this.reconnect();
          if (!reconnectResult.success) {
            resolve({ success: false, error: "Printer tidak terhubung" });
            continue;
          }
        }

        // Split data jika terlalu besar (limit Bluetooth ~512 bytes per write, tapi aman dengan 20 bytes chunks)
        const chunkSize = 20;
        for (let i = 0; i < data.length; i += chunkSize) {
          const chunk = data.slice(i, i + chunkSize);
          try {
            await this.characteristic.writeValue(chunk);
            await new Promise(res => setTimeout(res, 30)); // Delay antar chunk
          } catch (writeError) {
            console.error("❌ Write chunk error:", writeError);
            // Coba reconnect dan retry
            if (writeError.name === "NetworkError") {
              const reconnectResult = await this.reconnect();
              if (reconnectResult.success) {
                await this.characteristic.writeValue(chunk);
              } else {
                throw writeError;
              }
            } else {
              throw writeError;
            }
          }
        }
        
        resolve({ success: true });
      } catch (error) {
        console.error("❌ Error write:", error);
        resolve({ success: false, error: error.message });
      }
    }
    
    this.isWriting = false;
  }

  /**
   * ESC/POS Command: Initialize printer
   */
  async initialize() {
    const cmd = new Uint8Array([0x1b, 0x40]); // ESC @
    return await this.write(cmd);
  }

  /**
   * ESC/POS Command: Set alignment
   * align: "left" (0x00), "center" (0x01), "right" (0x02)
   */
  async setAlign(align = "left") {
    const alignMap = { left: 0x00, center: 0x01, right: 0x02 };
    const cmd = new Uint8Array([0x1b, 0x61, alignMap[align] || 0x00]);
    return await this.write(cmd);
  }

  /**
   * ESC/POS Command: Set font size
   * width: 1-4, height: 1-4
   */
  async setFontSize(width = 1, height = 1) {
    const size = (width - 1) + ((height - 1) << 4);
    const cmd = new Uint8Array([0x1d, 0x21, size]);
    return await this.write(cmd);
  }

  /**
   * ESC/POS Command: Bold on/off
   */
  async setBold(bold = true) {
    const cmd = new Uint8Array([0x1b, 0x45, bold ? 0x01 : 0x00]);
    return await this.write(cmd);
  }

  /**
   * ESC/POS Command: Print text
   */
  async printText(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text + "\n");
    return await this.write(data);
  }

  /**
   * ESC/POS Command: Line feed
   */
  async lineFeed(lines = 1) {
    const cmd = new Uint8Array([0x0a].repeat(lines));
    return await this.write(cmd);
  }

  /**
   * ESC/POS Command: Cut paper
   * mode: "full" (0x00), "partial" (0x01)
   */
  async cutPaper(mode = "full") {
    const modeVal = mode === "partial" ? 0x01 : 0x00;
    const cmd = new Uint8Array([0x1d, 0x56, modeVal]);
    return await this.write(cmd);
  }

  /**
   * Print receipt (main function)
   */
  async printReceipt(transaction, settings) {
    try {
      await this.initialize();
      await this.lineFeed(1);

      // Header
      await this.setAlign("center");
      await this.setFontSize(2, 2);
      await this.setBold(true);
      await this.printText(settings.storeName || "KASIR-PRO");
      await this.setBold(false);
      await this.setFontSize(1, 1);
      await this.printText(settings.address || "");
      await this.printText("================================");

      // Transaction info
      await this.setAlign("left");
      await this.printText(`No: ${transaction.id}`);
      await this.printText(`Tgl: ${new Date(transaction.date).toLocaleString("id-ID")}`);
      await this.printText(`Kasir: ${transaction.cashier || settings.cashier || "-"}`);
      await this.printText("================================");

      // Items
      await this.printText("");
      for (const item of transaction.items) {
        const qty = item.qty;
        const price = item.price;
        const total = qty * price;
        const name = item.name.substring(0, 20);
        const priceStr = this.formatRp(price);
        const totalStr = this.formatRp(total);
        
        await this.printText(`${name}`);
        await this.printText(`  ${qty}x ${priceStr} = ${totalStr}`);
      }

      await this.printText("================================");

      // Totals
      await this.setAlign("right");
      await this.printText(`Subtotal: ${this.formatRp(transaction.subtotal)}`);
      
      if (transaction.discount > 0) {
        await this.printText(`Diskon: -${this.formatRp(transaction.discount)}`);
      }
      
      if (transaction.tax > 0) {
        await this.printText(`Pajak: ${this.formatRp(transaction.tax)}`);
      }

      await this.setFontSize(1, 2);
      await this.setBold(true);
      await this.printText(`TOTAL: ${this.formatRp(transaction.total)}`);
      await this.setBold(false);
      await this.setFontSize(1, 1);

      // Payment
      await this.setAlign("left");
      await this.printText("================================");
      await this.printText(`Metode: ${transaction.payment.toUpperCase()}`);
      await this.printText(`Bayar: ${this.formatRp(transaction.cashPaid)}`);
      
      if (transaction.change > 0) {
        await this.printText(`Kembalian: ${this.formatRp(transaction.change)}`);
      }

      if (transaction.note) {
        await this.printText("================================");
        await this.printText(`Catatan: ${transaction.note}`);
      }

      // Footer
      await this.printText("================================");
      await this.setAlign("center");
      await this.printText("Terima kasih!");
      await this.printText("Powered by Kasir-Pro");
      
      // Cut paper
      await this.lineFeed(2);
      await this.cutPaper("full");

      return { success: true };
    } catch (error) {
      console.error("❌ Error print receipt:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Format Rp
   */
  formatRp(amount) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * Test print (untuk testing koneksi)
   */
  async testPrint() {
    try {
      if (!this.isConnected) {
        return { success: false, error: "Printer belum terhubung" };
      }

      console.log("🧪 Starting test print...");
      
      await this.initialize();
      await this.setAlign("center");
      await this.setFontSize(1, 1);
      await this.setBold(true);
      await this.printText("TEST PRINTER");
      await this.setBold(false);
      await this.printText("Koneksi Berhasil!");
      await this.printText(`${new Date().toLocaleString("id-ID")}`);
      await this.lineFeed(2);
      await this.cutPaper("partial");
      
      console.log("✅ Test print berhasil!");
      return { success: true };
    } catch (error) {
      console.error("❌ Test print error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get status printer connection
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      device: this.device?.name || null,
      isWriting: this.isWriting,
      queueLength: this.writeQueue.length,
    };
  }

  /**
   * Clear write queue
   */
  clearQueue() {
    this.writeQueue = [];
  }
}

export default new PrinterService();
