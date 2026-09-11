import { useEffect, useState } from "react";
import {
  CalendarDays,
  Download,
  RotateCcw,
  Ticket,
  Users,
  Wallet,
} from "lucide-react";
import api from "../../../../api/client";
import { AreaChart, BarChart } from "./charts";
import "../admin.css";
import "./analytics.css";

const periods = ["Last 7 days", "Last 30 days", "Last quarter", "This year"];
const hasErrors = (data) =>
  !data ||
  !data.summary ||
  !Array.isArray(data.sales_summary) ||
  (data.revenue_trend && !Array.isArray(data.revenue_trend.values)) ||
  (data.occupancy_by_month && !Array.isArray(data.occupancy_by_month.values));
const periodParams = {
  "Last 7 days": "7",
  "Last 30 days": "30",
  "Last quarter": "quarter",
  "This year": "year",
};

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function Reports() {
  const [period, setPeriod] = useState("Last 7 days");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get("/reports", { params: { period: periodParams[period] } })
      .then(({ data: res }) => {
        if (!cancelled) setData(res);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [period]);

  if (loading) {
    return (
      <div className="kc-page">
        <div className="kc-head">
          <div>
            <h1>Reports</h1>
            <p className="kc-subtitle">Business and sales reports for record keeping.</p>
          </div>
        </div>
        <div className="kc-subtitle" style={{ padding: "40px 0" }}>
          Loading reports…
        </div>
      </div>
    );
  }

  if (hasErrors(data)) {
    return (
      <div className="kc-page">
        <div className="kc-head">
          <div>
            <h1>Reports</h1>
            <p className="kc-subtitle">Business and sales reports for record keeping.</p>
          </div>
        </div>
        <div className="kc-subtitle" style={{ padding: "40px 0" }}>
          No report data available yet.
        </div>
      </div>
    );
  }

  const summaryCards = [
    {
      label: "Total Revenue",
      value: money.format(data.summary.revenue.current),
      icon: Wallet,
      color: "#22c55e",
      sub: `${data.summary.revenue.pct >= 0 ? "+" : ""}${data.summary.revenue.pct}% vs previous`,
    },
    {
      label: "Total Bookings",
      value: data.summary.bookings.current.toLocaleString(),
      icon: Ticket,
      color: "#e50914",
      sub: `${data.summary.bookings.pct >= 0 ? "+" : ""}${data.summary.bookings.pct}% vs previous`,
    },
    {
      label: "Tickets Sold",
      value: data.summary.tickets.current.toLocaleString(),
      icon: Users,
      color: "#60a5fa",
      sub: `${data.summary.tickets.pct >= 0 ? "+" : ""}${data.summary.tickets.pct}% vs previous`,
    },
    {
      label: "Refunds",
      value: money.format(data.summary.refunds.current),
      icon: RotateCcw,
      color: "#eab308",
      sub: `${data.summary.refunds.pct >= 0 ? "+" : ""}${data.summary.refunds.pct}% vs previous`,
    },
  ];

  const salesRows = (data.sales_summary || []).map((r) => ({
    date: r.date,
    bookings: r.bookings,
    tickets: r.tickets,
    revenue: money.format(r.revenue),
    refunds: money.format(r.refunds),
    status: r.status,
  }));

  const notesList = [
    ["Peak hours", data.notes.peak_hours],
    ["Best performer", data.notes.best_performer],
    ["Top movie", data.notes.top_movie],
    ["Refunds", data.notes.refunds_note],
  ];

  const { revenue_trend: revenueTrend, occupancy_by_month: occupancy } = data;

  return (
    <div className="kc-page">
      <div className="kc-head">
        <div>
          <h1>Reports</h1>
          <p className="kc-subtitle">Business and sales reports for record keeping.</p>
        </div>
        <div className="kc-actions">
          <button className="kc-btn kc-btn-ghost">
            <CalendarDays size={16} /> Schedule
          </button>
          <button className="kc-btn kc-btn-primary">
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      <div className="kc-toolbar">
        <div className="kc-filters">
          <select className="kc-select" value={period} onChange={(e) => setPeriod(e.target.value)}>
            {periods.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
          <span className="kc-subtitle">Reporting period: {period}</span>
        </div>
      </div>

      <div className="an-stats">
        {summaryCards.map((s) => {
          const Icon = s.icon;
          return (
            <div className="an-stat" key={s.label}>
              <div className="an-stat-top">
                <span
                  className="an-stat-icon"
                  style={{ background: `${s.color}1f`, color: s.color }}
                >
                  <Icon size={20} />
                </span>
              </div>
              <div className="an-stat-value">{s.value}</div>
              <div className="an-stat-label">{s.label}</div>
              <div className="an-stat-sub">{s.sub}</div>
            </div>
          );
        })}
      </div>

      <div className="an-grid">
        <div className="an-grid-stack">
          <div className="an-card">
            <div className="an-card-head">
              <h3>Revenue Trend</h3>
              <span className="an-card-meta">
                <span className="dot" style={{ background: "#e50914" }} />
                {period}
              </span>
            </div>
            <div className="an-chart-wrap">
              <AreaChart
                labels={revenueTrend.labels}
                values={revenueTrend.values}
                gradientId="an-rev-grad"
                format={(v) => `$${(v / 1000).toFixed(1)}k`}
              />
            </div>
          </div>

          <div className="an-card">
            <div className="an-card-head">
              <h3>Occupancy by Month</h3>
              <span className="an-card-meta">%</span>
            </div>
            <div className="an-chart-wrap">
              <BarChart
                labels={occupancy.labels}
                values={occupancy.values}
                barColor="#60a5fa"
                format={(v) => `${v}%`}
              />
            </div>
          </div>
        </div>

        <div className="an-card">
          <div className="an-card-head">
            <h3>Notes</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {notesList.map(([t, d]) => (
              <div
                key={t}
                style={{
                  padding: "14px",
                  background: "#181818",
                  borderRadius: "12px",
                  border: "1px solid #232323",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: "13px", color: "#e50914", marginBottom: "4px" }}>
                  {t}
                </div>
                <div style={{ fontSize: "13px", color: "#a0a0a0", lineHeight: 1.5 }}>{d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="an-table-card">
        <div style={{ padding: "20px 20px 0" }}>
          <div className="an-card-head" style={{ marginBottom: 0 }}>
            <h3>Sales Summary</h3>
            <span className="an-card-meta">{period}</span>
          </div>
        </div>
        <div className="kc-table-wrap">
          <table className="kc-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Bookings</th>
                <th>Tickets</th>
                <th>Revenue</th>
                <th>Refunds</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {salesRows.map((r) => (
                <tr key={r.date}>
                  <td>{r.date}</td>
                  <td>{r.bookings}</td>
                  <td>{r.tickets}</td>
                  <td>{r.revenue}</td>
                  <td>{r.refunds}</td>
                  <td>
                    <span className={`kc-badge ${r.status === "Closed" ? "kc-badge-green" : "kc-badge-yellow"}`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}