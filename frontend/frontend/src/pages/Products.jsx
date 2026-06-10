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

  const fetchProducts = () => {
    api
      .get("/products")
      .then((res) => setProducts(res.data))
      .catch((err) => setError(err.response?.data?.message || "Failed to load products"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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
      } else {
        await api.post("/products", payload);
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
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete product");
    }
  };

  const cancelForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="bi bi-box-seam me-2"></i>Products
        </h2>
        <button
          className="btn btn-primary"
          onClick={() => {
            setForm(emptyForm);
            setEditingId(null);
            setShowForm(true);
          }}
        >
          <i className="bi bi-plus-lg me-1"></i>Add Product
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {showForm && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <h5>{editingId ? "Edit Product" : "Add Product"}</h5>
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Name</label>
                  <input
                    name="name"
                    className="form-control"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Barcode</label>
                  <input
                    name="barcode"
                    className="form-control"
                    value={form.barcode}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Price ({CURRENCY})</label>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-control"
                    value={form.price}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Stock</label>
                  <input
                    name="stock"
                    type="number"
                    min="0"
                    className="form-control"
                    value={form.stock}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Category</label>
                  <input
                    name="category"
                    className="form-control"
                    value={form.category}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="mt-3">
                <button type="submit" className="btn btn-success me-2">
                  {editingId ? "Update" : "Save"}
                </button>
                <button type="button" className="btn btn-secondary" onClick={cancelForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary"></div>
        </div>
      ) : (
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Barcode</th>
                  <th>Category</th>
                  <th>Price ({CURRENCY})</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-4">
                      No products found
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product._id}>
                      <td>{product.name}</td>
                      <td>{product.barcode || "-"}</td>
                      <td>{product.category}</td>
                      <td>{formatCurrency(product.price)}</td>
                      <td>
                        <span
                          className={`badge ${product.stock > 0 ? "bg-success" : "bg-danger"}`}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary me-1"
                          onClick={() => handleEdit(product)}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(product._id)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
