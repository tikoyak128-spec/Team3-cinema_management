import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, MapPin, Pencil, Search, Trash2 } from "lucide-react";
import api from "../../../../api/client";
import "../admin.css";

const totalSeats = (rooms = []) =>
  rooms.reduce((sum, r) => sum + (Number(r.total_seats) || 0), 0);

export default function CinemaList() {
  const navigate = useNavigate();
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [confirmId, setConfirmId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { data } = await api.get("/cinemas");
        if (!cancelled) setCinemas(data);
      } catch (err) {
        if (!cancelled) setError(err?.response?.data?.message || "Failed to load cinemas.");
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
      await api.delete(`/cinemas/${id}`);
      setCinemas((prev) => prev.filter((c) => c.id !== id));
      setConfirmId(null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete cinema.");
    }
  };

  const filtered = cinemas.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.location || "").toLowerCase().includes(q)
    );
  });

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

      {error && (
        <div className="kc-error-banner" style={styles.banner}>
          {error}
          <button onClick={() => setError("")} style={styles.bannerClose}>×</button>
        </div>
      )}

      <div className="kc-toolbar">
        <div className="kc-search">
          <span><Search size={16} /></span>
          <input placeholder="Search cinemas..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="kc-card">
        {loading ? (
          <div className="kc-empty" style={{ padding: "40px" }}>
            <p>Loading cinemas...</p>
          </div>
        ) : (
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
                        <div className="kc-avatar"><Building2 size={18} /></div>
                        <div>
                          <div className="kc-cell-main">{c.name}</div>
                          <div className="kc-cell-sub">CIN-{String(c.id).padStart(3, "0")}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="kc-detail"><MapPin size={12} /> {c.location || "—"}</span>
                    </td>
                    <td>{c.halls ?? c.rooms?.length ?? 0}</td>
                    <td>{(c.seats ?? totalSeats(c.rooms)).toLocaleString()}</td>
                    <td>
                      <span className={`kc-badge ${c.status === "active" ? "kc-badge-green" : "kc-badge-gray"}`}>
                        {c.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className="kc-actions-cell">
                        <button className="kc-icon-btn edit" title="Edit" onClick={() => navigate(`/admin/cinemas/${c.id}/edit`)}><Pencil size={16} /></button>
                        {confirmId === c.id ? (
                          <div className="kc-actions-cell">
                            <button className="kc-btn kc-btn-danger kc-btn-sm" onClick={() => handleDelete(c.id)}>Confirm</button>
                            <button className="kc-btn kc-btn-ghost kc-btn-sm" onClick={() => setConfirmId(null)}>Cancel</button>
                          </div>
                        ) : (
                          <button className="kc-icon-btn delete" title="Delete" onClick={() => setConfirmId(c.id)}><Trash2 size={16} /></button>
                        )}
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