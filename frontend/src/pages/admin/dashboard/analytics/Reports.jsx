import { useState } from "react";
import {
  CalendarDays,
  Download,
  RotateCcw,
  Ticket,
  Users,
  Wallet,
} from "lucide-react";
import { AreaChart, BarChart } from "./charts";
import "../admin.css";
import "./analytics.css";

const periods = ["Last 7 days", "Last 30 days", "Last quarter", "This year"];

const dailyRevenue = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  values: [4120, 5380, 4890, 6230, 7410, 8690, 9820],
};

const occupancyByCinema = {
  labels: ["J", "F", "M", "A", "M", "J"],
  values: [58, 64, 61, 71, 69, 78],
};

const summary = [
  { label: "Total Revenue", value: "$46,540", icon: Wallet, color: "#22c55e", sub: "+11.2% vs previous" },
  { label: "Total Bookings", value: "1,181", icon: Ticket, color: "#e50914", sub: "+8.4% vs previous" },
  { label: "Tickets Sold", value: "1,694", icon: Users, color: "#60a5fa", sub: "+9.1% vs previous" },
  { label: "Refunds", value: "$680", icon: RotateCcw, color: "#eab308", sub: "-2.3% vs previous" },
];

const salesRows = [
  { date: "2026-08-30", bookings: 281, tickets: 405, revenue: "$5,240", refunds: "$45", status: "Closed" },
  { date: "2026-08-29", bookings: 257, tickets: 368, revenue: "$4,710", refunds: "$60", status: "Closed" },
  { date: "2026-08-28", bookings: 214, tickets: 302, revenue: "$3,860", refunds: "$35", status: "Closed" },
  { date: "2026-08-27", bookings: 229, tickets: 331, revenue: "$4,160", refunds: "$50", status: "Closed" },
  { date: "2026-08-26", bookings: 200, tickets: 288, revenue: "$3,540", refunds: "$30", status: "Open" },
];

export default function Reports() {
  const [period, setPeriod] = useState("Last 7 days");

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
        {summary.map((s) => {
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
                labels={dailyRevenue.labels}
                values={dailyRevenue.values}
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
                labels={occupancyByCinema.labels}
                values={occupancyByCinema.values}
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
            {[
              ["Peak hours", "Friday–Sunday evening shows account for 62% of weekly revenue."],
              ["Best performer", "Legend Phnom Penh leads ticket sales with 1,240 tickets."],
              ["Top movie", "The Last Emperor remains the highest grossing title this period."],
              ["Refunds", "Most refunds occur within 2 hours before showtime."],
            ].map(([t, d]) => (
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