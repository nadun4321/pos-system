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
  const { addToCart } = useCart();

  const fetchProducts = () => {
    api
      .get("/products")
      .then((res) => setProducts(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode && p.barcode.includes(search))
  );

  const handleCheckoutSuccess = () => {
    setSuccess("Sale completed successfully!");
    fetchProducts();
    setTimeout(() => setSuccess(""), 3000);
  };

  return (
    <div>
      <h2 className="mb-4">
        <i className="bi bi-cart3 me-2"></i>Point of Sale
      </h2>

      {success && <div className="alert alert-success">{success}</div>}

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="mb-3">
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search products by name or barcode..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
            </div>
          ) : (
            <div className="row g-3">
              {filtered.length === 0 ? (
                <div className="col-12 text-center text-muted py-5">No products found</div>
              ) : (
                filtered.map((product) => (
                  <div key={product._id} className="col-md-4 col-sm-6">
                    <div className="card product-card h-100 border-0 shadow-sm">
                      <div className="card-body d-flex flex-column">
                        <h6 className="card-title">{product.name}</h6>
                        <p className="text-muted small mb-1">{product.category}</p>
                        <p className="text-primary fw-bold mb-1">
                          {formatCurrency(product.price)}
                        </p>
                        <p className="small mb-3">
                          Stock:{" "}
                          <span
                            className={`badge ${product.stock > 0 ? "bg-success" : "bg-danger"}`}
                          >
                            {product.stock}
                          </span>
                        </p>
                        <button
                          className="btn btn-primary btn-sm mt-auto"
                          onClick={() => addToCart(product)}
                          disabled={product.stock <= 0}
                        >
                          <i className="bi bi-cart-plus me-1"></i>
                          {product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="col-lg-4">
          <div className="cart-sticky">
            <CartSidebar onCheckoutSuccess={handleCheckoutSuccess} />
          </div>
        </div>
      </div>
    </div>
  );
}
