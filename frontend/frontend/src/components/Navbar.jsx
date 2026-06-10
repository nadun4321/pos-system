import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { CURRENCY } from "../utils/currency";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => (location.pathname === path ? "active" : "");

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold" to="/">
          <i className="bi bi-shop me-2"></i>POS System
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className={`nav-link ${isActive("/")}`} to="/">
                <i className="bi bi-speedometer2 me-1"></i>Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive("/pos")}`} to="/pos">
                <i className="bi bi-cart3 me-1"></i>POS
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive("/products")}`} to="/products">
                <i className="bi bi-box-seam me-1"></i>Products
              </Link>
            </li>
          </ul>
          <div className="d-flex align-items-center gap-3">
            <span className="badge bg-secondary">{CURRENCY}</span>
            <span className="text-light small">
              <i className="bi bi-person-circle me-1"></i>
              {user?.name}
            </span>
            <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right me-1"></i>Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
