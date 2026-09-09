import { useState } from "react";
import {
  Clapperboard,
  Download,
  Ticket,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { AreaChart, DonutChart } from "./charts";
import "../admin.css";
import "./analytics.css";

const periods = ["This Week", "This Month", "This Year"];

const revenueSeries = {
  "This Week": {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    values: [34, 42, 38, 51, 60, 74, 86],
  },
  "This Month": {
    labels: ["Wk 1", "Wk 2", "Wk 3", "Wk 4", "Wk 5", "Wk 6", "Wk 7"],
    values: [152, 184, 221, 199, 264, 301, 348],
  },
  "This Year": {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    values: [1210, 1330, 1160, 1420, 1560, 1690, 1830],
  },
};

const kpis = [
  { label: "Total Revenue", value: "$48,290", delta: "+12.4%", up: true, icon: Wallet, color: "#22c55e" },
  { label: "Tickets Sold", value: "3,842", delta: "+8.1%", up: true, icon: Ticket, color: "#60a5fa" },
  { label: "Avg Occupancy", value: "72%", delta: "+3.2%", up: true, icon: Users, color: "#eab308" },
  { label: "Avg Ticket Price", value: "$12.57", delta: "-1.8%", up: false, icon: Clapperboard, color: "#e50914" },
];

const genres = [
  { name: "Action", value: 480, color: "#e50914" },
  { name: "Drama", value: 320, color: "#60a5fa" },
  { name: "Comedy", value: 210, color: "#eab308" },
  { name: "Romance", value: 140, color: "#22c55e" },
  { name: "Sci-Fi", value: 90, color: "#a78bfa" },
];

const cinemaBars = [
  { name: "Phnom Penh", value: 1240, color: "#e50914" },
  { name: "Riverside", value: 980, color: "#60a5fa" },
  { name: "Olympia", value: 820, color: "#eab308" },
  { name: "Siem Reap", value: 610, color: "#22c55e" },
];

const topFilms = [
  { rank: 1, title: "The Last Emperor", genre: "Action", revenue: "$12.8k", occ: 92, color: "#e50914" },
  { rank: 2, title: "City of Shadows", genre: "Thriller", revenue: "$9.6k", occ: 84, color: "#60a5fa" },
  { rank: 3, title: "Golden Dawn", genre: "Drama", revenue: "$7.6k", occ: 78, color: "#eab308" },
  { rank: 4, title: "Age of Wonders", genre: "Sci-Fi", revenue: "$5.9k", occ: 71, color: "#22c55e" },
  { rank: 5, title: "Midnight Express", genre: "Mystery", revenue: "$4.5k", occ: 64, color: "#a78bfa" },
];

const dailyBookings = [
  { date: "2026-08-28", bookings: 214, tickets: 302, occupancy: "68%", revenue: "$3,860", status: "Completed" },
  { date: "2026-08-29", bookings: 257, tickets: 368, occupancy: "74%", revenue: "$4,710", status: "Completed" },
  { date: "2026-08-30", bookings: 281, tickets: 405, occupancy: "79%", revenue: "$5,240", status: "Completed" },
  { date: "2026-08-31", bookings: 233, tickets: 341, occupancy: "71%", revenue: "$4,390", status: "Completed" },
  { date: "2026-09-01", bookings: 196, tickets: 278, occupancy: "63%", revenue: "$3,610", status: "Pending" },
];

export default function Analytics() {
  const [period, setPeriod] = useState("This Week");
  const series = revenueSeries[period];
  const total = 100;
  const maxBar = Math.max(...cinemaBars.map((c) => c.value));

  return (
    <div className="kc-page">
      <div className="kc-head">
        <div>
          <h1>Analytics</h1>
          <p className="kc-subtitle">Performance insights across all cinemas.</p>
        </div>
        <div className="kc-actions">
          <div className="an-periodtabs">
            {periods.map((p) => (
              <button
                key={p}
                className={`an-periodtab ${period === p ? "active" : ""}`}
                onClick={() => setPeriod(p)}
              >
                {p}
              </button>
            ))}
          </div>
          <button className="kc-btn kc-btn-primary">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      <div className="an-stats">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div className="an-stat" key={k.label}>
              <div className="an-stat-top">
                <span
                  className="an-stat-icon"
                  style={{ background: `${k.color}1f`, color: k.color }}
                >
                  <Icon size={20} />
                </span>
                <span className={`an-stat-delta ${k.up ? "up" : "down"}`}>
                  {k.up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {k.delta}
                </span>
              </div>
              <div className="an-stat-value">{k.value}</div>
              <div className="an-stat-label">{k.label}</div>
            </div>
          );
        })}
      </div>

      <div className="an-grid">
        <div className="an-card">
          <div className="an-card-head">
            <h3>Revenue Overview</h3>
            <span className="an-card-meta">
              <span className="dot" style={{ background: "#e50914" }} />
              {period} · USD
            </span>
          </div>
          <div className="an-chart-wrap">
            <AreaChart labels={series.labels} values={series.values} format={(v) => `$${v.toFixed(1)}k`} />
          </div>
        </div>

        <div className="an-card">
          <div className="an-card-head">
            <h3>Genre Share</h3>
          </div>
          <div className="an-donut-flex">
            <DonutChart data={genres} centerValue="1,240" centerLabel="Tickets" />
            <div className="an-legend">
              {genres.map((g) => (
                <div className="an-legend-item" key={g.name}>
                  <span className="an-legend-dot" style={{ background: g.color }} />
                  <span className="an-legend-name">{g.name}</span>
                  <span className="an-legend-pct">{Math.round((g.value / total) * 100)}%</span>
                  <span className="an-legend-value">{g.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="an-grid equal">
        <div className="an-card">
          <div className="an-card-head">
            <h3>Tickets by Cinema</h3>
            <span className="an-card-meta">{period}</span>
          </div>
          <div className="an-bars">
            {cinemaBars.map((c) => (
              <div className="an-bar-row" key={c.name}>
                <span className="an-bar-label">{c.name}</span>
                <div className="an-bar-track">
                  <div
                    className="an-bar-fill"
                    style={{ width: `${(c.value / maxBar) * 100}%`, background: c.color }}
                  />
                </div>
                <span className="an-bar-value">{c.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="an-card">
          <div className="an-card-head">
            <h3>Top Films</h3>
            <span className="an-card-meta">By revenue</span>
          </div>
          <div className="an-films">
            {topFilms.map((f) => (
              <div className="an-film-row" key={f.title}>
                <span className="an-film-rank">{f.rank}</span>
                <div className="an-film-main">
                  <div className="an-film-title">{f.title}</div>
                  <div className="an-film-genre">
                    {f.genre} · {f.revenue}
                  </div>
                </div>
                <div className="an-film-bars">
                  <span className="an-film-bar">
                    <span
                      className="an-film-bar-fill"
                      style={{ width: `${f.occ}%`, background: f.color, display: "block" }}
                    />
                  </span>
                  <span className="an-film-value">{f.occ}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="an-table-card">
        <div className="kc-table-wrap">
          <table className="kc-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Bookings</th>
                <th>Tickets</th>
                <th>Occupancy</th>
                <th>Revenue</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {dailyBookings.map((d) => (
                <tr key={d.date}>
                  <td>{d.date}</td>
                  <td>{d.bookings}</td>
                  <td>{d.tickets}</td>
                  <td>{d.occupancy}</td>
                  <td>{d.revenue}</td>
                  <td>
                    <span className={`kc-badge ${d.status === "Completed" ? "kc-badge-green" : "kc-badge-yellow"}`}>
                      {d.status}
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