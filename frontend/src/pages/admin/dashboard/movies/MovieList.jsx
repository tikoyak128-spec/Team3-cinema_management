import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clapperboard, Pencil, Search, Tag, Trash2 } from "lucide-react";
import api from "../../../../api/client";
import "../admin.css";

const fmtDuration = (min) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h}h ${m ? `${m}m` : ""}`.trim() : `${m}m`;
};

const statusOf = (releaseDate) =>
  new Date(releaseDate) <= new Date() ? "Now Showing" : "Coming Soon";

export default function MovieList() {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [confirmId, setConfirmId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { data } = await api.get("/movies");
        if (!cancelled) setMovies(data);
      } catch (err) {
        if (!cancelled) setError(err?.response?.data?.message || "Failed to load movies.");
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
      await api.delete(`/movies/${id}`);
      setMovies((prev) => prev.filter((m) => m.id !== id));
      setConfirmId(null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete movie.");
    }
  };

  const filtered = movies.filter((m) => {
    const q = search.toLowerCase();
    const matchSearch =
      m.title.toLowerCase().includes(q) ||
      (m.category?.name || "").toLowerCase().includes(q);
    const matchStatus =
      statusFilter === "all" || statusOf(m.release_date) === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusBadge = (s) =>
    s === "Now Showing" ? "kc-badge-green" : "kc-badge-yellow";

  return (
    <div className="kc-page">
      <div className="kc-head">
        <div>
          <h1>Movies</h1>
          <p className="kc-subtitle">Manage your movie catalog, showtimes and availability.</p>
        </div>
        <div className="kc-actions">
          <button className="kc-btn kc-btn-primary" onClick={() => navigate("/admin/movies/create")}>
            ＋ Add Movie
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
          <input
            placeholder="Search by title or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="kc-filters">
          <select className="kc-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="Now Showing">Now Showing</option>
            <option value="Coming Soon">Coming Soon</option>
          </select>
        </div>
      </div>

      <div className="kc-card">
        {loading ? (
          <div className="kc-empty" style={{ padding: "40px" }}>
            <p>Loading movies...</p>
          </div>
        ) : (
          <div className="kc-table-wrap">
            <table className="kc-table">
              <thead>
                <tr>
                  <th>Movie</th>
                  <th>Category</th>
                  <th>Duration</th>
                  <th>Release Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => {
                  const status = statusOf(m.release_date);
                  return (
                    <tr key={m.id}>
                      <td>
                        <div className="kc-cell-user">
                          <div className="kc-thumb">
                            {m.poster_url ? (
                              <img src={m.poster_url} alt={m.title} style={styles.poster} />
                            ) : (
                              <Clapperboard size={18} />
                            )}
                          </div>
                          <div>
                            <div className="kc-cell-main">{m.title}</div>
                            <div className="kc-cell-sub">ID: MOV-{String(m.id).padStart(3, "0")}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="kc-chip"><Tag size={13} /> {m.category?.name || "—"}</span>
                      </td>
                      <td>{fmtDuration(m.duration)}</td>
                      <td>
                        <span className="kc-detail">
                          <Calendar size={12} /> {m.release_date}
                        </span>
                      </td>
                      <td><span className={`kc-badge ${statusBadge(status)}`}>{status}</span></td>
                      <td>
                        <div className="kc-actions-cell">
                          <button className="kc-icon-btn edit" title="Edit" onClick={() => navigate(`/admin/movies/${m.id}/edit`)}><Pencil size={16} /></button>
                          {confirmId === m.id ? (
                            <div className="kc-actions-cell">
                              <button className="kc-btn kc-btn-danger kc-btn-sm" onClick={() => handleDelete(m.id)}>Confirm</button>
                              <button className="kc-btn kc-btn-ghost kc-btn-sm" onClick={() => setConfirmId(null)}>Cancel</button>
                            </div>
                          ) : (
                            <button className="kc-icon-btn delete" title="Delete" onClick={() => setConfirmId(m.id)}><Trash2 size={16} /></button>
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
                        <div className="kc-empty-icon"><Clapperboard size={32} /></div>
                        <p>No movies found.</p>
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
  poster: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "8px",
  },
}