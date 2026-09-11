import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, DoorOpen, MapPin, Pencil, Search, Trash2 } from "lucide-react";
import api from "../../../../api/client";
import "../admin.css";

const pad = (n) => String(n).padStart(2, "0");

const fmtDateTime = (value) => {
  if (!value) return { date: "—", time: "—" };
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    const s = String(value);
    return { date: s.slice(0, 10), time: s.slice(11, 16) };
  }
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
};

export default function ShowtimeList() {
  const navigate = useNavigate();
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [confirmId, setConfirmId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { data } = await api.get("/showtimes");
        if (!cancelled) setShowtimes(data);
      } catch (err) {
        if (!cancelled) setError(err?.response?.data?.message || "Failed to load showtimes.");
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
      await api.delete(`/showtimes/${id}`);
      setShowtimes((prev) => prev.filter((s) => s.id !== id));
      setConfirmId(null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete showtime.");
    }
  };

  const filtered = showtimes.filter((s) => {
    const q = search.toLowerCase();
    return (
      (s.movie?.title || "").toLowerCase().includes(q) ||
      (s.room?.cinema?.name || "").toLowerCase().includes(q)
    );
  });

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

      {error && (
        <div className="kc-error-banner" style={styles.banner}>
          {error}
          <button onClick={() => setError("")} style={styles.bannerClose}>×</button>
        </div>
      )}

      <div className="kc-toolbar">
        <div className="kc-search">
          <span><Search size={16} /></span>
          <input placeholder="Search showtimes..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="kc-card">
        {loading ? (
          <div className="kc-empty" style={{ padding: "40px" }}>
            <p>Loading showtimes...</p>
          </div>
        ) : (
          <div className="kc-table-wrap">
            <table className="kc-table">
              <thead>
                <tr>
                  <th>Movie</th>
                  <th>Cinema</th>
                  <th>Room</th>
                  <th>Date & Time</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
                  const { date, time } = fmtDateTime(s.start_time);
                  return (
                    <tr key={s.id}>
                      <td><span className="kc-cell-main">{s.movie?.title || "—"}</span></td>
                      <td><MapPin size={13} /> {s.room?.cinema?.name || "—"}</td>
                      <td><span className="kc-chip"><DoorOpen size={13} /> {s.room?.name || "—"}</span></td>
                      <td>
                        <span className="kc-chip">
                          <Calendar size={13} /> {date} · <Clock size={13} /> {time}
                        </span>
                      </td>
                      <td><span className="kc-cell-main">${Number(s.price).toFixed(2)}</span></td>
                      <td>
                        <div className="kc-actions-cell">
                          <button className="kc-icon-btn edit" title="Edit" onClick={() => navigate(`/admin/showtimes/${s.id}/edit`)}><Pencil size={16} /></button>
                          {confirmId === s.id ? (
                            <div className="kc-actions-cell">
                              <button className="kc-btn kc-btn-danger kc-btn-sm" onClick={() => handleDelete(s.id)}>Confirm</button>
                              <button className="kc-btn kc-btn-ghost kc-btn-sm" onClick={() => setConfirmId(null)}>Cancel</button>
                            </div>
                          ) : (
                            <button className="kc-icon-btn delete" title="Delete" onClick={() => setConfirmId(s.id)}><Trash2 size={16} /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6}>
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