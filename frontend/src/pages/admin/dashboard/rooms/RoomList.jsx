import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Armchair, DoorOpen, Film, FolderOpen, Pencil, Search, Trash2 } from "lucide-react";
import "../admin.css";

const initialRooms = [
  { id: 1, name: "Hall 1", cinema: "Cinema Phnom Penh", rows: 10, cols: 18, capacity: 180, type: "Standard", icon: DoorOpen },
  { id: 2, name: "IMAX 1", cinema: "Cinema Riverside", rows: 12, cols: 22, capacity: 264, type: "IMAX", icon: Film },
  { id: 3, name: "VIP Suite", cinema: "Cinema Riverside", rows: 4, cols: 6, capacity: 24, type: "VIP", icon: Armchair },
  { id: 4, name: "Hall 2", cinema: "Cinema Phnom Penh", rows: 10, cols: 18, capacity: 180, type: "Standard", icon: DoorOpen },
];

export default function RoomList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = initialRooms.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.cinema.toLowerCase().includes(search.toLowerCase())
  );

  const typeBadge = (t) =>
    t === "IMAX" ? "kc-badge-blue" : t === "VIP" ? "kc-badge-yellow" : "kc-badge-gray";

  return (
    <div className="kc-page">
      <div className="kc-head">
        <div>
          <h1>Rooms</h1>
          <p className="kc-subtitle">Manage the screening rooms inside each cinema.</p>
        </div>
        <div className="kc-actions">
          <button className="kc-btn kc-btn-primary" onClick={() => navigate("/admin/rooms/create")}>
            ＋ Add Room
          </button>
        </div>
      </div>

      <div className="kc-toolbar">
        <div className="kc-search">
          <span><Search size={16} /></span>
          <input placeholder="Search rooms..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="kc-card">
        <div className="kc-table-wrap">
          <table className="kc-table">
            <thead>
              <tr>
                <th>Room</th>
                <th>Cinema</th>
                <th>Layout</th>
                <th>Capacity</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="kc-cell-user">
                      <div className="kc-avatar"><r.icon size={18} /></div>
                      <div>
                        <div className="kc-cell-main">{r.name}</div>
                        <div className="kc-cell-sub">RM-{String(r.id).padStart(3, "0")}</div>
                      </div>
                    </div>
                  </td>
                  <td>{r.cinema}</td>
                  <td><span className="kc-chip"><FolderOpen size={13} /> {r.rows} × {r.cols}</span></td>
                  <td>{r.capacity} seats</td>
                  <td><span className={`kc-badge ${typeBadge(r.type)}`}>{r.type}</span></td>
                  <td>
                    <div className="kc-actions-cell">
                      <button className="kc-icon-btn edit" title="Edit" onClick={() => navigate(`/admin/rooms/${r.id}/edit`)}><Pencil size={16} /></button>
                      <button className="kc-icon-btn delete" title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="kc-empty">
                      <div className="kc-empty-icon"><DoorOpen size={32} /></div>
                      <p>No rooms found.</p>
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
