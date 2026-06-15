import { useEffect, useState } from "react";
import api from "../services/api";
import { formatCurrency } from "../utils/currency";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from "recharts";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    todayRevenue: 0,
  });
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/dashboard/stats"),
      api.get("/sales"),
    ])
      .then(([statsRes, salesRes]) => {
        setStats(statsRes.data);
        setSales(salesRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getLast7DaysData = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const label = date.toLocaleDateString("en-US", { weekday: "short" });
      const daySales = sales.filter((sale) => {
        const saleDate = new Date(sale.createdAt);
        return saleDate.toDateString() === date.toDateString();
      });
      const revenue = daySales.reduce((sum, s) => sum + s.total, 0);
      days.push({ day: label, revenue: parseFloat(revenue.toFixed(2)), count: daySales.length });
    }
    return days;
  };

  const recentSales = sales.slice(0, 6);
  const chartData = getLast7DaysData();
  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);

  if (loading) {
    return (
      <div style={s.loadWrap}>
        <div style={s.loadCard}>
          <div style={s.loadSpinner} />
          <p style={{ color: "#94a3b8", marginTop: 16, fontSize: 14 }}>
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>

      {/* Page Header */}
      <div style={s.pageHeader}>
        <div>
          <div style={s.pageBreadcrumb}>Overview</div>
          <h1 style={s.pageTitle}>Dashboard</h1>
        </div>
        <div style={s.dateChip}>
          <span style={{ fontSize: 14 }}>📅</span>
          {new Date().toLocaleDateString("en-US", {
            weekday: "long", year: "numeric",
            month: "long", day: "numeric",
          })}
        </div>
      </div>

      {/* KPI Cards */}
      <div style={s.kpiGrid}>

        <div style={{ ...s.kpiCard, background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)", border: "1px solid #4338ca" }}>
          <div style={s.kpiTop}>
            <div style={{ ...s.kpiIconBox, background: "rgba(99,102,241,0.2)" }}>
              <span style={{ fontSize: 22 }}>📦</span>
            </div>
            <span style={{ ...s.kpiBadge, color: "#a5b4fc", background: "rgba(99,102,241,0.15)" }}>Inventory</span>
          </div>
          <div style={s.kpiValue}>{stats.totalProducts}</div>
          <div style={s.kpiLabel}>Total Products</div>
          <div style={s.kpiBar("#6366f1")} />
        </div>

        <div style={{ ...s.kpiCard, background: "linear-gradient(135deg, #052e16 0%, #14532d 100%)", border: "1px solid #166534" }}>
          <div style={s.kpiTop}>
            <div style={{ ...s.kpiIconBox, background: "rgba(16,185,129,0.2)" }}>
              <span style={{ fontSize: 22 }}>🧾</span>
            </div>
            <span style={{ ...s.kpiBadge, color: "#6ee7b7", background: "rgba(16,185,129,0.15)" }}>Transactions</span>
          </div>
          <div style={s.kpiValue}>{stats.totalSales}</div>
          <div style={s.kpiLabel}>Total Sales</div>
          <div style={s.kpiBar("#10b981")} />
        </div>

        <div style={{ ...s.kpiCard, background: "linear-gradient(135deg, #1c1917 0%, #292524 100%)", border: "1px solid #92400e" }}>
          <div style={s.kpiTop}>
            <div style={{ ...s.kpiIconBox, background: "rgba(245,158,11,0.2)" }}>
              <span style={{ fontSize: 22 }}>💰</span>
            </div>
            <span style={{ ...s.kpiBadge, color: "#fcd34d", background: "rgba(245,158,11,0.15)" }}>Today</span>
          </div>
          <div style={{ ...s.kpiValue, fontSize: 26 }}>{formatCurrency(stats.todayRevenue)}</div>
          <div style={s.kpiLabel}>Today's Revenue</div>
          <div style={s.kpiBar("#f59e0b")} />
        </div>

        <div style={{ ...s.kpiCard, background: "linear-gradient(135deg, #1e1a2e 0%, #2d1f4e 100%)", border: "1px solid #7c3aed" }}>
          <div style={s.kpiTop}>
            <div style={{ ...s.kpiIconBox, background: "rgba(139,92,246,0.2)" }}>
              <span style={{ fontSize: 22 }}>📈</span>
            </div>
            <span style={{ ...s.kpiBadge, color: "#c4b5fd", background: "rgba(139,92,246,0.15)" }}>All Time</span>
          </div>
          <div style={{ ...s.kpiValue, fontSize: 22 }}>{formatCurrency(totalRevenue)}</div>
          <div style={s.kpiLabel}>Total Revenue</div>
          <div style={s.kpiBar("#8b5cf6")} />
        </div>

      </div>

      {/* Charts */}
      <div style={s.chartsRow}>

        <div style={s.chartCard}>
          <div style={s.chartHeader}>
            <div>
              <div style={s.chartTitle}>Revenue Trend</div>
              <div style={s.chartSub}>Last 7 days performance</div>
            </div>
            <div style={{ ...s.chartBadge, color: "#a5b4fc", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
              Area Chart
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [formatCurrency(v), "Revenue"]} />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} fill="url(#grad1)" dot={{ fill: "#6366f1", r: 3 }} activeDot={{ r: 5, fill: "#818cf8" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={s.chartCard}>
          <div style={s.chartHeader}>
            <div>
              <div style={s.chartTitle}>Sales Volume</div>
              <div style={s.chartSub}>Transactions per day</div>
            </div>
            <div style={{ ...s.chartBadge, color: "#6ee7b7", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
              Bar Chart
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} width={30} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [v, "Sales"]} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={40}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={i === chartData.length - 1 ? "#10b981" : "#134e3a"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* Recent Sales */}
      <div style={s.tableCard}>
        <div style={s.tableHeader}>
          <div>
            <div style={s.chartTitle}>Recent Transactions</div>
            <div style={s.chartSub}>Latest sales activity</div>
          </div>
          <div style={{ ...s.chartBadge, color: "#fcd34d", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}>
            {sales.length} total
          </div>
        </div>

        {recentSales.length === 0 ? (
          <div style={s.emptyState}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🧾</div>
            <div style={{ color: "#475569", fontSize: 15, fontWeight: 500 }}>No transactions yet</div>
            <div style={{ color: "#334155", fontSize: 13, marginTop: 4 }}>Sales will appear here after checkout</div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={s.table}>
              <thead>
                <tr>
                  {["#", "Date & Time", "Cashier", "Items", "Total", "Status"].map((h) => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentSales.map((sale, i) => (
                  <tr key={sale._id} style={s.tr}
                    onMouseEnter={e => e.currentTarget.style.background = "#0f172a"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ ...s.td, color: "#475569" }}>#{i + 1}</td>
                    <td style={s.td}>
                      {new Date(sale.createdAt).toLocaleDateString("en-US", {
                        month: "short", day: "numeric",
                      })}{" "}
                      <span style={{ color: "#475569" }}>
                        {new Date(sale.createdAt).toLocaleTimeString("en-US", {
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </span>
                    </td>
                    <td style={s.td}>
                      <div style={s.cashierChip}>
                        <div style={s.cashierAvatar}>
                          {sale.user?.name?.charAt(0).toUpperCase()}
                        </div>
                        {sale.user?.name || "—"}
                      </div>
                    </td>
                    <td style={s.td}>
                      <span style={s.itemBadge}>{sale.items?.length || 0} item(s)</span>
                    </td>
                    <td style={{ ...s.td, color: "#10b981", fontWeight: 700, fontSize: 15 }}>
                      {formatCurrency(sale.total)}
                    </td>
                    <td style={s.td}>
                      <span style={s.statusBadge}>✓ Completed</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

const tooltipStyle = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: 8,
  color: "#f1f5f9",
  fontSize: 13,
  boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
};

const s = {
  page: {
    background: "#080d1a",
    minHeight: "100vh",
    padding: "32px 36px",
    color: "#f1f5f9",
  },
  loadWrap: {
    background: "#080d1a",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  loadCard: {
    textAlign: "center",
    padding: 40,
  },
  loadSpinner: {
    width: 44, height: 44,
    border: "3px solid #1e293b",
    borderTop: "3px solid #6366f1",
    borderRadius: "50%",
    margin: "0 auto",
    animation: "spin 0.8s linear infinite",
  },
  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 32,
    flexWrap: "wrap",
    gap: 12,
  },
  pageBreadcrumb: {
    fontSize: 12,
    color: "#6366f1",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    marginBottom: 4,
  },
  pageTitle: {
    fontSize: 32,
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
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16,
    marginBottom: 24,
  },
  kpiCard: {
    borderRadius: 16,
    padding: "22px 24px",
    position: "relative",
    overflow: "hidden",
    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
  },
  kpiTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  kpiIconBox: {
    width: 48, height: 48,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  kpiBadge: {
    fontSize: 11,
    fontWeight: 600,
    padding: "3px 10px",
    borderRadius: 20,
    letterSpacing: "0.05em",
  },
  kpiValue: {
    fontSize: 32,
    fontWeight: 800,
    color: "#f8fafc",
    letterSpacing: "-0.03em",
    marginBottom: 4,
  },
  kpiLabel: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: 500,
    marginBottom: 16,
  },
  kpiBar: (color) => ({
    height: 3,
    background: `linear-gradient(90deg, ${color}, transparent)`,
    borderRadius: 2,
    opacity: 0.6,
  }),
  chartsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: 16,
    marginBottom: 24,
  },
  chartCard: {
    background: "#0d1526",
    border: "1px solid #1e293b",
    borderRadius: 16,
    padding: "22px 24px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
  },
  chartHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: "#f1f5f9",
    marginBottom: 2,
  },
  chartSub: {
    fontSize: 12,
    color: "#475569",
  },
  chartBadge: {
    fontSize: 11,
    fontWeight: 600,
    padding: "4px 10px",
    borderRadius: 20,
  },
  tableCard: {
    background: "#0d1526",
    border: "1px solid #1e293b",
    borderRadius: 16,
    padding: "22px 24px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
  },
  tableHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "10px 16px",
    fontSize: 11,
    color: "#334155",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontWeight: 700,
    borderBottom: "1px solid #1e293b",
  },
  td: {
    padding: "14px 16px",
    fontSize: 13,
    color: "#94a3b8",
    borderBottom: "1px solid #0f172a",
    transition: "background 0.15s",
  },
  tr: {
    transition: "background 0.15s",
    cursor: "default",
  },
  cashierChip: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  cashierAvatar: {
    width: 26, height: 26,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    fontWeight: 700,
    color: "#fff",
  },
  itemBadge: {
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
  emptyState: {
    textAlign: "center",
    padding: "48px 0",
  },
};