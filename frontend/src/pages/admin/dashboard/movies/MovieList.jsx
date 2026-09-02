import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clapperboard, Pencil, Search, Tag, Trash2 } from "lucide-react";
import "../admin.css";

const initialMovies = [
  { id: 1, title: "The Last Emperor", genre: "Drama", rating: "PG-13", duration: "2h 18m", category: "Drama", status: "Now Showing", poster: Clapperboard },
  { id: 2, title: "City of Shadows", genre: "Action", rating: "R", duration: "1h 52m", category: "Action", status: "Now Showing", poster: Clapperboard },
  { id: 3, title: "Golden Dawn", genre: "Romance", rating: "PG", duration: "2h 05m", category: "Romance", status: "Now Showing", poster: Clapperboard },
  { id: 4, title: "Age of Wonders", genre: "Fantasy", rating: "PG-13", duration: "2h 20m", category: "Fantasy", status: "Coming Soon", poster: Clapperboard },
  { id: 5, title: "The Far Horizon", genre: "Sci-Fi", rating: "PG-13", duration: "2h 12m", category: "Sci-Fi", status: "Coming Soon", poster: Clapperboard },
];

export default function MovieList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = initialMovies.filter((m) => {
    const matchSearch =
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.genre.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || m.status === statusFilter;
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

      <div className="kc-toolbar">
        <div className="kc-search">
          <span><Search size={16} /></span>
          <input
            placeholder="Search by title or genre..."
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
        <div className="kc-table-wrap">
          <table className="kc-table">
            <thead>
              <tr>
                <th>Movie</th>
                <th>Genre</th>
                <th>Rating</th>
                <th>Duration</th>
                <th>Category</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id}>
                  <td>
                    <div className="kc-cell-user">
                      <div className="kc-thumb"><m.poster size={18} /></div>
                      <div>
                        <div className="kc-cell-main">{m.title}</div>
                        <div className="kc-cell-sub">ID: MOV-{String(m.id).padStart(3, "0")}</div>
                      </div>
                    </div>
                  </td>
                  <td>{m.genre}</td>
                  <td><span className="kc-badge kc-badge-gray">{m.rating}</span></td>
                  <td>{m.duration}</td>
                  <td><span className="kc-chip"><Tag size={13} /> {m.category}</span></td>
                  <td><span className={`kc-badge ${statusBadge(m.status)}`}>{m.status}</span></td>
                  <td>
                    <div className="kc-actions-cell">
                      <button className="kc-icon-btn edit" title="Edit" onClick={() => navigate(`/admin/movies/${m.id}/edit`)}><Pencil size={16} /></button>
                      <button className="kc-icon-btn delete" title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7}>
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
      </div>
    </div>
  );
}
