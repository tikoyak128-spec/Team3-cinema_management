import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, DoorOpen, MapPin, Pencil, Search, Trash2 } from "lucide-react";
import "../admin.css";

const initialShowtimes = [
  { id: 1, movie: "The Last Emperor", cinema: "Cinema Phnom Penh", room: "Hall 1", date: "2026-08-31", time: "14:00", price: "$5.00", status: "Active" },
  { id: 2, movie: "City of Shadows", cinema: "Cinema Riverside", room: "IMAX 1", date: "2026-08-31", time: "16:30", price: "$7.00", status: "Active" },
  { id: 3, movie: "Golden Dawn", cinema: "Cinema Siem Reap", room: "Hall 2", date: "2026-08-31", time: "19:00", price: "$5.00", status: "Active" },
  { id: 4, movie: "Age of Wonders", cinema: "Cinema Riverside", room: "VIP Suite", date: "2026-09-04", time: "20:30", price: "$9.00", status: "Sold Out" },
];

export default function ShowtimeList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = initialShowtimes.filter((s) =>
    s.movie.toLowerCase().includes(search.toLowerCase()) ||
    s.cinema.toLowerCase().includes(search.toLowerCase())
  );

  const statusBadge = (s) =>
    s === "Active" ? "kc-badge-green" : "kc-badge-red";

  return (
    <div className="kc-page">
      <div className="kc-head">
        <div>
          <h1>Showtimes</h1>
          <p className="kc-subtitle">Schedule when and where each movie is screened.</p>
        </div>
        <div className="kc-actions">
          <button className="kc-btn kc-btn-primary" onClick={() => navigate("/admin/showtimes/create")}>
            ＋ Add Showtime
          </button>
        </div>
      </div>

      <div className="kc-toolbar">
        <div className="kc-search">
          <span><Search size={16} /></span>
          <input placeholder="Search showtimes..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="kc-card">
        <div className="kc-table-wrap">
          <table className="kc-table">
            <thead>
              <tr>
                <th>Movie</th>
                <th>Cinema</th>
                <th>Room</th>
                <th>Date & Time</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td><span className="kc-cell-main">{s.movie}</span></td>
                  <td><MapPin size={13} /> {s.cinema}</td>
                  <td><span className="kc-chip"><DoorOpen size={13} /> {s.room}</span></td>
                  <td><span className="kc-chip"><Calendar size={13} /> {s.date} · <Clock size={13} /> {s.time}</span></td>
                  <td><span className="kc-cell-main">{s.price}</span></td>
                  <td><span className={`kc-badge ${statusBadge(s.status)}`}>{s.status}</span></td>
                  <td>
                    <div className="kc-actions-cell">
                      <button className="kc-icon-btn edit" title="Edit" onClick={() => navigate(`/admin/showtimes/${s.id}/edit`)}><Pencil size={16} /></button>
                      <button className="kc-icon-btn delete" title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <div className="kc-empty">
                      <div className="kc-empty-icon"><Clock size={32} /></div>
                      <p>No showtimes found.</p>
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
