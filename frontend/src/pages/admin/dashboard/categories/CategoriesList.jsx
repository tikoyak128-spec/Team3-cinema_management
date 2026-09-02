import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bomb, Heart, PartyPopper, Pencil, Rocket, Search, Tag, Theater, Trash2 } from "lucide-react";
import "../admin.css";

const initialCategories = [
  { id: 1, name: "Action", description: "High-energy films with stunts and combat.", movies: 12, icon: Bomb },
  { id: 2, name: "Drama", description: "Emotional and character-driven storytelling.", movies: 18, icon: Theater },
  { id: 3, name: "Comedy", description: "Light-hearted and humorous films.", movies: 9, icon: PartyPopper },
  { id: 4, name: "Romance", description: "Love stories and relationships.", movies: 7, icon: Heart },
  { id: 5, name: "Sci-Fi", description: "Futuristic and science-based themes.", movies: 6, icon: Rocket },
];

export default function CategoriesList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = initialCategories.filter((c) =>
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

      <div className="kc-toolbar">
        <div className="kc-search">
          <span><Search size={16} /></span>
          <input placeholder="Search categories..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="kc-card">
        <div className="kc-table-wrap">
          <table className="kc-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Description</th>
                <th>Movies</th>
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
                        <div className="kc-cell-sub">CAT-{String(c.id).padStart(3, "0")}</div>
                      </div>
                    </div>
                  </td>
                  <td className="kc-cell-sub">{c.description}</td>
                  <td><span className="kc-badge kc-badge-gray">{c.movies} movies</span></td>
                  <td>
                    <div className="kc-actions-cell">
                      <button className="kc-icon-btn edit" title="Edit" onClick={() => navigate(`/admin/categories/${c.id}/edit`)}><Pencil size={16} /></button>
                      <button className="kc-icon-btn delete" title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4}>
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
      </div>
    </div>
  );
}
