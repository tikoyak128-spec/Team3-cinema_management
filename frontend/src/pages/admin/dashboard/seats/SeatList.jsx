import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Armchair, Pencil, Search, Trash2 } from "lucide-react";
import "../admin.css";

const initialSeats = [
  { id: 1, row: "A", number: 1, room: "Hall 1", cinema: "Cinema Phnom Penh", type: "Standard", status: "Available" },
  { id: 2, row: "A", number: 2, room: "Hall 1", cinema: "Cinema Phnom Penh", type: "Standard", status: "Booked" },
  { id: 3, row: "B", number: 5, room: "IMAX 1", cinema: "Cinema Riverside", type: "Premium", status: "Available" },
  { id: 4, row: "C", number: 10, room: "VIP Suite", cinema: "Cinema Riverside", type: "VIP", status: "Maintenance" },
];

export default function SeatList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = initialSeats.filter((s) =>
    `${s.row}${s.number}`.toLowerCase().includes(search.toLowerCase()) ||
    s.room.toLowerCase().includes(search.toLowerCase())
  );

  const statusBadge = (s) =>
    s === "Available" ? "kc-badge-green" : s === "Booked" ? "kc-badge-red" : "kc-badge-yellow";

  return (
    <div className="kc-page">
      <div className="kc-head">
        <div>
          <h1>Seats</h1>
          <p className="kc-subtitle">Manage seat inventory across your screening rooms.</p>
        </div>
        <div className="kc-actions">
          <button className="kc-btn kc-btn-primary" onClick={() => navigate("/admin/seats/create")}>
            ＋ Add Seat
          </button>
        </div>
      </div>

      <div className="kc-toolbar">
        <div className="kc-search">
          <span><Search size={16} /></span>
          <input placeholder="Search seat or room..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="kc-card">
        <div className="kc-table-wrap">
          <table className="kc-table">
            <thead>
              <tr>
                <th>Seat</th>
                <th>Room</th>
                <th>Cinema</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div className="kc-cell-user">
                      <div className="kc-avatar"><Armchair size={18} /></div>
                      <div>
                        <div className="kc-cell-main">{s.row}{s.number}</div>
                        <div className="kc-cell-sub">SEAT-{String(s.id).padStart(3, "0")}</div>
                      </div>
                    </div>
                  </td>
                  <td>{s.room}</td>
                  <td>{s.cinema}</td>
                  <td><span className={`kc-badge ${s.type === "VIP" ? "kc-badge-yellow" : s.type === "Premium" ? "kc-badge-blue" : "kc-badge-gray"}`}>{s.type}</span></td>
                  <td><span className={`kc-badge ${statusBadge(s.status)}`}>{s.status}</span></td>
                  <td>
                    <div className="kc-actions-cell">
                      <button className="kc-icon-btn edit" title="Edit" onClick={() => navigate(`/admin/seats/${s.id}/edit`)}><Pencil size={16} /></button>
                      <button className="kc-icon-btn delete" title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="kc-empty">
                      <div className="kc-empty-icon"><Armchair size={32} /></div>
                      <p>No seats found.</p>
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
