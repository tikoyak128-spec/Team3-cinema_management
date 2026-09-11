import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, DoorOpen, Pencil, Search, Trash2 } from "lucide-react";
import api from "../../../../api/client";
import "../admin.css";

export default function RoomList() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [confirmId, setConfirmId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { data } = await api.get("/rooms");
        if (!cancelled) setRooms(data);
      } catch (err) {
        if (!cancelled) setError(err?.response?.data?.message || "Failed to load rooms.");
      }
      if (!cancelled) setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/rooms/${id}`);
      setRooms((prev) => prev.filter((r) => r.id !== id));
      setConfirmId(null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete room.");
    }
  };

  const filtered = rooms.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      (r.cinema?.name || "").toLowerCase().includes(q)
    );
  });

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

      {error && (
        <div className="kc-error-banner" style={styles.banner}>
          {error}
          <button onClick={() => setError("")} style={styles.bannerClose}>×</button>
        </div>
      )}

      <div className="kc-toolbar">
        <div className="kc-search">
          <span><Search size={16} /></span>
          <input placeholder="Search rooms..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="kc-card">
        {loading ? (
          <div className="kc-empty" style={{ padding: "40px" }}>
            <p>Loading rooms...</p>
          </div>
        ) : (
          <div className="kc-table-wrap">
            <table className="kc-table">
              <thead>
                <tr>
                  <th>Room</th>
                  <th>Cinema</th>
                  <th>Capacity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div className="kc-cell-user">
                        <div className="kc-avatar"><DoorOpen size={18} /></div>
                        <div>
                          <div className="kc-cell-main">{r.name}</div>
                          <div className="kc-cell-sub">RM-{String(r.id).padStart(3, "0")}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="kc-detail"><Building2 size={12} /> {r.cinema?.name || "—"}</span>
                    </td>
                    <td>{r.total_seats} seats</td>
                    <td>
                      <div className="kc-actions-cell">
                        <button className="kc-icon-btn edit" title="Edit" onClick={() => navigate(`/admin/rooms/${r.id}/edit`)}><Pencil size={16} /></button>
                        {confirmId === r.id ? (
                          <div className="kc-actions-cell">
                            <button className="kc-btn kc-btn-danger kc-btn-sm" onClick={() => handleDelete(r.id)}>Confirm</button>
                            <button className="kc-btn kc-btn-ghost kc-btn-sm" onClick={() => setConfirmId(null)}>Cancel</button>
                          </div>
                        ) : (
                          <button className="kc-icon-btn delete" title="Delete" onClick={() => setConfirmId(r.id)}><Trash2 size={16} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4}>
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
        )}
      </div>
    </div>
  );
}

const styles = {
  banner: {
    backgroundColor: "rgba(229,9,20,0.12)",
    border: "1px solid rgba(229,9,20,0.4)",
    color: "#ff6b6b",
    fontSize: "13px",
    padding: "10px 14px",
    borderRadius: "10px",
    marginBottom: "16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bannerClose: {
    background: "none",
    border: "none",
    color: "#ff6b6b",
    fontSize: "18px",
    cursor: "pointer",
    lineHeight: "1",
  },
}