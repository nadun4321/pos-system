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

  return (
    <div className="cart-sidebar bg-white shadow-sm rounded p-3">
      <h5 className="border-bottom pb-2 mb-3">
        <i className="bi bi-bag-check me-2"></i>Cart
        <span className="badge bg-primary ms-2">{items.length}</span>
      </h5>

      {items.length === 0 ? (
        <p className="text-muted text-center py-4">Cart is empty</p>
      ) : (
        <div className="cart-items">
          {items.map((item) => (
            <div key={item.productId} className="cart-item border-bottom py-2">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <strong className="d-block">{item.name}</strong>
                  <small className="text-muted">{formatCurrency(item.price)} each</small>
                </div>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => removeItem(item.productId)}
                  title="Remove"
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>
              <div className="d-flex align-items-center justify-content-between mt-2">
                <div className="btn-group btn-group-sm">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => updateQuantity(item.productId, -1)}
                  >
                    <i className="bi bi-dash"></i>
                  </button>
                  <span className="btn btn-outline-secondary disabled">{item.quantity}</span>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => updateQuantity(item.productId, 1)}
                    disabled={item.quantity >= item.stock}
                  >
                    <i className="bi bi-plus"></i>
                  </button>
                </div>
                <strong>{formatCurrency(item.price * item.quantity)}</strong>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && <div className="alert alert-danger py-2 mt-2 small">{error}</div>}

      <div className="cart-footer mt-3 pt-3 border-top">
        <div className="d-flex justify-content-between mb-3">
          <strong>Total</strong>
          <strong className="text-primary fs-5">{formatCurrency(total)}</strong>
        </div>
        <button
          className="btn btn-success w-100"
          onClick={handleCheckout}
          disabled={items.length === 0 || loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              Processing...
            </>
          ) : (
            <>
              <i className="bi bi-credit-card me-2"></i>Checkout
            </>
          )}
        </button>
      </div>
    </div>
  );
}
