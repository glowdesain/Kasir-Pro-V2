/**
 * Printer Service - Optimized for Eppos RPP02
 */
class PrinterService {
  constructor() {
    this.device = null;
    this.characteristic = null;
    this.isConnected = false;
    this.isWriting = false;
    this.writeQueue = [];
    
    // Susunan UUID diprioritaskan untuk Serial Port / Data Write RPP02
    this.PRINTER_SERVICES = [
      "0000ffe0-0000-1000-8000-00805f9b34fb", // Nordic / HM-10 / Transmit standar RPP
      "0000e701-0000-1000-8000-00805f9b34fb", // Eppos Specific Service
      "0000ff00-0000-1000-8000-00805f9b34fb", // Generic Thermal Service
      "49535343-fe7d-4ae5-8fa9-9fafd205e455", // ISSC Transparent
    ];
    
    this.PRINTER_CHARACTERISTICS = [
      "0000ffe1-0000-1000-8000-00805f9b34fb", // Write Characteristic standar RPP
      "0000e702-0000-1000-8000-00805f9b34fb", // Eppos Specific Write
      "0000ff01-0000-1000-8000-00805f9b34fb", // Generic Write
      "49535343-8841-43f4-a8d4-ecbe34729bb3", // ISSC TX
    ];
  }

  async connect(timeoutMs = 30000) {
    try {
      if (!navigator.bluetooth) {
        throw new Error("Web Bluetooth API tidak didukung di browser ini.");
      }

      console.log("🔍 Memulai Bluetooth scan...");
      this.device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: this.PRINTER_SERVICES,
      });

      console.log("✅ Device dipilih:", this.device.name || "Bluetooth Printer");
      this.device.addEventListener("gattserverdisconnected", () => this.onDisconnected());

      const server = await this.device.gatt.connect();
      console.log("✅ GATT server connected");

      // Cari service dan characteristic pengiriman data
      for (const serviceUUID of this.PRINTER_SERVICES) {
        try {
          const service = await server.getPrimaryService(serviceUUID);
          console.log("✅ Service ditemukan:", serviceUUID);
          
          for (const charUUID of this.PRINTER_CHARACTERISTICS) {
            try {
              const char = await service.getCharacteristic(charUUID);
              console.log("✅ Characteristic ditemukan:", charUUID);
              this.characteristic = char;
              this.isConnected = true;
              return { success: true, device: this.device.name || "Eppos RPP02" };
            } catch (e) {
              // Lanjut ke characteristic berikutnya
            }
          }
        } catch (e) {
          // Lanjut ke service berikutnya
        }
      }

      throw new Error("Tidak menemukan port pengiriman data yang cocok pada printer.");
    } catch (error) {
      this.isConnected = false;
      return { success: false, error: error.message };
    }
  }

  onDisconnected() {
    this.isConnected = false;
    this.device = null;
    this.characteristic = null;
  }

  async disconnect() {
    try {
      if (this.device?.gatt?.connected) {
        await this.device.gatt.disconnect();
      }
      this.onDisconnected();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async write(data) {
    if (!data || data.length === 0) return { success: true };

    return new Promise((resolve) => {
      this.writeQueue.push({ data, resolve });
      if (!this.isWriting) {
        this.processWriteQueue();
      }
    });
  }

  async processWriteQueue() {
    if (this.isWriting || this.writeQueue.length === 0) return;
    this.isWriting = true;

    while (this.writeQueue.length > 0) {
      const { data, resolve } = this.writeQueue.shift();

      try {
        if (!this.isConnected || !this.characteristic) {
          throw new Error("Printer terputus.");
        }

        // Perkecil Chunk Size ke 10 Bytes agar Buffer RPP02 tidak meluap
        const chunkSize = 10;
        for (let i = 0; i < data.length; i += chunkSize) {
          const chunk = data.slice(i, i + chunkSize);
          
          // Gunakan writeValueWithoutResponse jika didukung
          if (this.characteristic.writeValueWithoutResponse) {
            await this.characteristic.writeValueWithoutResponse(chunk);
          } else {
            await this.characteristic.writeValue(chunk);
          }
          
          // Delay 40ms antar chunk untuk memberi waktu hardware memproses
          await new Promise(res => setTimeout(res, 40));
        }
        
        resolve({ success: true });
      } catch (error) {
        console.error("❌ Error writing:", error);
        resolve({ success: false, error: error.message });
      }
    }
    
    this.isWriting = false;
  }

  async initialize() {
    return await this.write(new Uint8Array([0x1b, 0x40])); // ESC @
  }

  async setAlign(align = "left") {
    const alignMap = { left: 0x00, center: 0x01, right: 0x02 };
    return await this.write(new Uint8Array([0x1b, 0x61, alignMap[align] || 0x00]));
  }

  async setFontSize(width = 1, height = 1) {
    const size = ((width - 1) << 4) | (height - 1);
    return await this.write(new Uint8Array([0x1d, 0x21, size]));
  }

  async setBold(bold = true) {
    return await this.write(new Uint8Array([0x1b, 0x45, bold ? 0x01 : 0x00]));
  }

  // Menambahkan \r\n (CRLF) di akhir baris agar buffer langsung diprint oleh hardware
  async printText(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text + "\r\n");
    return await this.write(data);
  }

  async lineFeed(lines = 1) {
    const cmd = [];
    for (let i = 0; i < lines; i++) {
      cmd.push(0x0d, 0x0a); // CR LF
    }
    return await this.write(new Uint8Array(cmd));
  }

  async testPrint() {
    try {
      if (!this.isConnected) {
        return { success: false, error: "Printer belum terhubung" };
      }

      await this.initialize();
      await this.setAlign("center");
      await this.setBold(true);
      await this.printText("TEST PRINTER RPP02");
      await this.setBold(false);
      await this.printText("Koneksi Berhasil!");
      await this.printText(new Date().toLocaleString("id-ID"));
      await this.lineFeed(4); // Dorong kertas keluar dari head
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  getStatus() {
    return {
      isConnected: this.isConnected,
      device: this.device?.name || null,
      isWriting: this.isWriting,
      queueLength: this.writeQueue.length,
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PrinterService;
}