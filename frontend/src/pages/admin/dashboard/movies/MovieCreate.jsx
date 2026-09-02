import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../admin.css";

export default function MovieCreate() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "", genre: "", rating: "PG", duration: "", category: "", status: "Now Showing", description: "",
  });

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/admin/movies");
  };

  return (
    <div className="kc-page">
      <div className="kc-head">
        <div>
          <h1>Add Movie</h1>
          <p className="kc-subtitle">Create a new movie entry in the catalog.</p>
        </div>
      </div>

      <form className="kc-form-card" onSubmit={handleSubmit}>
        <div className="kc-form-grid">
          <div className="kc-field full">
            <label className="kc-label">Movie Title <span>*</span></label>
            <input className="kc-input" placeholder="e.g. The Last Emperor" value={form.title} onChange={set("title")} required />
          </div>

          <div className="kc-field">
            <label className="kc-label">Genre <span>*</span></label>
            <select className="kc-select-lg" value={form.genre} onChange={set("genre")} required>
              <option value="">Select genre</option>
              <option>Action</option>
              <option>Drama</option>
              <option>Comedy</option>
              <option>Romance</option>
              <option>Sci-Fi</option>
              <option>Fantasy</option>
              <option>Thriller</option>
              <option>Horror</option>
            </select>
          </div>

          <div className="kc-field">
            <label className="kc-label">Runtime</label>
            <input className="kc-input" placeholder="e.g. 2h 05m" value={form.duration} onChange={set("duration")} />
          </div>

          <div className="kc-field">
            <label className="kc-label">Rating</label>
            <select className="kc-select-lg" value={form.rating} onChange={set("rating")}>
              <option>G</option>
              <option>PG</option>
              <option>PG-13</option>
              <option>R</option>
            </select>
          </div>

          <div className="kc-field">
            <label className="kc-label">Category</label>
            <select className="kc-select-lg" value={form.category} onChange={set("category")}>
              <option value="">Select category</option>
              <option>Action</option>
              <option>Drama</option>
              <option>Comedy</option>
              <option>Romance</option>
              <option>Sci-Fi</option>
            </select>
          </div>

          <div className="kc-field">
            <label className="kc-label">Status</label>
            <select className="kc-select-lg" value={form.status} onChange={set("status")}>
              <option>Now Showing</option>
              <option>Coming Soon</option>
            </select>
          </div>

          <div className="kc-field">
            <label className="kc-label">Poster</label>
            <input className="kc-input" type="file" accept="image/*" />
            <span className="kc-hint">Upload a poster image (JPG, PNG).</span>
          </div>

          <div className="kc-field full">
            <label className="kc-label">Description</label>
            <textarea className="kc-textarea" placeholder="Short synopsis of the movie..." value={form.description} onChange={set("description")} />
          </div>

          <div className="kc-form-actions">
            <button type="submit" className="kc-btn kc-btn-primary">Create Movie</button>
            <button type="button" className="kc-btn kc-btn-ghost" onClick={() => navigate("/admin/movies")}>Cancel</button>
          </div>
        </div>
      </form>
    </div>
  );
}
