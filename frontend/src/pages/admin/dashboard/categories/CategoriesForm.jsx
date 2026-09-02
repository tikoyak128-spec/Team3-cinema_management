import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bomb, Ghost, Heart, PartyPopper, Rocket, Search, Theater, Trophy } from "lucide-react";
import "../admin.css";

const iconOptions = [
  { value: "Bomb", Icon: Bomb },
  { value: "Theater", Icon: Theater },
  { value: "PartyPopper", Icon: PartyPopper },
  { value: "Heart", Icon: Heart },
  { value: "Rocket", Icon: Rocket },
  { value: "Ghost", Icon: Ghost },
  { value: "Search", Icon: Search },
  { value: "Trophy", Icon: Trophy },
];

export default function CategoriesForm({ isEdit = false }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: isEdit ? "Action" : "",
    description: isEdit ? "High-energy films with stunts and combat." : "",
    icon: isEdit ? "Bomb" : iconOptions[0].value,
  });

  const selectedIcon = iconOptions.find((o) => o.value === form.icon);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/admin/categories");
  };

  return (
    <div className="kc-page">
      <div className="kc-head">
        <div>
          <h1>{isEdit ? "Edit Category" : "Add Category"}</h1>
          <p className="kc-subtitle">{isEdit ? "Update this category." : "Create a new movie category."}</p>
        </div>
      </div>

      <form className="kc-form-card" onSubmit={handleSubmit}>
        <div className="kc-form-grid">
          <div className="kc-field">
            <label className="kc-label">Category Name <span>*</span></label>
            <input className="kc-input" placeholder="e.g. Action" value={form.name} onChange={set("name")} required />
          </div>

          <div className="kc-field">
            <label className="kc-label">Icon</label>
            <div className="kc-icon-picker">
              <select className="kc-select-lg" value={form.icon} onChange={set("icon")}>
                {iconOptions.map((o) => <option key={o.value} value={o.value}>{o.value}</option>)}
              </select>
              {selectedIcon && (
                <span className="kc-icon-preview"><selectedIcon.Icon size={20} /></span>
              )}
            </div>
          </div>

          <div className="kc-field full">
            <label className="kc-label">Description</label>
            <textarea className="kc-textarea" placeholder="Short description of this category..." value={form.description} onChange={set("description")} />
          </div>

          <div className="kc-form-actions">
            <button type="submit" className="kc-btn kc-btn-primary">{isEdit ? "Save Changes" : "Create Category"}</button>
            <button type="button" className="kc-btn kc-btn-ghost" onClick={() => navigate("/admin/categories")}>Cancel</button>
          </div>
        </div>
      </form>
    </div>
  );
}