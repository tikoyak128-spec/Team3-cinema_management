import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../admin.css";

export default function SeatForm({ isEdit = false }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    row: isEdit ? "A" : "A",
    number: isEdit ? "1" : "",
    room: isEdit ? "Hall 1" : "",
    type: isEdit ? "Standard" : "Standard",
    status: isEdit ? "Available" : "Available",
  });

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/admin/seats");
  };

  const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

  return (
    <div className="kc-page">
      <div className="kc-head">
        <div>
          <h1>{isEdit ? "Edit Seat" : "Add Seat"}</h1>
          <p className="kc-subtitle">{isEdit ? "Update this seat." : "Add a new seat to a room."}</p>
        </div>
      </div>

      <form className="kc-form-card" onSubmit={handleSubmit}>
        <div className="kc-form-grid">
          <div className="kc-field">
            <label className="kc-label">Room</label>
            <select className="kc-select-lg" value={form.room} onChange={set("room")}>
              <option value="">Select room</option>
              <option>Hall 1</option>
              <option>Hall 2</option>
              <option>IMAX 1</option>
              <option>VIP Suite</option>
            </select>
          </div>

          <div className="kc-field">
            <label className="kc-label">Status</label>
            <select className="kc-select-lg" value={form.status} onChange={set("status")}>
              <option>Available</option>
              <option>Booked</option>
              <option>Maintenance</option>
            </select>
          </div>

          <div className="kc-field">
            <label className="kc-label">Row</label>
            <select className="kc-select-lg" value={form.row} onChange={set("row")}>
              {rows.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>

          <div className="kc-field">
            <label className="kc-label">Seat Number <span>*</span></label>
            <input className="kc-input" type="number" min="1" placeholder="e.g. 5" value={form.number} onChange={set("number")} required />
          </div>

          <div className="kc-field">
            <label className="kc-label">Seat Type</label>
            <select className="kc-select-lg" value={form.type} onChange={set("type")}>
              <option>Standard</option>
              <option>Premium</option>
              <option>VIP</option>
              <option>Accessible</option>
            </select>
          </div>

          <div className="kc-field">
            <label className="kc-label">Preview</label>
            <input className="kc-input" value={form.row ? `${form.row}${form.number || ""}` : "—"} readOnly />
          </div>

          <div className="kc-form-actions">
            <button type="submit" className="kc-btn kc-btn-primary">{isEdit ? "Save Changes" : "Add Seat"}</button>
            <button type="button" className="kc-btn kc-btn-ghost" onClick={() => navigate("/admin/seats")}>Cancel</button>
          </div>
        </div>
      </form>
    </div>
  );
}
