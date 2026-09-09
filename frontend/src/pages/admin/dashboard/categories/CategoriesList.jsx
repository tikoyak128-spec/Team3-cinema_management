import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bomb, Heart, PartyPopper, Pencil, Rocket, Search, Tag, Theater, Trash2 } from "lucide-react";
import api from "../../../../api/client";
import "../admin.css";

const iconMap = { Bomb, Theater, PartyPopper, Heart, Rocket };

export default function CategoriesList() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [confirmId, setConfirmId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { data } = await api.get("/categories");
        if (!cancelled) setCategories(data);
      } catch (err) {
        if (!cancelled) setError(err?.response?.data?.message || "Failed to load categories.");
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
      await api.delete(`/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setConfirmId(null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete category.");
    }
  };

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="kc-page">
      <div className="kc-head">
        <div>
          <h1>Categories</h1>
          <p className="kc-subtitle">Organize your movies by genre and category.</p>
        </div>
        <div className="kc-actions">
          <button className="kc-btn kc-btn-primary" onClick={() => navigate("/admin/categories/create")}>
            ＋ Add Category
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
          <input placeholder="Search categories..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="kc-card">
        {loading ? (
          <div className="kc-empty" style={{ padding: "40px" }}>
            <p>Loading categories...</p>
          </div>
        ) : (
          <div className="kc-table-wrap">
            <table className="kc-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => {
                  const Icon = iconMap[c.icon] || Tag;
                  return (
                    <tr key={c.id}>
                      <td>
                        <div className="kc-cell-user">
                          <div className="kc-avatar"><Icon size={18} /></div>
                          <div>
                            <div className="kc-cell-main">{c.name}</div>
                            <div className="kc-cell-sub">CAT-{String(c.id).padStart(3, "0")}</div>
                          </div>
                        </div>
                      </td>
                      <td className="kc-cell-sub">{c.description || "—"}</td>
                      <td>
                        <div className="kc-actions-cell">
                          <button className="kc-icon-btn edit" title="Edit" onClick={() => navigate(`/admin/categories/${c.id}/edit`)}><Pencil size={16} /></button>
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
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={3}>
                      <div className="kc-empty">
                        <div className="kc-empty-icon"><Tag size={32} /></div>
                        <p>No categories found.</p>
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
