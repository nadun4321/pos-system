import { useState } from "react";
import { useCart } from "../context/CartContext";
import api from "../services/api";
import { formatCurrency } from "../utils/currency";

export default function CartSidebar({ onCheckoutSuccess }) {
  const { items, updateQuantity, removeItem, clearCart, total } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setLoading(true);
    setError("");
    try {
      await api.post("/sales/checkout", {
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });
      clearCart();
      onCheckoutSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div style={c.wrap}>

      {/* Cart Header */}
      <div style={c.header}>
        <div style={c.headerLeft}>
          <span style={{ fontSize: 18 }}>🛒</span>
          <span style={c.headerTitle}>Cart</span>
        </div>
        <div style={c.itemCountBadge}>{itemCount} item{itemCount !== 1 ? "s" : ""}</div>
      </div>

      {/* Cart Items */}
      <div style={c.itemsWrap}>
        {items.length === 0 ? (
          <div style={c.emptyState}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🛍️</div>
            <div style={{ color: "#475569", fontSize: 14, fontWeight: 500 }}>Cart is empty</div>
            <div style={{ color: "#334155", fontSize: 12, marginTop: 4 }}>Add products to get started</div>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.productId} style={c.item}>
              <div style={c.itemTop}>
                <div style={c.itemIcon}>📦</div>
                <div style={c.itemInfo}>
                  <div style={c.itemName}>{item.name}</div>
                  <div style={c.itemPrice}>{formatCurrency(item.price)} each</div>
                </div>
                <button
                  style={c.removeBtn}
                  onClick={() => removeItem(item.productId)}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.15)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >✕</button>
              </div>

              <div style={c.itemBottom}>
                <div style={c.qtyControls}>
                  <button
                    style={c.qtyBtn}
                    onClick={() => updateQuantity(item.productId, -1)}
                    onMouseEnter={e => e.currentTarget.style.background = "#1e293b"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >−</button>
                  <span style={c.qtyVal}>{item.quantity}</span>
                  <button
                    style={c.qtyBtn}
                    onClick={() => updateQuantity(item.productId, 1)}
                    disabled={item.quantity >= item.stock}
                    onMouseEnter={e => e.currentTarget.style.background = "#1e293b"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >+</button>
                </div>
                <div style={c.itemTotal}>{formatCurrency(item.price * item.quantity)}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={c.errorBox}>⚠️ {error}</div>
      )}

      {/* Footer */}
      <div style={c.footer}>

        {/* Summary */}
        <div style={c.summaryBox}>
          <div style={c.summaryRow}>
            <span style={{ color: "#64748b", fontSize: 13 }}>Subtotal</span>
            <span style={{ color: "#94a3b8", fontSize: 13 }}>{formatCurrency(total)}</span>
          </div>
          <div style={c.summaryRow}>
            <span style={{ color: "#64748b", fontSize: 13 }}>Tax</span>
            <span style={{ color: "#94a3b8", fontSize: 13 }}>—</span>
          </div>
          <div style={{ ...c.summaryRow, marginTop: 8, paddingTop: 8, borderTop: "1px solid #1e293b" }}>
            <span style={{ color: "#f1f5f9", fontSize: 16, fontWeight: 700 }}>Total</span>
            <span style={{ color: "#6366f1", fontSize: 20, fontWeight: 800 }}>{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Buttons */}
        {items.length > 0 && (
          <button
            style={c.clearBtn}
            onClick={clearCart}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.1)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            🗑 Clear Cart
          </button>
        )}

        <button
          style={{
            ...c.checkoutBtn,
            ...(items.length === 0 || loading ? c.checkoutDisabled : {}),
          }}
          onClick={handleCheckout}
          disabled={items.length === 0 || loading}
          onMouseEnter={e => items.length > 0 && !loading && (e.currentTarget.style.background = "#4f46e5")}
          onMouseLeave={e => items.length > 0 && !loading && (e.currentTarget.style.background = "#6366f1")}
        >
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <div style={c.btnSpinner} /> Processing...
            </span>
          ) : (
            "💳 Checkout"
          )}
        </button>
      </div>

    </div>
  );
}

const c = {
  wrap: {
    background: "#0d1526",
    border: "1px solid #1e293b",
    borderRadius: 16,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    borderBottom: "1px solid #1e293b",
    background: "#0f172a",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "#f1f5f9",
  },
  itemCountBadge: {
    background: "rgba(99,102,241,0.15)",
    border: "1px solid rgba(99,102,241,0.3)",
    color: "#a5b4fc",
    fontSize: 12,
    fontWeight: 700,
    padding: "3px 10px",
    borderRadius: 20,
  },
  itemsWrap: {
    flex: 1,
    overflowY: "auto",
    padding: "12px",
    maxHeight: 380,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  emptyState: {
    textAlign: "center",
    padding: "40px 0",
  },
  item: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: 10,
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  itemTop: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
  },
  itemIcon: {
    width: 36, height: 36,
    background: "#1e293b",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    flexShrink: 0,
  },
  itemInfo: { flex: 1, minWidth: 0 },
  itemName: {
    fontSize: 13,
    fontWeight: 600,
    color: "#f1f5f9",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  itemPrice: {
    fontSize: 11,
    color: "#475569",
    marginTop: 2,
  },
  removeBtn: {
    background: "transparent",
    border: "none",
    color: "#ef4444",
    cursor: "pointer",
    fontSize: 13,
    padding: "4px 6px",
    borderRadius: 6,
    transition: "background 0.15s",
    flexShrink: 0,
  },
  itemBottom: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  qtyControls: {
    display: "flex",
    alignItems: "center",
    gap: 0,
    border: "1px solid #1e293b",
    borderRadius: 8,
    overflow: "hidden",
  },
  qtyBtn: {
    width: 30, height: 30,
    background: "transparent",
    border: "none",
    color: "#94a3b8",
    cursor: "pointer",
    fontSize: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.15s",
  },
  qtyVal: {
    width: 32,
    textAlign: "center",
    fontSize: 13,
    fontWeight: 700,
    color: "#f1f5f9",
    borderLeft: "1px solid #1e293b",
    borderRight: "1px solid #1e293b",
    lineHeight: "30px",
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: 700,
    color: "#6366f1",
  },
  errorBox: {
    margin: "8px 12px",
    background: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.2)",
    color: "#f87171",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 13,
  },
  footer: {
    padding: "16px",
    borderTop: "1px solid #1e293b",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  summaryBox: {
    background: "#0f172a",
    borderRadius: 10,
    padding: "12px 14px",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  clearBtn: {
    background: "transparent",
    border: "1px solid rgba(239,68,68,0.3)",
    color: "#f87171",
    borderRadius: 8,
    padding: "8px",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    transition: "background 0.15s",
    textAlign: "center",
  },
  checkoutBtn: {
    background: "#6366f1",
    border: "none",
    borderRadius: 10,
    padding: "13px",
    color: "#fff",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    transition: "background 0.15s",
    textAlign: "center",
    boxShadow: "0 4px 16px rgba(99,102,241,0.4)",
  },
  checkoutDisabled: {
    background: "#1e293b",
    color: "#475569",
    cursor: "not-allowed",
    boxShadow: "none",
  },
  btnSpinner: {
    width: 16, height: 16,
    border: "2px solid rgba(255,255,255,0.2)",
    borderTop: "2px solid #fff",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
};