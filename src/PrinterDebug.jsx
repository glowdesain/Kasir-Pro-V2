import { useState, useEffect } from "react";
import PrinterService from "./PrinterService";

/**
 * Debug panel untuk troubleshooting printer Bluetooth
 */
export function PrinterDebugPanel({ isOpen, onClose }) {
  const [status, setStatus] = useState(null);
  const [logs, setLogs] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    const updateStatus = () => {
      setStatus(PrinterService.getStatus());
    };

    const interval = autoRefresh ? setInterval(updateStatus, 1000) : null;
    updateStatus(); // Initial update

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  // Capture console logs
  useEffect(() => {
    const originalLog = console.log;
    const originalError = console.error;

    const addLog = (type, args) => {
      const message = args.map(arg =>
        typeof arg === "object" ? JSON.stringify(arg) : String(arg)
      ).join(" ");

      setLogs(prev => [...prev.slice(-99), {
        id: Date.now(),
        type,
        message,
        time: new Date().toLocaleTimeString("id-ID"),
      }]);
    };

    console.log = (...args) => {
      originalLog(...args);
      addLog("log", args);
    };

    console.error = (...args) => {
      originalError(...args);
      addLog("error", args);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 0,
      right: 0,
      width: "100%",
      maxWidth: "400px",
      maxHeight: "50vh",
      background: "var(--md-surface-2)",
      border: "1px solid var(--md-outline-variant)",
      borderRadius: "12px 12px 0 0",
      display: "flex",
      flexDirection: "column",
      zIndex: 9999,
      boxShadow: "0 -4px 12px rgba(0,0,0,0.15)",
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: "12px",
    }}>
      {/* Header */}
      <div style={{
        padding: "12px 16px",
        borderBottom: "1px solid var(--md-outline-variant)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <strong>🐛 Printer Debug Console</strong>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "var(--md-on-surface)",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          ✕
        </button>
      </div>

      {/* Status */}
      {status && (
        <div style={{
          padding: "12px 16px",
          background: "var(--md-surface-3)",
          borderBottom: "1px solid var(--md-outline-variant)",
        }}>
          <div style={{ marginBottom: "6px" }}>
            <strong>Status:</strong> {status.isConnected ? "🟢 Connected" : "🔴 Disconnected"}
          </div>
          <div style={{ marginBottom: "6px" }}>
            <strong>Device:</strong> {status.device || "None"}
          </div>
          <div style={{ marginBottom: "6px" }}>
            <strong>Writing:</strong> {status.isWriting ? "⏳ Yes" : "✓ No"}
          </div>
          <div>
            <strong>Queue:</strong> {status.queueLength} pending
          </div>
        </div>
      )}

      {/* Controls */}
      <div style={{
        padding: "8px 12px",
        borderBottom: "1px solid var(--md-outline-variant)",
        display: "flex",
        gap: "6px",
        flexWrap: "wrap",
      }}>
        <button
          onClick={() => setAutoRefresh(!autoRefresh)}
          style={{
            padding: "4px 8px",
            fontSize: "11px",
            background: autoRefresh ? "var(--md-primary)" : "var(--md-surface-3)",
            color: autoRefresh ? "var(--md-on-primary)" : "var(--md-on-surface)",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {autoRefresh ? "Auto ✓" : "Auto"}
        </button>
        <button
          onClick={() => setLogs([])}
          style={{
            padding: "4px 8px",
            fontSize: "11px",
            background: "var(--md-surface-3)",
            color: "var(--md-on-surface)",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Clear
        </button>
        <button
          onClick={async () => {
            const result = await PrinterService.testPrint();
            console.log("Test print result:", result);
          }}
          style={{
            padding: "4px 8px",
            fontSize: "11px",
            background: "var(--md-success-container)",
            color: "var(--md-on-surface)",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Test Print
        </button>
      </div>

      {/* Logs */}
      <div style={{
        flex: 1,
        overflow: "auto",
        padding: "8px 12px",
        background: "#0a0e27",
        color: "#00ff00",
        lineHeight: "1.4",
      }}>
        {logs.length === 0 ? (
          <div style={{ color: "#666" }}>Menunggu logs...</div>
        ) : (
          logs.map(log => (
            <div
              key={log.id}
              style={{
                color: log.type === "error" ? "#ff6b6b" : "#00ff00",
                marginBottom: "4px",
              }}
            >
              <span style={{ color: "#666" }}>[{log.time}]</span> {log.message}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/**
 * Hook untuk enable/disable debug panel
 */
export function useDebugPanel() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ctrl+Shift+D to toggle debug
      if (e.ctrlKey && e.shiftKey && e.key === "D") {
        setIsOpen(prev => !prev);
        console.log("Debug panel toggled");
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  return { isOpen, setIsOpen };
}
