import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../admin.css";

export default function ShowtimeForm({ isEdit = false }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    movie: isEdit ? "The Last Emperor" : "",
    cinema: isEdit ? "Cinema Phnom Penh" : "",
    room: isEdit ? "Hall 1" : "",
    date: isEdit ? "2026-08-31" : "",
    time: isEdit ? "14:00" : "",
    price: isEdit ? "5.00" : "",
    status: "Active",
  });

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/admin/showtimes");
  };

  return (
    <div className="kc-page">
      <div className="kc-head">
        <div>
          <h1>{isEdit ? "Edit Showtime" : "Add Showtime"}</h1>
          <p className="kc-subtitle">{isEdit ? "Update this screening schedule." : "Schedule a new movie screening."}</p>
        </div>
      </div>

      <form className="kc-form-card" onSubmit={handleSubmit}>
        <div className="kc-form-grid">
          <div className="kc-field full">
            <label className="kc-label">Movie <span>*</span></label>
            <select className="kc-select-lg" value={form.movie} onChange={set("movie")} required>
              <option value="">Select a movie</option>
              <option>The Last Emperor</option>
              <option>City of Shadows</option>
              <option>Golden Dawn</option>
              <option>Midnight Express</option>
              <option>Age of Wonders</option>
            </select>
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
            <label className="kc-label">Room</label>
            <select className="kc-select-lg" value={form.room} onChange={set("room")}>
              <option>Hall 1</option>
              <option>Hall 2</option>
              <option>IMAX 1</option>
              <option>VIP Suite</option>
            </select>
          </div>

          <div className="kc-field">
            <label className="kc-label">Date</label>
            <input className="kc-input" type="date" value={form.date} onChange={set("date")} />
          </div>

          <div className="kc-field">
            <label className="kc-label">Start Time</label>
            <input className="kc-input" type="time" value={form.time} onChange={set("time")} />
          </div>

          <div className="kc-field">
            <label className="kc-label">Ticket Price</label>
            <input className="kc-input" type="number" step="0.50" min="0" placeholder="5.00" value={form.price} onChange={set("price")} />
          </div>

          <div className="kc-field">
            <label className="kc-label">Status</label>
            <select className="kc-select-lg" value={form.status} onChange={set("status")}>
              <option>Active</option>
              <option>Sold Out</option>
              <option>Cancelled</option>
            </select>
          </div>

          <div className="kc-form-actions">
            <button type="submit" className="kc-btn kc-btn-primary">{isEdit ? "Save Changes" : "Add Showtime"}</button>
            <button type="button" className="kc-btn kc-btn-ghost" onClick={() => navigate("/admin/showtimes")}>Cancel</button>
          </div>
        </div>
      </form>
    </div>
  );
}
