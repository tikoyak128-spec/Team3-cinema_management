import { useState } from "react";
import { Armchair, CircleUser, MapPin, Search, Ticket } from "lucide-react";
import "../admin.css";

const initialBookings = [
  { id: 1, customer: "Sok Vannak", email: "sok@email.com", movie: "The Last Emperor", cinema: "Cinema Phnom Penh", seats: ["A3", "A4"], total: "$10.00", date: "2026-08-30", status: "Confirmed" },
  { id: 2, customer: "Dara Kem", email: "dara@email.com", movie: "City of Shadows", cinema: "Cinema Riverside", seats: ["B7", "B8", "B9"], total: "$21.00", date: "2026-08-30", status: "Pending" },
  { id: 3, customer: "Khuon Srey", email: "khuon@email.com", movie: "Golden Dawn", cinema: "Cinema Siem Reap", seats: ["A1"], total: "$5.00", date: "2026-08-29", status: "Confirmed" },
  { id: 4, customer: "Chantrea Em", email: "chan@email.com", movie: "Age of Wonders", cinema: "Cinema Riverside", seats: ["C2", "C3"], total: "$18.00", date: "2026-08-29", status: "Cancelled" },
  { id: 5, customer: "Heng Sokly", email: "sokly@email.com", movie: "Midnight Express", cinema: "Cinema Phnom Penh", seats: ["D5"], total: "$5.00", date: "2026-08-28", status: "Confirmed" },
];

export default function BookingList() {
  const [search, setSearch] = useState("");

  const filtered = initialBookings.filter(
    (b) =>
      b.customer.toLowerCase().includes(search.toLowerCase()) ||
      b.movie.toLowerCase().includes(search.toLowerCase())
  );

  const statusBadge = (s) =>
    s === "Confirmed" ? "kc-badge-green" : s === "Pending" ? "kc-badge-yellow" : "kc-badge-red";

  return (
    <div className="kc-page">
      <div className="kc-head">
        <div>
          <h1>Bookings</h1>
          <p className="kc-subtitle">View and manage all customer reservations.</p>
        </div>
        <div className="kc-actions">
          <span className="kc-subtitle">
            Total: <b style={{ color: "#f5f5f5" }}>{initialBookings.length}</b>
          </span>
        </div>
      </div>

      <div className="kc-toolbar">
<div className="kc-search">
            <span><Search size={16} /></span>
            <input placeholder="Search by customer or movie..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
      </div>

      <div className="kc-card">
        <div className="kc-table-wrap">
          <table className="kc-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Movie</th>
                <th>Cinema</th>
                <th>Seats</th>
                <th>Total</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id}>
                  <td>
                    <div className="kc-cell-user">
                      <div className="kc-avatar"><CircleUser size={18} /></div>
                      <div>
                        <div className="kc-cell-main">{b.customer}</div>
                        <div className="kc-cell-sub">{b.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="kc-cell-main">{b.movie}</span></td>
                  <td><MapPin size={13} /> {b.cinema}</td>
                  <td>
                    <div className="kc-detail">
                      {b.seats.map((s) => (
                        <span key={s} className="kc-chip"><Armchair size={13} /> {s}</span>
                      ))}
                    </div>
                  </td>
                  <td><span className="kc-cell-main">{b.total}</span></td>
                  <td>{b.date}</td>
                  <td><span className={`kc-badge ${statusBadge(b.status)}`}>{b.status}</span></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <div className="kc-empty">
                      <div className="kc-empty-icon"><Ticket size={32} /></div>
                      <p>No bookings found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}