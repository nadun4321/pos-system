import { useEffect, useState } from "react";
import api from "../services/api";
import { formatCurrency } from "../utils/currency";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    todayRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/dashboard/stats")
      .then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4">
        <i className="bi bi-speedometer2 me-2"></i>Dashboard
      </h2>

      <div className="row g-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="stat-icon bg-primary bg-opacity-10 text-primary rounded p-3 me-3">
                  <i className="bi bi-box-seam fs-3"></i>
                </div>
                <div>
                  <p className="text-muted mb-0 small">Total Products</p>
                  <h3 className="mb-0">{stats.totalProducts}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="stat-icon bg-success bg-opacity-10 text-success rounded p-3 me-3">
                  <i className="bi bi-receipt fs-3"></i>
                </div>
                <div>
                  <p className="text-muted mb-0 small">Total Sales</p>
                  <h3 className="mb-0">{stats.totalSales}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="stat-icon bg-warning bg-opacity-10 text-warning rounded p-3 me-3">
                  <i className="bi bi-currency-rupee fs-3"></i>
                </div>
                <div>
                  <p className="text-muted mb-0 small">Today's Revenue</p>
                  <h3 className="mb-0">{formatCurrency(stats.todayRevenue)}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
