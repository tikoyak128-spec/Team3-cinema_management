import "./staff.css";
import { CircleCheck, Clock, Ticket, Users, Wallet } from "lucide-react";

const stats = [
  { label: "Bookings Today", value: "12", icon: Ticket, color: "#e50914" },
  { label: "Tickets Scanned", value: "8", icon: CircleCheck, color: "#22c55e" },
  { label: "Active Customers", value: "24", icon: Users, color: "#60a5fa" },
  { label: "Revenue Today", value: "$60", icon: Wallet, color: "#eab308" },
];

const recentBookings = [
  { customer: "Sok Vannak", movie: "The Last Emperor", seats: ["A3", "A4"], time: "14:00", status: "Confirmed" },
  { customer: "Dara Kem", movie: "City of Shadows", seats: ["B7", "B8"], time: "16:30", status: "Pending" },
  { customer: "Khuon Srey", movie: "Golden Dawn", seats: ["A1"], time: "19:00", status: "Confirmed" },
];

export default function Dashboard() {
  const statusBadge = (s) =>
    s === "Confirmed" ? "kc-badge-green" : "kc-badge-yellow";

  return (
    <div className="kc-page">
      <div className="kc-head">
        <div>
          <h1>Staff Dashboard</h1>
          <p className="kc-subtitle">Today's overview and recent bookings.</p>
        </div>
      </div>

      <div className="kc-stats">
        {stats.map((s) => (
          <div className="kc-stat" key={s.label}>
            <span className="kc-stat-icon"><s.icon size={22} /></span>
            <div className="kc-stat-label">{s.label}</div>
            <div className="kc-stat-value" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="kc-card">
        <h2 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "18px" }}>Recent Bookings</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {recentBookings.map((b, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "16px", background: "#181818", borderRadius: "12px", border: "1px solid #272727",
              flexWrap: "wrap", gap: "12px"
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: "15px" }}>{b.customer}</div>
                <div style={{ fontSize: "13px", color: "#a0a0a0", marginTop: "4px" }}>
                  {b.movie} · {b.seats.join(", ")} · <Clock size={13} /> {b.time}
                </div>
              </div>
              <span className={`kc-badge ${statusBadge(b.status)}`}>{b.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}