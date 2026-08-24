import { useState, useEffect, useRef, useCallback } from "react";

// ── Export Excel Helper ──────────────────────────────────────────────────────
function loadSheetJS(callback) {
  if (window.XLSX) { callback(window.XLSX); return; }
  const script = document.createElement("script");
  script.src = "https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js";
  script.onload = () => callback(window.XLSX);
  script.onerror = () => alert("Gagal load library Excel. Cek koneksi internet.");
  document.head.appendChild(script);
}

function exportTransaksiExcel(transactions) {
  loadSheetJS(XLSX => {
    const rows = [];
    transactions.forEach(t => {
      t.items.forEach(item => {
        rows.push({
          "ID Transaksi": t.id,
          "Tanggal": new Date(t.date).toLocaleString("id-ID"),
          "Kasir": t.cashier || "-",
          "Nama Produk": item.name,
          "Qty": item.qty,
          "Harga Satuan": item.price,
          "Subtotal Item": item.qty * item.price,
          "Total Transaksi": t.total,
          "Diskon": t.discount || 0,
          "Pajak": t.tax || 0,
          "Metode Bayar": t.payment,
          "Uang Diterima": t.cashPaid,
          "Kembalian": t.change || 0,
          "Catatan": t.note || "",
        });
      });
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const colWidths = Object.keys(rows[0]||{}).map(k => ({wch: Math.max(k.length, 14)}));
    ws["!cols"] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transaksi");

    const rekapRows = transactions.map(t => ({
      "ID": t.id,
      "Tanggal": new Date(t.date).toLocaleString("id-ID"),
      "Kasir": t.cashier || "-",
      "Jumlah Item": t.items.reduce((s,x)=>s+x.qty,0),
      "Subtotal": t.subtotal,
      "Diskon": t.discount || 0,
      "Pajak": t.tax || 0,
      "Total": t.total,
      "Metode": t.payment,
    }));
    if (rekapRows.length > 0) {
      const ws2 = XLSX.utils.json_to_sheet(rekapRows);
      XLSX.utils.book_append_sheet(wb, ws2, "Rekap Transaksi");
    }

    const tgl = new Date().toISOString().slice(0,10);
    XLSX.writeFile(wb, `transaksi-kasir-${tgl}.xlsx`);
  });
}

function exportProdukExcel(products) {
  loadSheetJS(XLSX => {
    const rows = products.map(p => ({
      "SKU": p.sku,
      "Barcode": p.barcode,
      "Nama Produk": p.name,
      "Kategori": p.category,
      "Harga": p.price,
      "Stok": p.stock,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [{wch:10},{wch:16},{wch:24},{wch:12},{wch:12},{wch:8}];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Produk");
    XLSX.writeFile(wb, `produk-kasir-${new Date().toISOString().slice(0,10)}.xlsx`);
  });
}

function exportPembelianExcel(pembelian) {
  loadSheetJS(XLSX => {
    const rows = pembelian.map(p => ({
      "Tanggal": p.tanggal,
      "Jenis": p.jenis,
      "Jumlah": p.jumlah,
      "Satuan": p.satuan,
      "Harga Satuan": p.harga,
      "Total": p.harga * p.jumlah,
      "Tempat Beli": p.tempat,
      "Catatan": p.catatan || "",
    }));

    const ws = XLSX.utils.json_to_sheet(rows.length > 0 ? rows : [{"Info":"Belum ada data pembelian"}]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pembelian");
    XLSX.writeFile(wb, `pembelian-${new Date().toISOString().slice(0,10)}.xlsx`);
  });
}

function exportPenjualanExcel(penjualan) {
  loadSheetJS(XLSX => {
    const rows = penjualan.map(p => ({
      "Tanggal": p.tanggal,
      "Produk": p.produk,
      "Jumlah": p.jumlah,
      "Satuan": p.satuan,
      "Harga Satuan": p.harga,
      "Total": p.harga * p.jumlah,
      "Catatan": p.catatan || "",
    }));

    const ws = XLSX.utils.json_to_sheet(rows.length > 0 ? rows : [{"Info":"Belum ada data penjualan"}]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Penjualan");
    XLSX.writeFile(wb, `penjualan-${new Date().toISOString().slice(0,10)}.xlsx`);
  });
}

// ── ESC/POS Encoder & Bluetooth RawBT Printer Helper ────────────────────────
class EscPosEncoder {
  constructor() {
    this.buffer = [];
  }

  init() {
    this.buffer.push(0x1B, 0x40);
    return this;
  }

  align(mode) {
    this.buffer.push(0x1B, 0x61, mode); // 0: Left, 1: Center, 2: Right
    return this;
  }

  size(mode) {
    this.buffer.push(0x1D, 0x21, mode === 1 ? 0x10 : 0x00);
    return this;
  }

  text(str) {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    for (let b of bytes) this.buffer.push(b);
    return this;
  }

  feed(lines = 1) {
    for (let i = 0; i < lines; i++) this.buffer.push(0x0A);
    return this;
  }

  toBase64Url() {
    const bytes = new Uint8Array(this.buffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return "data:application/octet-stream;base64," + btoa(binary);
  }
}

function printStrukEPPOS(transaction, storeName = "TOKO KASIR", storeAddress = "Bandung") {
  try {
    const enc = new EscPosEncoder();

    enc.init()
       .align(1)
       .size(1)
       .text(`${storeName}\n`)
       .size(0)
       .text(`${storeAddress}\n`)
       .text("--------------------------------\n")
       .align(0)
       .text(`No. TRX : ${transaction.id}\n`)
       .text(`Tgl     : ${new Date(transaction.date).toLocaleString("id-ID")}\n`)
       .text(`Kasir   : ${transaction.cashier || "-"}\n`)
       .text("--------------------------------\n");

    transaction.items.forEach(item => {
      enc.text(`${item.name}\n`);
      const qtyPrice = `${item.qty} x ${item.price.toLocaleString("id-ID")}`;
      const subtotal = (item.qty * item.price).toLocaleString("id-ID");
      const spaceLen = Math.max(0, 32 - qtyPrice.length - subtotal.length);
      enc.text(qtyPrice + " ".repeat(spaceLen) + subtotal + "\n");
    });

    enc.text("--------------------------------\n")
       .align(2)
       .text(`Subtotal: Rp ${transaction.subtotal.toLocaleString("id-ID")}\n`);

    if (transaction.discount > 0) {
      enc.text(`Diskon  : -Rp ${transaction.discount.toLocaleString("id-ID")}\n`);
    }
    if (transaction.tax > 0) {
      enc.text(`Pajak   : Rp ${transaction.tax.toLocaleString("id-ID")}\n`);
    }

    enc.text(`TOTAL   : Rp ${transaction.total.toLocaleString("id-ID")}\n`)
       .text(`Bayar   : Rp ${transaction.cashPaid.toLocaleString("id-ID")}\n`)
       .text(`Kembali : Rp ${(transaction.change || 0).toLocaleString("id-ID")}\n`)
       .feed(1)
       .align(1)
       .text("Terima Kasih atas Kunjungan Anda\n")
       .feed(3);

    const base64Data = enc.toBase64Url();
    const intentUrl = `intent:${base64Data}#Intent;scheme=rawbt;package=ru.a404m.rawbt;end;`;

    window.location.href = intentUrl;
  } catch (err) {
    alert("Gagal memproses cetak: " + err.message);
  }
}

// ── Data Initial ─────────────────────────────────────────────────────────────
const CATEGORY_ICONS = { Makanan:"Makanan", Minuman:"Minuman", Snack:"Snack", Lainnya:"Lainnya", Semua:"Semua" };
const CATEGORY_MAT_ICONS = { Makanan:"restaurant", Minuman:"local_cafe", Snack:"fastfood", Lainnya:"category", Semua:"apps" };
const CATEGORY_COLORS = { Makanan:"#FF6B35", Minuman:"#0EA5E9", Snack:"#A855F7", Lainnya:"#6B7280" };

const INITIAL_PRODUCTS = [
  { id:1, name:"Nasi Goreng Spesial", price:25000, category:"Makanan", stock:50, sku:"MKN001", barcode:"8991234000001" },
  { id:2, name:"Mie Ayam Bakso", price:18000, category:"Makanan", stock:45, sku:"MKN002", barcode:"8991234000002" },
  { id:3, name:"Ayam Bakar", price:32000, category:"Makanan", stock:30, sku:"MKN003", barcode:"8991234000003" },
  { id:4, name:"Soto Ayam", price:15000, category:"Makanan", stock:40, sku:"MKN004", barcode:"8991234000004" },
  { id:5, name:"Gado-gado", price:14000, category:"Makanan", stock:35, sku:"MKN005", barcode:"8991234000005" },
  { id:6, name:"Es Teh Manis", price:5000, category:"Minuman", stock:100, sku:"MNM001", barcode:"8991234000006" },
  { id:7, name:"Es Jeruk", price:8000, category:"Minuman", stock:80, sku:"MNM002", barcode:"8991234000007" },
  { id:8, name:"Jus Alpukat", price:15000, category:"Minuman", stock:60, sku:"MNM003", barcode:"8991234000008" },
  { id:9, name:"Kopi Hitam", price:6000, category:"Minuman", stock:90, sku:"MNM004", barcode:"8991234000009" },
  { id:10, name:"Air Mineral", price:3000, category:"Minuman", stock:200, sku:"MNM005", barcode:"8991234000010" },
  { id:11, name:"Kerupuk", price:2000, category:"Snack", stock:150, sku:"SNK001", barcode:"8991234000011" },
  { id:12, name:"Pisang Goreng", price:8000, category:"Snack", stock:7, sku:"SNK002", barcode:"8991234000012" },
  { id:13, name:"Tempe Mendoan", price:6000, category:"Snack", stock:80, sku:"SNK003", barcode:"8991234000013" },
  { id:14, name:"Teh Botol", price:5000, category:"Minuman", stock:120, sku:"MNM006", barcode:"8991234000014" },
  { id:15, name:"Nasi Putih", price:4000, category:"Makanan", stock:200, sku:"MKN006", barcode:"8991234000015" },
  { id:16, name:"Bakso Kuah", price:20000, category:"Makanan", stock:0, sku:"MKN007", barcode:"8991234000016" },
];

const INITIAL_TRANSACTIONS = [
  { id:"TRX-20240618-001", date:"2024-06-18T08:30:00", items:[{name:"Nasi Goreng Spesial",qty:2,price:25000},{name:"Es Teh Manis",qty:2,price:5000}], subtotal:60000, discount:0, tax:6000, total:66000, payment:"cash", cashPaid:70000, change:4000, cashier:"Budi" },
  { id:"TRX-20240618-002", date:"2024-06-18T09:15:00", items:[{name:"Mie Ayam Bakso",qty:1,price:18000},{name:"Kopi Hitam",qty:1,price:6000}], subtotal:24000, discount:2400, tax:2160, total:23760, payment:"qris", cashPaid:23760, change:0, cashier:"Sari" },
];

const CATEGORIES = ["Semua","Makanan","Minuman","Snack","Lainnya"];
const PAYMENT_METHODS = ["cash","debit","kredit","qris","transfer"];

const formatRp = (n) => new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",minimumFractionDigits:0}).format(n);
const formatDate = (d) => new Date(d).toLocaleString("id-ID",{dateStyle:"short",timeStyle:"short"});
const genId = () => `TRX-${new Date().toISOString().slice(0,10).replace(/-/g,"")}-${String(Math.floor(Math.random()*900)+100)}`;

// ── Material Design 3 CSS ────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&family=Roboto:wght@300;400;500;700&family=JetBrains+Mono:wght@400;500&display=swap');
  @import url('https://fonts.googleapis.com/icon?family=Material+Icons+Round');

  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

  :root[data-theme="light"] {
    --md-primary:#0061A4;
    --md-on-primary:#ffffff;
    --md-primary-container:#D3E3FD;
    --md-on-primary-container:#001D35;
    --md-secondary:#535F70;
    --md-secondary-container:#D7E3F7;
    --md-on-secondary-container:#101C2B;
    --md-surface:#F8F9FA;
    --md-surface-1:#EEF1F8;
    --md-surface-2:#E8ECF4;
    --md-surface-3:#E2E7F0;
    --md-surface-4:#E0E5EF;
    --md-on-surface:#1A1C1E;
    --md-on-surface-variant:#44474F;
    --md-outline:#74777F;
    --md-outline-variant:#C4C6D0;
    --md-error:#BA1A1A;
    --md-error-container:#FFDAD6;
    --md-scrim:rgba(0,0,0,.4);
    --elevation-1:0 1px 2px rgba(0,0,0,.15);
    --elevation-2:0 2px 6px rgba(0,0,0,.15);
  }

  :root {
    --md-primary:#C2E7FF;
    --md-on-primary:#003352;
    --md-primary-container:#004A77;
    --md-on-primary-container:#C2E7FF;
    --md-secondary:#B8C8DA;
    --md-secondary-container:#3A4857;
    --md-on-secondary-container:#D4E4F6;
    --md-surface:#111315;
    --md-surface-1:#1A1D20;
    --md-surface-2:#1F2327;
    --md-surface-3:#252A2E;
    --md-surface-4:#272C30;
    --md-on-surface:#E2E8F0;
    --md-on-surface-variant:#9AABB8;
    --md-outline:#4A5568;
    --md-outline-variant:#2D3748;
    --md-error:#FFB4AB;
    --md-error-container:#93000A;
    --md-scrim:rgba(0,0,0,.6);
    --elevation-1:0 1px 2px rgba(0,0,0,.3);
    --elevation-2:0 2px 6px rgba(0,0,0,.3);
    --shape-sm:8px;
    --shape-md:12px;
    --shape-lg:16px;
    --shape-xl:28px;
    --shape-full:100px;
    --font-brand:'Nunito','Roboto',sans-serif;
    --font-body:'Roboto',sans-serif;
    --font-mono:'JetBrains Mono',monospace;
  }

  html,body,#root { height:100%; font-family:var(--font-body); background:var(--md-surface); color:var(--md-on-surface); overflow:hidden; }
  .app { display:flex; flex-direction:column; height:100vh; overflow:hidden; }
  .top-app-bar { display:flex; align-items:center; justify-content:space-between; padding:0 16px; height:64px; background:var(--md-surface-2); border-bottom:1px solid var(--md-outline-variant); }
  .top-app-bar .brand-title { font-family:var(--font-brand); font-size:18px; font-weight:600; }
  .pos { display:flex; flex:1; overflow:hidden; }
  .pos-left { flex:1; display:flex; flex-direction:column; overflow:hidden; }
  .pos-right { width:360px; display:flex; flex-direction:column; background:var(--md-surface-1); border-left:1px solid var(--md-outline-variant); }
  .search-section { padding:10px 12px; background:var(--md-surface-1); }
  .m3-search-bar { display:flex; align-items:center; gap:8px; padding:0 12px; height:48px; background:var(--md-surface-4); border-radius:var(--shape-full); }
  .m3-search-input { flex:1; background:transparent; border:none; outline:none; color:var(--md-on-surface); font-size:15px; }
  .filter-chips-wrap { display:flex; gap:8px; padding:8px 12px; overflow-x:auto; background:var(--md-surface-1); }
  .m3-chip { padding:6px 16px; border-radius:var(--shape-sm); border:1px solid var(--md-outline); background:transparent; color:var(--md-on-surface-variant); cursor:pointer; font-size:13px; }
  .m3-chip.active { background:var(--md-secondary-container); color:var(--md-on-secondary-container); border-color:transparent; }
  .product-grid { flex:1; overflow-y:auto; padding:10px; display:grid; grid-template-columns:repeat(2,1fr); gap:8px; align-content:start; }
  .m3-product-card { background:var(--md-surface-2); border-radius:var(--shape-lg); border:1px solid var(--md-outline-variant); overflow:hidden; cursor:pointer; padding:10px; display:flex; flex-direction:column; justify-content:space-between; }
  .card-name { font-size:13px; font-weight:600; margin-bottom:4px; }
  .card-price { font-size:14px; font-weight:700; color:#90CAF9; }
  .cart-items-list { flex:1; overflow-y:auto; padding:8px; }
  .m3-cart-item { display:flex; align-items:center; justify-content:space-between; padding:8px; border-bottom:1px solid var(--md-outline-variant); }
  .cart-totals-wrap { padding:12px 16px; border-top:1px solid var(--md-outline-variant); }
  .m3-btn-filled { width:100%; padding:14px; background:var(--md-primary); color:var(--md-on-primary); border:none; border-radius:var(--shape-xl); font-size:15px; font-weight:600; cursor:pointer; }
  .m3-overlay { position:fixed; inset:0; background:var(--md-scrim); z-index:100; display:flex; align-items:flex-end; justify-content:center; }
  .m3-sheet { background:var(--md-surface-2); border-radius:28px 28px 0 0; width:100%; max-width:560px; padding:20px; display:flex; flex-direction:column; gap:16px; }
`;

export default function App() {
  const [products] = useState(INITIAL_PRODUCTS);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");
  const [cashPaid, setCashPaid] = useState("");
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);

  const addToCart = (product) => {
    if (product.stock <= 0) return;
    setCart((prev) => {
      const exist = prev.find((x) => x.id === product.id);
      if (exist) {
        return prev.map((x) => (x.id === product.id ? { ...x, qty: x.qty + 1 } : x));
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((x) => {
          if (x.id === id) {
            const newQty = x.qty + delta;
            return newQty > 0 ? { ...x, qty: newQty } : null;
          }
          return x;
        })
        .filter(Boolean)
    );
  };

  const filteredProducts = products.filter((p) => {
    const matchCat = category === "Semua" || p.category === category;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const subtotal = cart.reduce((acc, x) => acc + x.price * x.qty, 0);
  const total = subtotal;
  const numCashPaid = Number(cashPaid) || 0;
  const change = numCashPaid - total;

  const handleProcessPayment = () => {
    if (numCashPaid < total) {
      alert("Uang pembayaran kurang!");
      return;
    }

    const transactionData = {
      id: genId(),
      date: new Date().toISOString(),
      items: cart,
      subtotal,
      discount: 0,
      tax: 0,
      total,
      payment: "cash",
      cashPaid: numCashPaid,
      change,
      cashier: "Kasir 1",
    };

    // Cetak ke EPPOS RPP02 via RawBT
    printStrukEPPOS(transactionData, "TOKO SAYA", "Bandung");

    setCart([]);
    setCashPaid("");
    setIsPayModalOpen(false);
  };

  return (
    <div className="app">
      <style>{css}</style>
      <header className="top-app-bar">
        <span className="brand-title">POS Kasir - EPPOS RPP02 Ready</span>
      </header>

      <div className="pos">
        <div className="pos-left">
          <div className="search-section">
            <div className="m3-search-bar">
              <input
                className="m3-search-input"
                placeholder="Cari produk..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="filter-chips-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`m3-chip ${category === cat ? "active" : ""}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="product-grid">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                className={`m3-product-card ${p.stock === 0 ? "out-of-stock" : ""}`}
                onClick={() => addToCart(p)}
              >
                <div className="card-name">{p.name}</div>
                <div className="card-price">{formatRp(p.price)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="pos-right">
          <div className="cart-items-list">
            {cart.length === 0 ? (
              <div style={{ padding: 20, textAlign: "center", color: "#888" }}>Keranjang Kosong</div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="m3-cart-item">
                  <div>
                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                    <div style={{ fontSize: 12 }}>{formatRp(item.price)}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <button onClick={() => updateQty(item.id, -1)}>-</button>
                    <span>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)}>+</button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="cart-totals-wrap">
            <div style={{ marginBottom: 10, fontWeight: 700 }}>Total: {formatRp(total)}</div>
            <button
              className="m3-btn-filled"
              disabled={cart.length === 0}
              onClick={() => setIsPayModalOpen(true)}
            >
              Bayar & Cetak Struk
            </button>
          </div>
        </div>
      </div>

      {isPayModalOpen && (
        <div className="m3-overlay" onClick={() => setIsPayModalOpen(false)}>
          <div className="m3-sheet" onClick={(e) => e.stopPropagation()}>
            <h3>Pembayaran Cash</h3>
            <div>Total Tagihan: <strong>{formatRp(total)}</strong></div>
            <input
              type="number"
              placeholder="Nominal Uang Diterima"
              value={cashPaid}
              onChange={(e) => setCashPaid(e.target.value)}
              style={{ padding: 12, borderRadius: 8, border: "1px solid #444", background: "#222", color: "#fff" }}
            />
            {numCashPaid > 0 && <div>Kembalian: {formatRp(change)}</div>}
            <button className="m3-btn-filled" onClick={handleProcessPayment}>
              Proses & Cetak Struk (RawBT)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}