import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../admin.css";

export default function CinemaForm({ isEdit = false }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: isEdit ? "Cinema Phnom Penh" : "",
    location: isEdit ? "Main City Center" : "",
    address: isEdit ? "Street 200, Phnom Penh" : "",
    halls: isEdit ? "4" : "",
    seats: isEdit ? "520" : "",
    status: "Active",
    phone: isEdit ? "+855 23 123 456" : "",
  });

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/admin/cinemas");
  };

  return (
    <div className="kc-page">
      <div className="kc-head">
        <div>
          <h1>{isEdit ? "Edit Cinema" : "Add Cinema"}</h1>
          <p className="kc-subtitle">{isEdit ? "Update this cinema branch." : "Register a new cinema branch."}</p>
        </div>
      </div>

      <form className="kc-form-card" onSubmit={handleSubmit}>
        <div className="kc-form-grid">
          <div className="kc-field">
            <label className="kc-label">Cinema Name <span>*</span></label>
            <input className="kc-input" placeholder="e.g. Cinema Riverside" value={form.name} onChange={set("name")} required />
          </div>

          <div className="kc-field">
            <label className="kc-label">Location / Area</label>
            <input className="kc-input" placeholder="e.g. Riverside District" value={form.location} onChange={set("location")} />
          </div>

          <div className="kc-field full">
            <label className="kc-label">Full Address</label>
            <input className="kc-input" placeholder="Street, City" value={form.address} onChange={set("address")} />
          </div>

          <div className="kc-field">
            <label className="kc-label">Number of Halls</label>
            <input className="kc-input" type="number" min="0" value={form.halls} onChange={set("halls")} />
          </div>

          <div className="kc-field">
            <label className="kc-label">Total Seats</label>
            <input className="kc-input" type="number" min="0" value={form.seats} onChange={set("seats")} />
          </div>

          <div className="kc-field">
            <label className="kc-label">Contact Phone</label>
            <input className="kc-input" placeholder="+855 ..." value={form.phone} onChange={set("phone")} />
          </div>

          <div className="kc-field">
            <label className="kc-label">Status</label>
            <select className="kc-select-lg" value={form.status} onChange={set("status")}>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>

          <div className="kc-form-actions">
            <button type="submit" className="kc-btn kc-btn-primary">{isEdit ? "Save Changes" : "Create Cinema"}</button>
            <button type="button" className="kc-btn kc-btn-ghost" onClick={() => navigate("/admin/cinemas")}>Cancel</button>
          </div>
        </div>
      </form>
    </div>
  );
}
