import { useEffect, useState } from "react";
import api from "../services/api";
import { formatCurrency } from "../utils/currency";

export default function SalesHistory() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all");

  useEffect(() => {
    api.get("/sales")
      .then((res) => setSales(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filterByDate = (sale) => {
    const saleDate = new Date(sale.createdAt);
    const now = new Date();
    if (dateFilter === "today") {
      return saleDate.toDateString() === now.toDateString();
    }
    if (dateFilter === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      return saleDate >= weekAgo;
    }
    if (dateFilter === "month") {
      return (
        saleDate.getMonth() === now.getMonth() &&
        saleDate.getFullYear() === now.getFullYear()
      );
    }
    return true;
  };

  const filtered = sales.filter((sale) => {
    const matchSearch =
      sale.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      sale._id.toLowerCase().includes(search.toLowerCase()) ||
      sale.items?.some((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    return matchSearch && filterByDate(sale);
  });

  const totalRevenue = filtered.reduce((sum, s) => sum + s.total, 0);
  const totalItems = filtered.reduce((sum, s) => sum + (s.items?.length || 0), 0);
  const avgOrder = filtered.length > 0 ? totalRevenue / filtered.length : 0;

  const [expandedId, setExpandedId] = useState(null);

  return (
    <div style={s.page}>

      {/* Header */}
      <div style={s.header}>
        <div>
          <div style={s.breadcrumb}>Reports</div>
          <h1 style={s.title}>Sales History</h1>
        </div>
        <div style={s.dateChip}>
          📅 {new Date().toLocaleDateString("en-US", {
            weekday: "long", year: "numeric",
            month: "long", day: "numeric",
          })}
        </div>
      </div>

      {/* KPI Row */}
      <div style={s.kpiRow}>
        <div style={s.kpiCard("#6366f1", "#1e1b4b")}>
          <div style={s.kpiIcon}>🧾</div>
          <div>
            <div style={s.kpiVal}>{filtered.length}</div>
            <div style={s.kpiLbl}>Total Transactions</div>
          </div>
        </div>
        <div style={s.kpiCard("#10b981", "#052e16")}>
          <div style={s.kpiIcon}>💰</div>
          <div>
            <div style={{ ...s.kpiVal, fontSize: 20 }}>{formatCurrency(totalRevenue)}</div>
            <div style={s.kpiLbl}>Total Revenue</div>
          </div>
        </div>
        <div style={s.kpiCard("#f59e0b", "#1c1917")}>
          <div style={s.kpiIcon}>📦</div>
          <div>
            <div style={s.kpiVal}>{totalItems}</div>
            <div style={s.kpiLbl}>Items Sold</div>
          </div>
        </div>
        <div style={s.kpiCard("#8b5cf6", "#1e1a2e")}>
          <div style={s.kpiIcon}>📈</div>
          <div>
            <div style={{ ...s.kpiVal, fontSize: 20 }}>{formatCurrency(avgOrder)}</div>
            <div style={s.kpiLbl}>Avg. Order Value</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={s.filtersRow}>
        {/* Search */}
        <div style={s.searchWrap}>
          <span style={s.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search by cashier, product, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={s.searchInput}
            onFocus={e => e.target.style.borderColor = "#6366f1"}
            onBlur={e => e.target.style.borderColor = "#1e293b"}
          />
        </div>

        {/* Date Filter Pills */}
        <div style={s.pillRow}>
          {[
            { key: "all", label: "All Time" },
            { key: "today", label: "Today" },
            { key: "week", label: "This Week" },
            { key: "month", label: "This Month" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setDateFilter(key)}
              style={{
                ...s.pill,
                ...(dateFilter === key ? s.pillActive : {}),
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={s.tableCard}>
        <div style={s.tableTop}>
          <div>
            <div style={s.tableTitle}>Transactions</div>
            <div style={s.tableSub}>{filtered.length} records found</div>
          </div>
        </div>

        {loading ? (
          <div style={s.loadWrap}>
            <div style={s.spinner} />
            <p style={{ color: "#475569", marginTop: 12, fontSize: 13 }}>
              Loading sales history...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={s.emptyWrap}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🧾</div>
            <div style={{ color: "#475569", fontSize: 15, fontWeight: 600 }}>
              No transactions found
            </div>
            <div style={{ color: "#334155", fontSize: 13, marginTop: 4 }}>
              Try changing the search or date filter
            </div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={s.table}>
              <thead>
                <tr>
                  {["#", "Date & Time", "Cashier", "Items", "Total", "Status", ""].map((h) => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((sale, i) => (
                  <>
                    <tr
                      key={sale._id}
                      style={s.tr}
                      onMouseEnter={e => e.currentTarget.style.background = "#0f172a"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <td style={{ ...s.td, color: "#334155" }}>{i + 1}</td>
                      <td style={s.td}>
                        <div style={{ fontWeight: 500, color: "#cbd5e1", fontSize: 13 }}>
                          {new Date(sale.createdAt).toLocaleDateString("en-US", {
                            month: "short", day: "numeric", year: "numeric",
                          })}
                        </div>
                        <div style={{ color: "#475569", fontSize: 12, marginTop: 2 }}>
                          {new Date(sale.createdAt).toLocaleTimeString("en-US", {
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </div>
                      </td>
                      <td style={s.td}>
                        <div style={s.cashierChip}>
                          <div style={s.avatar}>
                            {sale.user?.name?.charAt(0).toUpperCase() || "?"}
                          </div>
                          <span style={{ color: "#94a3b8", fontSize: 13 }}>
                            {sale.user?.name || "—"}
                          </span>
                        </div>
                      </td>
                      <td style={s.td}>
                        <span style={s.itemsBadge}>
                          {sale.items?.length || 0} item(s)
                        </span>
                      </td>
                      <td style={{ ...s.td, color: "#10b981", fontWeight: 700, fontSize: 15 }}>
                        {formatCurrency(sale.total)}
                      </td>
                      <td style={s.td}>
                        <span style={s.statusBadge}>✓ Completed</span>
                      </td>
                      <td style={s.td}>
                        <button
                          style={s.expandBtn}
                          onClick={() => setExpandedId(expandedId === sale._id ? null : sale._id)}
                          onMouseEnter={e => e.currentTarget.style.background = "rgba(99,102,241,0.15)"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                          {expandedId === sale._id ? "▲ Hide" : "▼ Details"}
                        </button>
                      </td>
                    </tr>

                    {/* Expanded Row */}
                    {expandedId === sale._id && (
                      <tr key={`${sale._id}-expanded`}>
                        <td colSpan={7} style={s.expandedTd}>
                          <div style={s.expandedBox}>
                            <div style={s.expandedTitle}>Order Details</div>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                              <thead>
                                <tr>
                                  {["Product", "Price", "Qty", "Subtotal"].map((h) => (
                                    <th key={h} style={s.expandedTh}>{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {sale.items?.map((item, j) => (
                                  <tr key={j}>
                                    <td style={s.expandedTd2}>{item.name}</td>
                                    <td style={s.expandedTd2}>{formatCurrency(item.price)}</td>
                                    <td style={s.expandedTd2}>{item.quantity}</td>
                                    <td style={{ ...s.expandedTd2, color: "#10b981", fontWeight: 600 }}>
                                      {formatCurrency(item.subtotal)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            <div style={s.expandedTotal}>
                              Total: <span style={{ color: "#10b981" }}>{formatCurrency(sale.total)}</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
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
  dateChip: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: 10,
    padding: "10px 18px",
    fontSize: 13,
    color: "#64748b",
    fontWeight: 500,
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
  filtersRow: {
    display: "flex",
    gap: 12,
    marginBottom: 20,
    flexWrap: "wrap",
    alignItems: "center",
  },
  searchWrap: { position: "relative", flex: 1, minWidth: 240 },
  searchIcon: {
    position: "absolute",
    left: 12,
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: 13,
  },
  searchInput: {
    width: "100%",
    background: "#0d1526",
    border: "1px solid #1e293b",
    borderRadius: 10,
    padding: "11px 14px 11px 36px",
    color: "#f1f5f9",
    fontSize: 13,
    outline: "none",
    boxSizing: "border-box",
    transition: "border 0.2s",
  },
  pillRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  pill: {
    padding: "8px 16px",
    borderRadius: 20,
    border: "1px solid #1e293b",
    background: "transparent",
    color: "#64748b",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.15s",
  },
  pillActive: {
    background: "rgba(99,102,241,0.15)",
    border: "1px solid rgba(99,102,241,0.4)",
    color: "#a5b4fc",
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
  },
  tableTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: "#f1f5f9",
    marginBottom: 2,
  },
  tableSub: { fontSize: 12, color: "#475569" },
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
  emptyWrap: {
    textAlign: "center",
    padding: "60px 0",
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
  },
  tr: { transition: "background 0.15s", cursor: "default" },
  cashierChip: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  avatar: {
    width: 28, height: 28,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 700,
    color: "#fff",
    flexShrink: 0,
  },
  itemsBadge: {
    background: "#1e293b",
    color: "#64748b",
    fontSize: 11,
    padding: "3px 10px",
    borderRadius: 20,
    fontWeight: 600,
  },
  statusBadge: {
    background: "rgba(16,185,129,0.1)",
    color: "#10b981",
    border: "1px solid rgba(16,185,129,0.2)",
    fontSize: 11,
    padding: "3px 10px",
    borderRadius: 20,
    fontWeight: 600,
  },
  expandBtn: {
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
  expandedTd: {
    padding: "0 20px 16px",
    borderBottom: "1px solid #0f172a",
  },
  expandedBox: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: 10,
    padding: "16px",
  },
  expandedTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: 12,
  },
  expandedTh: {
    textAlign: "left",
    padding: "6px 12px",
    fontSize: 11,
    color: "#334155",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    borderBottom: "1px solid #1e293b",
  },
  expandedTd2: {
    padding: "8px 12px",
    fontSize: 13,
    color: "#94a3b8",
    borderBottom: "1px solid #1e293b22",
  },
  expandedTotal: {
    textAlign: "right",
    marginTop: 12,
    fontSize: 14,
    fontWeight: 700,
    color: "#f1f5f9",
  },
};