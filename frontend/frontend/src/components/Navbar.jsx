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

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={nav.bar}>
      <div style={nav.inner}>

        {/* Logo */}
        <Link to="/" style={nav.brand}>
          <div style={nav.logoBox}>
            <span style={{ fontSize: 18 }}>🏪</span>
          </div>
          <span>POS <span style={{ color: "#6366f1", fontWeight: 800 }}>Pro</span></span>
        </Link>

        {/* Nav Links */}
        <div style={nav.links}>
          {[
            { path: "/", icon: "⊞", label: "Dashboard" },
            { path: "/pos", icon: "🛒", label: "POS" },
            { path: "/products", icon: "📦", label: "Products" },
            { path: "/sales", icon: "📊", label: "Sales History" },
          ].map(({ path, icon, label }) => (
            <Link key={path} to={path} style={{
              ...nav.link,
              ...(isActive(path) ? nav.linkActive : {}),
            }}>
              <span style={{ fontSize: 14 }}>{icon}</span>
              {label}
              {isActive(path) && <div style={nav.activeDot} />}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div style={nav.right}>
          <div style={nav.currencyBadge}>{CURRENCY}</div>
          <div style={nav.userChip}>
            <div style={nav.avatar}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: 13, color: "#cbd5e1" }}>{user?.name}</span>
          </div>
          <button style={nav.logoutBtn} onClick={handleLogout}
            onMouseEnter={e => e.target.style.background = "#ef444422"}
            onMouseLeave={e => e.target.style.background = "transparent"}>
            ⎋ Logout
          </button>
        </div>

      </div>
    </nav>
  );
}

const nav = {
  bar: {
    background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
    borderBottom: "1px solid #312e81",
    padding: "0 32px",
    height: 64,
    display: "flex",
    alignItems: "center",
    position: "sticky",
    top: 0,
    zIndex: 100,
    boxShadow: "0 4px 24px rgba(99,102,241,0.15)",
  },
  inner: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    gap: 32,
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    textDecoration: "none",
    color: "#f1f5f9",
    fontWeight: 700,
    fontSize: 20,
    letterSpacing: "-0.02em",
    marginRight: 16,
  },
  logoBox: {
    width: 36, height: 36,
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(99,102,241,0.4)",
  },
  links: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  link: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 16px",
    borderRadius: 8,
    textDecoration: "none",
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: 500,
    position: "relative",
    transition: "all 0.2s",
  },
  linkActive: {
    color: "#f1f5f9",
    background: "rgba(99,102,241,0.15)",
    border: "1px solid rgba(99,102,241,0.3)",
  },
  activeDot: {
    position: "absolute",
    bottom: -1, left: "50%",
    transform: "translateX(-50%)",
    width: 4, height: 4,
    borderRadius: "50%",
    background: "#6366f1",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginLeft: "auto",
  },
  currencyBadge: {
    background: "rgba(99,102,241,0.15)",
    border: "1px solid rgba(99,102,241,0.3)",
    color: "#a5b4fc",
    borderRadius: 6,
    padding: "4px 10px",
    fontSize: 12,
    fontWeight: 700,
  },
  userChip: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 20,
    padding: "4px 12px 4px 4px",
  },
  avatar: {
    width: 28, height: 28,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 700,
    color: "#fff",
  },
  logoutBtn: {
    background: "transparent",
    border: "1px solid rgba(239,68,68,0.3)",
    color: "#f87171",
    borderRadius: 8,
    padding: "6px 14px",
    fontSize: 13,
    cursor: "pointer",
    fontWeight: 500,
    transition: "all 0.2s",
  },
};