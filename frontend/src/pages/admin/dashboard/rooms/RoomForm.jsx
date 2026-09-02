import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../admin.css";

export default function RoomForm({ isEdit = false }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: isEdit ? "IMAX 1" : "",
    cinema: isEdit ? "Cinema Riverside" : "",
    type: isEdit ? "IMAX" : "Standard",
    rows: isEdit ? "12" : "10",
    cols: isEdit ? "22" : "18",
  });

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const capacity = (Number(form.rows) || 0) * (Number(form.cols) || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/admin/rooms");
  };

  return (
    <div className="kc-page">
      <div className="kc-head">
        <div>
          <h1>{isEdit ? "Edit Room" : "Add Room"}</h1>
          <p className="kc-subtitle">{isEdit ? "Update this screening room." : "Create a new screening room."}</p>
        </div>
      </div>

      <form className="kc-form-card" onSubmit={handleSubmit}>
        <div className="kc-form-grid">
          <div className="kc-field">
            <label className="kc-label">Room Name <span>*</span></label>
            <input className="kc-input" placeholder="e.g. Hall 1" value={form.name} onChange={set("name")} required />
          </div>

          <div className="kc-field">
            <label className="kc-label">Cinema</label>
            <select className="kc-select-lg" value={form.cinema} onChange={set("cinema")}>
              <option>Cinema Phnom Penh</option>
              <option>Cinema Riverside</option>
              <option>Cinema Siem Reap</option>
              <option>Cinema Olympia</option>
            </select>
          </div>

          <div className="kc-field">
            <label className="kc-label">Room Type</label>
            <select className="kc-select-lg" value={form.type} onChange={set("type")}>
              <option>Standard</option>
              <option>IMAX</option>
              <option>VIP</option>
              <option>3D</option>
            </select>
          </div>

          <div className="kc-field">
            <label className="kc-label">Rows</label>
            <input className="kc-input" type="number" min="1" value={form.rows} onChange={set("rows")} />
          </div>

          <div className="kc-field">
            <label className="kc-label">Columns (Seats per Row)</label>
            <input className="kc-input" type="number" min="1" value={form.cols} onChange={set("cols")} />
          </div>

          <div className="kc-field">
            <label className="kc-label">Estimated Capacity</label>
            <input className="kc-input" value={`${capacity} seats`} readOnly />
          </div>

          <div className="kc-form-actions">
            <button type="submit" className="kc-btn kc-btn-primary">{isEdit ? "Save Changes" : "Create Room"}</button>
            <button type="button" className="kc-btn kc-btn-ghost" onClick={() => navigate("/admin/rooms")}>Cancel</button>
          </div>
        </div>
      </form>
    </div>
  );
}
