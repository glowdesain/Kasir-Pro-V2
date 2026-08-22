import { useState, useEffect } from "react";
import PrinterService from "./PrinterService";

export function PrinterSettings({ onClose, settings, onSettingsChange, addToast }) {
  const [printerDevice, setPrinterDevice] = useState(
    settings.printerDevice ? JSON.parse(settings.printerDevice) : null
  );
  const [isConnecting, setIsConnecting] = useState(false);
  const [testingPrint, setTestingPrint] = useState(false);
  const [status, setStatus] = useState(null);
  const [expandedInfo, setExpandedInfo] = useState(false);

  // Monitor printer status
  useEffect(() => {
    const checkStatus = () => {
      setStatus(PrinterService.getStatus());
    };

    checkStatus();
    const interval = setInterval(checkStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const result = await PrinterService.connect();

      if (result.success) {
        setPrinterDevice({ name: result.device, connected: true });
        onSettingsChange({
          ...settings,
          printerDevice: JSON.stringify({ name: result.device, connected: true }),
        });
        addToast(`✅ Printer terhubung: ${result.device}`, "success");
      } else {
        addToast(`❌ ${result.error}`, "error");
      }
    } catch (error) {
      addToast(`❌ Error: ${error.message}`, "error");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      const result = await PrinterService.disconnect();
      if (result.success) {
        setPrinterDevice(null);
        onSettingsChange({
          ...settings,
          printerDevice: null,
        });
        addToast("✅ Printer disconnected", "success");
      } else {
        addToast(`❌ ${result.error}`, "error");
      }
    } catch (error) {
      addToast(`❌ Error: ${error.message}`, "error");
    }
  };

  const handleTestPrint = async () => {
    if (!printerDevice?.connected && !status?.isConnected) {
      addToast("❌ Printer belum terhubung", "error");
      return;
    }

    setTestingPrint(true);
    try {
      const result = await PrinterService.testPrint();

      if (result.success) {
        addToast("✅ Test print berhasil! Struk harus keluar sekarang.", "success");
      } else {
        addToast(`❌ Test print gagal: ${result.error}`, "error");
      }
    } catch (error) {
      addToast(`❌ Error: ${error.message}`, "error");
    } finally {
      setTestingPrint(false);
    }
  };

  const isConnected = printerDevice?.connected || status?.isConnected;

  return (
    <div className="m3-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="m3-sheet" style={{ maxWidth: "520px" }}>
        <div className="sheet-handle" />
        <div className="sheet-header">
          <span className="sheet-title">🖨️ Pengaturan Printer Bluetooth</span>
          <button className="sheet-close" onClick={onClose}>✕</button>
        </div>

        <div className="sheet-body" style={{ padding: "24px" }}>
          {/* Status Printer */}
          <div className="m3-card" style={{ marginBottom: "24px" }}>
            <div style={{ padding: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      backgroundColor: isConnected ? "#10b981" : "#ef4444",
                      animation: isConnected ? "pulse 2s infinite" : "none",
                    }}
                  />
                  <span style={{ fontWeight: "500", fontSize: "15px" }}>
                    {isConnected ? "✅ Terhubung" : "❌ Tidak Terhubung"}
                  </span>
                </div>
                <button
                  onClick={() => setExpandedInfo(!expandedInfo)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--md-primary)",
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                >
                  {expandedInfo ? "▼" : "▶"}
                </button>
              </div>

              {expandedInfo && status && (
                <div style={{ 
                  fontSize: "12px",
                  color: "var(--md-on-surface-variant)",
                  background: "var(--md-surface-2)",
                  padding: "12px",
                  borderRadius: "8px",
                  lineHeight: "1.6",
                }}>
                  <div><strong>Device:</strong> {status.device || "None"}</div>
                  <div><strong>Connected:</strong> {status.isConnected ? "Yes" : "No"}</div>
                  <div><strong>Writing:</strong> {status.isWriting ? "Yes" : "No"}</div>
                  <div><strong>Queue:</strong> {status.queueLength} pending writes</div>
                </div>
              )}

              {printerDevice && (
                <div style={{ fontSize: "13px", color: "var(--md-on-surface-variant)", marginTop: "12px" }}>
                  <strong>Device:</strong> {printerDevice.name}
                </div>
              )}
            </div>
          </div>

          {/* Supported Printers */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "12px", fontWeight: "500", marginBottom: "8px", color: "var(--md-on-surface)" }}>
              ✓ Printer yang Didukung:
            </div>
            <div style={{ 
              fontSize: "12px", 
              color: "var(--md-on-surface-variant)",
              background: "var(--md-surface-2)",
              padding: "12px",
              borderRadius: "8px",
              lineHeight: "1.6",
            }}>
              <div>• Epson RPPO2 (58mm Thermal)</div>
              <div>• Epson TM-M30 / TM-M50</div>
              <div>• Epson FP Series</div>
              <div>• Printer ESC/POS lainnya</div>
            </div>
          </div>

          {/* Requirements */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "12px", fontWeight: "500", marginBottom: "8px", color: "var(--md-on-surface)" }}>
              📋 Persyaratan:
            </div>
            <div style={{ 
              fontSize: "12px", 
              color: "var(--md-on-surface-variant)",
              background: "var(--md-surface-2)",
              padding: "12px",
              borderRadius: "8px",
              lineHeight: "1.6",
            }}>
              <div>1. Browser: Chrome, Edge, atau Opera (terbaru)</div>
              <div>2. Printer sudah di-pair di Bluetooth settings</div>
              <div>3. Printer dalam jarak ~10 meter</div>
              <div>4. Battery printer penuh</div>
              <div>5. Paper tersedia di printer</div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {!isConnected ? (
              <button
                className="btn btn-filled"
                onClick={handleConnect}
                disabled={isConnecting}
                style={{ width: "100%", padding: "12px 16px" }}
              >
                {isConnecting ? "🔄 Mencari printer..." : "🔍 Cari & Hubungkan Printer"}
              </button>
            ) : (
              <>
                <button
                  className="btn btn-filled"
                  onClick={handleTestPrint}
                  disabled={testingPrint}
                  style={{ width: "100%", padding: "12px 16px" }}
                >
                  {testingPrint ? "⏳ Printing..." : "🧪 Test Print (Coba Cetak)"}
                </button>
                <button
                  className="btn btn-outlined"
                  onClick={handleDisconnect}
                  style={{ width: "100%", padding: "12px 16px" }}
                >
                  🔌 Putuskan Koneksi
                </button>
              </>
            )}
          </div>

          {/* Troubleshooting Hint */}
          <div style={{ 
            marginTop: "24px",
            fontSize: "12px",
            color: "var(--md-on-surface-variant)",
            background: "var(--md-tertiary-container)",
            padding: "12px",
            borderRadius: "8px",
            lineHeight: "1.5",
          }}>
            <div style={{ fontWeight: "500", marginBottom: "6px", color: "var(--md-tertiary)" }}>
              💡 Tips Troubleshooting:
            </div>
            Jika tidak menemukan printer, coba:<br/>
            • Restart printer dan browser<br/>
            • Buka Bluetooth settings & pastikan printer ter-pair<br/>
            • Gunakan Chrome / Edge terbaru<br/>
            • Pastikan printer dalam jarak dekat
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
