import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, MapPin, Pencil, Search, Trash2 } from "lucide-react";
import "../admin.css";

const initialCinemas = [
  { id: 1, name: "Cinema Phnom Penh", location: "Main City Center", halls: 4, seats: 520, status: "Active", icon: Building2 },
  { id: 2, name: "Cinema Riverside", location: "Riverside District", halls: 6, seats: 780, status: "Active", icon: Building2 },
  { id: 3, name: "Cinema Siem Reap", location: "Heritage Walk", halls: 3, seats: 330, status: "Active", icon: Building2 },
  { id: 4, name: "Cinema Olympia", location: "Olympia Mall", halls: 0, seats: 0, status: "Inactive", icon: Building2 },
];

export default function CinemaList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = initialCinemas.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="kc-page">
      <div className="kc-head">
        <div>
          <h1>Cinemas</h1>
          <p className="kc-subtitle">Manage your cinema branches and their locations.</p>
        </div>
        <div className="kc-actions">
          <button className="kc-btn kc-btn-primary" onClick={() => navigate("/admin/cinemas/create")}>
            ＋ Add Cinema
          </button>
        </div>
      </div>

      <div className="kc-toolbar">
        <div className="kc-search">
          <span><Search size={16} /></span>
          <input placeholder="Search cinemas..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="kc-card">
        <div className="kc-table-wrap">
          <table className="kc-table">
            <thead>
              <tr>
                <th>Cinema</th>
                <th>Location</th>
                <th>Halls</th>
                <th>Total Seats</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div className="kc-cell-user">
                      <div className="kc-avatar"><c.icon size={18} /></div>
                      <div>
                        <div className="kc-cell-main">{c.name}</div>
                        <div className="kc-cell-sub">CIN-{String(c.id).padStart(3, "0")}</div>
                      </div>
                    </div>
                  </td>
                  <td><MapPin size={13} /> {c.location}</td>
                  <td>{c.halls}</td>
                  <td>{c.seats.toLocaleString()}</td>
                  <td>
                    <span className={`kc-badge ${c.status === "Active" ? "kc-badge-green" : "kc-badge-gray"}`}>
                      {c.status}
                    </span>
                  </td>
                  <td>
                    <div className="kc-actions-cell">
                      <button className="kc-icon-btn edit" title="Edit" onClick={() => navigate(`/admin/cinemas/${c.id}/edit`)}><Pencil size={16} /></button>
                      <button className="kc-icon-btn delete" title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="kc-empty">
                      <div className="kc-empty-icon"><Building2 size={32} /></div>
                      <p>No cinemas found.</p>
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
