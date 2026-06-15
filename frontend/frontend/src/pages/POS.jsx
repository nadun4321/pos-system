import { useEffect, useState } from "react";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import CartSidebar from "../components/CartSidebar";
import { formatCurrency } from "../utils/currency";

export default function POS() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [success, setSuccess] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const { addToCart } = useCart();

  const fetchProducts = () => {
    api.get("/products")
      .then((res) => setProducts(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  const categories = ["All", ...new Set(products.map((p) => p.category).filter(Boolean))];

  const filtered = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode && p.barcode.includes(search));
    const matchCategory = activeCategory === "All" || p.category === activeCategory;
    return matchSearch && matchCategory;
  });

  const handleCheckoutSuccess = () => {
    setSuccess("Sale completed successfully!");
    fetchProducts();
    setTimeout(() => setSuccess(""), 3000);
  };

  return (
    <div style={s.page}>

      {/* Header */}
      <div style={s.header}>
        <div>
          <div style={s.breadcrumb}>Point of Sale</div>
          <h1 style={s.title}>POS Terminal</h1>
        </div>
        <div style={s.statsRow}>
          <div style={s.statPill}>
            <span style={{ color: "#6366f1" }}>📦</span>
            <span style={{ color: "#94a3b8", fontSize: 13 }}>{products.length} products</span>
          </div>
          <div style={s.statPill}>
            <span style={{ color: "#10b981" }}>✓</span>
            <span style={{ color: "#94a3b8", fontSize: 13 }}>{filtered.length} shown</span>
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {success && (
        <div style={s.toast}>
          <span>✅</span> {success}
        </div>
      )}

      <div style={s.layout}>

        {/* Left — Products */}
        <div style={s.left}>

          {/* Search */}
          <div style={s.searchWrap}>
            <span style={s.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Search by name or barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={s.searchInput}
            />
            {search && (
              <button style={s.clearBtn} onClick={() => setSearch("")}>✕</button>
            )}
          </div>

          {/* Category Pills */}
          <div style={s.categoryRow}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  ...s.catPill,
                  ...(activeCategory === cat ? s.catPillActive : {}),
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          {loading ? (
            <div style={s.loadWrap}>
              <div style={s.spinner} />
              <p style={{ color: "#475569", marginTop: 12, fontSize: 13 }}>Loading products...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={s.emptyWrap}>
              <div style={{ fontSize: 48 }}>🔍</div>
              <div style={{ color: "#475569", fontSize: 15, fontWeight: 600, marginTop: 12 }}>No products found</div>
              <div style={{ color: "#334155", fontSize: 13, marginTop: 4 }}>Try a different search or category</div>
            </div>
          ) : (
            <div style={s.grid}>
              {filtered.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onAdd={() => addToCart(product)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right — Cart */}
        <div style={s.right}>
          <CartSidebar onCheckoutSuccess={handleCheckoutSuccess} />
        </div>

      </div>
    </div>
  );
}

function ProductCard({ product, onAdd }) {
  const outOfStock = product.stock <= 0;
  const lowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div style={{
      ...s.card,
      opacity: outOfStock ? 0.5 : 1,
    }}
      onMouseEnter={e => !outOfStock && (e.currentTarget.style.border = "1px solid #6366f1")}
      onMouseLeave={e => e.currentTarget.style.border = "1px solid #1e293b"}
    >
      {/* Category tag */}
      <div style={s.cardTop}>
        <span style={s.categoryTag}>{product.category || "General"}</span>
        {lowStock && <span style={s.lowStockTag}>Low Stock</span>}
        {outOfStock && <span style={s.outStockTag}>Out of Stock</span>}
      </div>

      {/* Product icon placeholder */}
      <div style={s.productIcon}>
        <span style={{ fontSize: 28 }}>📦</span>
      </div>

      <div style={s.productName}>{product.name}</div>
      {product.barcode && (
        <div style={s.barcode}>#{product.barcode}</div>
      )}

      <div style={s.cardBottom}>
        <div style={s.price}>{formatCurrency(product.price)}</div>
        <div style={{
          ...s.stockBadge,
          background: outOfStock ? "rgba(239,68,68,0.1)" : lowStock ? "rgba(245,158,11,0.1)" : "rgba(16,185,129,0.1)",
          color: outOfStock ? "#f87171" : lowStock ? "#fbbf24" : "#34d399",
          border: `1px solid ${outOfStock ? "rgba(239,68,68,0.2)" : lowStock ? "rgba(245,158,11,0.2)" : "rgba(16,185,129,0.2)"}`,
        }}>
          {product.stock} left
        </div>
      </div>

      <button
        style={{
          ...s.addBtn,
          ...(outOfStock ? s.addBtnDisabled : {}),
        }}
        onClick={onAdd}
        disabled={outOfStock}
        onMouseEnter={e => !outOfStock && (e.currentTarget.style.background = "#4f46e5")}
        onMouseLeave={e => !outOfStock && (e.currentTarget.style.background = "#6366f1")}
      >
        {outOfStock ? "Out of Stock" : "+ Add to Cart"}
      </button>
    </div>
  );
}

const s = {
  page: {
    background: "#080d1a",
    minHeight: "100vh",
    padding: "28px 32px",
    color: "#f1f5f9",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 24,
    flexWrap: "wrap",
    gap: 12,
  },
  breadcrumb: {
    fontSize: 12,
    color: "#6366f1",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 800,
    color: "#f8fafc",
    margin: 0,
    letterSpacing: "-0.03em",
  },
  statsRow: {
    display: "flex",
    gap: 10,
  },
  statPill: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: 20,
    padding: "6px 14px",
  },
  toast: {
    background: "rgba(16,185,129,0.1)",
    border: "1px solid rgba(16,185,129,0.3)",
    color: "#34d399",
    borderRadius: 10,
    padding: "12px 20px",
    marginBottom: 20,
    fontSize: 14,
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "1fr 340px",
    gap: 20,
    alignItems: "start",
  },
  left: { minWidth: 0 },
  right: {
    position: "sticky",
    top: 80,
  },
  searchWrap: {
    position: "relative",
    marginBottom: 16,
  },
  searchIcon: {
    position: "absolute",
    left: 14,
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: 15,
  },
  searchInput: {
    width: "100%",
    padding: "12px 44px",
    background: "#0d1526",
    border: "1px solid #1e293b",
    borderRadius: 12,
    color: "#f1f5f9",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    transition: "border 0.2s",
  },
  clearBtn: {
    position: "absolute",
    right: 14,
    top: "50%",
    transform: "translateY(-50%)",
    background: "transparent",
    border: "none",
    color: "#475569",
    cursor: "pointer",
    fontSize: 14,
    padding: 0,
  },
  categoryRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 20,
  },
  catPill: {
    padding: "6px 16px",
    borderRadius: 20,
    border: "1px solid #1e293b",
    background: "transparent",
    color: "#64748b",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.15s",
  },
  catPillActive: {
    background: "rgba(99,102,241,0.15)",
    border: "1px solid rgba(99,102,241,0.4)",
    color: "#a5b4fc",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: 14,
  },
  card: {
    background: "#0d1526",
    border: "1px solid #1e293b",
    borderRadius: 14,
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    transition: "border 0.2s",
    cursor: "pointer",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 4,
  },
  categoryTag: {
    fontSize: 10,
    fontWeight: 700,
    color: "#6366f1",
    background: "rgba(99,102,241,0.1)",
    border: "1px solid rgba(99,102,241,0.2)",
    padding: "2px 8px",
    borderRadius: 20,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  lowStockTag: {
    fontSize: 10,
    fontWeight: 700,
    color: "#fbbf24",
    background: "rgba(245,158,11,0.1)",
    border: "1px solid rgba(245,158,11,0.2)",
    padding: "2px 8px",
    borderRadius: 20,
  },
  outStockTag: {
    fontSize: 10,
    fontWeight: 700,
    color: "#f87171",
    background: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.2)",
    padding: "2px 8px",
    borderRadius: 20,
  },
  productIcon: {
    width: "100%",
    height: 70,
    background: "#0f172a",
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "4px 0",
  },
  productName: {
    fontSize: 14,
    fontWeight: 700,
    color: "#f1f5f9",
    lineHeight: 1.3,
  },
  barcode: {
    fontSize: 11,
    color: "#334155",
    fontFamily: "monospace",
  },
  cardBottom: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: 800,
    color: "#6366f1",
  },
  stockBadge: {
    fontSize: 11,
    fontWeight: 600,
    padding: "2px 8px",
    borderRadius: 20,
  },
  addBtn: {
    width: "100%",
    padding: "9px",
    background: "#6366f1",
    border: "none",
    borderRadius: 8,
    color: "#fff",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.15s",
    marginTop: 4,
  },
  addBtnDisabled: {
    background: "#1e293b",
    color: "#475569",
    cursor: "not-allowed",
  },
  loadWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "80px 0",
  },
  spinner: {
    width: 36, height: 36,
    border: "3px solid #1e293b",
    borderTop: "3px solid #6366f1",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  emptyWrap: {
    textAlign: "center",
    padding: "80px 0",
  },
};