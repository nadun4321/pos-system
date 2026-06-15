import { useEffect, useState } from "react";
import api from "../services/api";
import { CURRENCY, formatCurrency } from "../utils/currency";

const emptyForm = { name: "", barcode: "", price: "", stock: "", category: "General" };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [success, setSuccess] = useState("");

  const fetchProducts = () => {
    api.get("/products")
      .then((res) => setProducts(res.data))
      .catch((err) => setError(err.response?.data?.message || "Failed to load products"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const payload = {
      name: form.name,
      barcode: form.barcode,
      price: Number(form.price),
      stock: Number(form.stock),
      category: form.category,
    };
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        showSuccess("Product updated successfully!");
      } else {
        await api.post("/products", payload);
        showSuccess("Product added successfully!");
      }
      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save product");
    }
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name,
      barcode: product.barcode || "",
      price: product.price,
      stock: product.stock,
      category: product.category || "General",
    });
    setEditingId(product._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
      showSuccess("Product deleted.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete product");
    }
  };

  const cancelForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setError("");
  };

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 3000);
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.barcode && p.barcode.includes(search)) ||
    (p.category && p.category.toLowerCase().includes(search.toLowerCase()))
  );

  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const outOfStock = products.filter((p) => p.stock === 0).length;
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5).length;

  return (
    <div style={s.page}>

      {/* Header */}
      <div style={s.header}>
        <div>
          <div style={s.breadcrumb}>Inventory</div>
          <h1 style={s.title}>Products</h1>
        </div>
        <button
          style={s.addBtn}
          onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true); setError(""); }}
          onMouseEnter={e => e.currentTarget.style.background = "#4f46e5"}
          onMouseLeave={e => e.currentTarget.style.background = "#6366f1"}
        >
          + Add Product
        </button>
      </div>

      {/* KPI Row */}
      <div style={s.kpiRow}>
        <div style={s.kpiCard("#6366f1", "#1e1b4b")}>
          <div style={s.kpiIcon}>📦</div>
          <div>
            <div style={s.kpiVal}>{products.length}</div>
            <div style={s.kpiLbl}>Total Products</div>
          </div>
        </div>
        <div style={s.kpiCard("#10b981", "#052e16")}>
          <div style={s.kpiIcon}>📊</div>
          <div>
            <div style={s.kpiVal}>{totalStock}</div>
            <div style={s.kpiLbl}>Total Stock</div>
          </div>
        </div>
        <div style={s.kpiCard("#f59e0b", "#1c1917")}>
          <div style={s.kpiIcon}>⚠️</div>
          <div>
            <div style={s.kpiVal}>{lowStock}</div>
            <div style={s.kpiLbl}>Low Stock</div>
          </div>
        </div>
        <div style={s.kpiCard("#ef4444", "#1c0a0a")}>
          <div style={s.kpiIcon}>🚫</div>
          <div>
            <div style={s.kpiVal}>{outOfStock}</div>
            <div style={s.kpiLbl}>Out of Stock</div>
          </div>
        </div>
      </div>

      {/* Toasts */}
      {success && (
        <div style={s.successToast}>✅ {success}</div>
      )}
      {error && (
        <div style={s.errorToast}>⚠️ {error}</div>
      )}

      {/* Add / Edit Form */}
      {showForm && (
        <div style={s.formCard}>
          <div style={s.formHeader}>
            <div>
              <div style={s.formTitle}>
                {editingId ? "✏️ Edit Product" : "➕ New Product"}
              </div>
              <div style={s.formSub}>
                {editingId ? "Update the product details below" : "Fill in the details to add a new product"}
              </div>
            </div>
            <button style={s.closeBtn} onClick={cancelForm}>✕</button>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={s.formGrid}>
              <div style={s.formGroup}>
                <label style={s.label}>Product Name *</label>
                <input
                  name="name"
                  style={s.input}
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Coca Cola 500ml"
                  required
                  onFocus={e => e.target.style.borderColor = "#6366f1"}
                  onBlur={e => e.target.style.borderColor = "#1e293b"}
                />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Barcode</label>
                <input
                  name="barcode"
                  style={s.input}
                  value={form.barcode}
                  onChange={handleChange}
                  placeholder="e.g. 1234567890"
                  onFocus={e => e.target.style.borderColor = "#6366f1"}
                  onBlur={e => e.target.style.borderColor = "#1e293b"}
                />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Price ({CURRENCY}) *</label>
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  style={s.input}
                  value={form.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  required
                  onFocus={e => e.target.style.borderColor = "#6366f1"}
                  onBlur={e => e.target.style.borderColor = "#1e293b"}
                />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Stock Quantity *</label>
                <input
                  name="stock"
                  type="number"
                  min="0"
                  style={s.input}
                  value={form.stock}
                  onChange={handleChange}
                  placeholder="0"
                  required
                  onFocus={e => e.target.style.borderColor = "#6366f1"}
                  onBlur={e => e.target.style.borderColor = "#1e293b"}
                />
              </div>
              <div style={{ ...s.formGroup, gridColumn: "1 / -1" }}>
                <label style={s.label}>Category</label>
                <input
                  name="category"
                  style={s.input}
                  value={form.category}
                  onChange={handleChange}
                  placeholder="e.g. Beverages"
                  onFocus={e => e.target.style.borderColor = "#6366f1"}
                  onBlur={e => e.target.style.borderColor = "#1e293b"}
                />
              </div>
            </div>

            <div style={s.formActions}>
              <button
                type="button"
                style={s.cancelBtn}
                onClick={cancelForm}
                onMouseEnter={e => e.currentTarget.style.background = "#1e293b"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={s.saveBtn}
                onMouseEnter={e => e.currentTarget.style.background = "#4f46e5"}
                onMouseLeave={e => e.currentTarget.style.background = "#6366f1"}
              >
                {editingId ? "✓ Update Product" : "✓ Save Product"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table Card */}
      <div style={s.tableCard}>

        {/* Table Header */}
        <div style={s.tableTop}>
          <div>
            <div style={s.tableTitle}>All Products</div>
            <div style={s.tableSub}>{filtered.length} of {products.length} products</div>
          </div>
          <div style={s.searchWrap}>
            <span style={s.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={s.searchInput}
              onFocus={e => e.target.style.borderColor = "#6366f1"}
              onBlur={e => e.target.style.borderColor = "#1e293b"}
            />
          </div>
        </div>

        {loading ? (
          <div style={s.loadWrap}>
            <div style={s.spinner} />
            <p style={{ color: "#475569", marginTop: 12, fontSize: 13 }}>Loading products...</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={s.table}>
              <thead>
                <tr>
                  {["#", "Product", "Barcode", "Category", "Price", "Stock", "Actions"].map((h) => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "48px", color: "#475569" }}>
                      <div style={{ fontSize: 36, marginBottom: 8 }}>📦</div>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>No products found</div>
                      <div style={{ fontSize: 13, color: "#334155" }}>Try a different search term</div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((product, i) => {
                    const outOfStock = product.stock === 0;
                    const lowStock = product.stock > 0 && product.stock <= 5;
                    return (
                      <tr
                        key={product._id}
                        style={s.tr}
                        onMouseEnter={e => e.currentTarget.style.background = "#0f172a"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <td style={{ ...s.td, color: "#334155" }}>{i + 1}</td>
                        <td style={s.td}>
                          <div style={s.productCell}>
                            <div style={s.productAvatar}>
                              {product.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: "#f1f5f9", fontSize: 14 }}>
                                {product.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ ...s.td, fontFamily: "monospace", color: "#475569", fontSize: 12 }}>
                          {product.barcode || "—"}
                        </td>
                        <td style={s.td}>
                          <span style={s.categoryBadge}>{product.category || "General"}</span>
                        </td>
                        <td style={{ ...s.td, color: "#6366f1", fontWeight: 700 }}>
                          {formatCurrency(product.price)}
                        </td>
                        <td style={s.td}>
                          <span style={{
                            ...s.stockBadge,
                            background: outOfStock ? "rgba(239,68,68,0.1)" : lowStock ? "rgba(245,158,11,0.1)" : "rgba(16,185,129,0.1)",
                            color: outOfStock ? "#f87171" : lowStock ? "#fbbf24" : "#34d399",
                            border: `1px solid ${outOfStock ? "rgba(239,68,68,0.2)" : lowStock ? "rgba(245,158,11,0.2)" : "rgba(16,185,129,0.2)"}`,
                          }}>
                            {outOfStock ? "Out of Stock" : lowStock ? `⚠ ${product.stock}` : product.stock}
                          </span>
                        </td>
                        <td style={s.td}>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button
                              style={s.editBtn}
                              onClick={() => handleEdit(product)}
                              onMouseEnter={e => e.currentTarget.style.background = "rgba(99,102,241,0.15)"}
                              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              style={s.deleteBtn}
                              onClick={() => handleDelete(product._id)}
                              onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.15)"}
                              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                            >
                              🗑
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
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
  addBtn: {
    background: "#6366f1",
    border: "none",
    borderRadius: 10,
    padding: "10px 20px",
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.15s",
    boxShadow: "0 4px 16px rgba(99,102,241,0.4)",
  },
  kpiRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 14,
    marginBottom: 24,
  },
  kpiCard: (color, bg) => ({
    background: `linear-gradient(135deg, ${bg} 0%, ${bg}dd 100%)`,
    border: `1px solid ${color}33`,
    borderRadius: 14,
    padding: "18px 20px",
    display: "flex",
    alignItems: "center",
    gap: 14,
    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
  }),
  kpiIcon: { fontSize: 28 },
  kpiVal: {
    fontSize: 26,
    fontWeight: 800,
    color: "#f8fafc",
    letterSpacing: "-0.03em",
  },
  kpiLbl: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: 500,
    marginTop: 2,
  },
  successToast: {
    background: "rgba(16,185,129,0.1)",
    border: "1px solid rgba(16,185,129,0.3)",
    color: "#34d399",
    borderRadius: 10,
    padding: "12px 20px",
    marginBottom: 16,
    fontSize: 14,
    fontWeight: 500,
  },
  errorToast: {
    background: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.3)",
    color: "#f87171",
    borderRadius: 10,
    padding: "12px 20px",
    marginBottom: 16,
    fontSize: 14,
    fontWeight: 500,
  },
  formCard: {
    background: "#0d1526",
    border: "1px solid #1e293b",
    borderRadius: 16,
    padding: "24px",
    marginBottom: 24,
    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
  },
  formHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 17,
    fontWeight: 700,
    color: "#f1f5f9",
    marginBottom: 4,
  },
  formSub: {
    fontSize: 13,
    color: "#475569",
  },
  closeBtn: {
    background: "transparent",
    border: "1px solid #1e293b",
    color: "#64748b",
    width: 32, height: 32,
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 16,
    marginBottom: 20,
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: 600,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  input: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: 8,
    padding: "10px 14px",
    color: "#f1f5f9",
    fontSize: 14,
    outline: "none",
    transition: "border 0.2s",
    width: "100%",
    boxSizing: "border-box",
  },
  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    paddingTop: 16,
    borderTop: "1px solid #1e293b",
  },
  cancelBtn: {
    background: "transparent",
    border: "1px solid #1e293b",
    color: "#64748b",
    borderRadius: 8,
    padding: "9px 20px",
    fontSize: 14,
    cursor: "pointer",
    transition: "background 0.15s",
  },
  saveBtn: {
    background: "#6366f1",
    border: "none",
    borderRadius: 8,
    padding: "9px 24px",
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.15s",
    boxShadow: "0 4px 12px rgba(99,102,241,0.4)",
  },
  tableCard: {
    background: "#0d1526",
    border: "1px solid #1e293b",
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
  },
  tableTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px",
    borderBottom: "1px solid #1e293b",
    flexWrap: "wrap",
    gap: 12,
  },
  tableTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: "#f1f5f9",
    marginBottom: 2,
  },
  tableSub: {
    fontSize: 12,
    color: "#475569",
  },
  searchWrap: {
    position: "relative",
  },
  searchIcon: {
    position: "absolute",
    left: 12,
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: 13,
  },
  searchInput: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: 8,
    padding: "8px 12px 8px 34px",
    color: "#f1f5f9",
    fontSize: 13,
    outline: "none",
    width: 220,
    transition: "border 0.2s",
  },
  loadWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 0",
  },
  spinner: {
    width: 36, height: 36,
    border: "3px solid #1e293b",
    borderTop: "3px solid #6366f1",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "12px 20px",
    fontSize: 11,
    color: "#334155",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontWeight: 700,
    borderBottom: "1px solid #1e293b",
    background: "#0a1020",
  },
  td: {
    padding: "14px 20px",
    fontSize: 13,
    color: "#94a3b8",
    borderBottom: "1px solid #0f172a",
    transition: "background 0.15s",
  },
  tr: { transition: "background 0.15s" },
  productCell: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  productAvatar: {
    width: 34, height: 34,
    borderRadius: 8,
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    fontWeight: 700,
    color: "#fff",
    flexShrink: 0,
  },
  categoryBadge: {
    background: "rgba(99,102,241,0.1)",
    border: "1px solid rgba(99,102,241,0.2)",
    color: "#a5b4fc",
    fontSize: 11,
    fontWeight: 600,
    padding: "3px 10px",
    borderRadius: 20,
  },
  stockBadge: {
    fontSize: 12,
    fontWeight: 600,
    padding: "3px 10px",
    borderRadius: 20,
  },
  editBtn: {
    background: "transparent",
    border: "1px solid rgba(99,102,241,0.3)",
    color: "#a5b4fc",
    borderRadius: 6,
    padding: "5px 12px",
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    transition: "background 0.15s",
  },
  deleteBtn: {
    background: "transparent",
    border: "1px solid rgba(239,68,68,0.3)",
    color: "#f87171",
    borderRadius: 6,
    padding: "5px 10px",
    fontSize: 12,
    cursor: "pointer",
    transition: "background 0.15s",
  },
};