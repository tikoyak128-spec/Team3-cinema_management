import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../../api/client";
import "../admin.css";

export default function MovieCreate() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: "",
    category_id: "",
    duration: "",
    release_date: "",
    poster_url: "",
    trailer_url: "",
    description: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .get("/categories")
      .then(({ data }) => {
        if (!cancelled) setCategories(data);
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load categories.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await api.post("/movies", {
        category_id: Number(form.category_id),
        title: form.title.trim(),
        description: form.description.trim(),
        duration: Number(form.duration),
        release_date: form.release_date,
        poster_url: form.poster_url.trim(),
        trailer_url: form.trailer_url.trim() || null,
      });
      navigate("/admin/movies");
    } catch (err) {
      const errors = err?.response?.data?.errors;
      setError(
        errors?.category_id?.[0] ||
          errors?.title?.[0] ||
          errors?.description?.[0] ||
          errors?.duration?.[0] ||
          errors?.release_date?.[0] ||
          errors?.poster_url?.[0] ||
          errors?.trailer_url?.[0] ||
          err?.response?.data?.message ||
          "Failed to create movie."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="kc-page">
      <div className="kc-head">
        <div>
          <h1>Add Movie</h1>
          <p className="kc-subtitle">Create a new movie entry in the catalog.</p>
        </div>
      </div>

      {error && <div className="kc-error-banner" style={styles.banner}>{error}</div>}

      <form className="kc-form-card" onSubmit={handleSubmit}>
        <div className="kc-form-grid">
          <div className="kc-field full">
            <label className="kc-label">Movie Title <span>*</span></label>
            <input className="kc-input" placeholder="e.g. John Wick: Chapter 4" value={form.title} onChange={set("title")} required />
          </div>

          <div className="kc-field">
            <label className="kc-label">Category <span>*</span></label>
            <select className="kc-select-lg" value={form.category_id} onChange={set("category_id")} required>
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="kc-field">
            <label className="kc-label">Duration (minutes) <span>*</span></label>
            <input className="kc-input" type="number" min="1" placeholder="e.g. 128" value={form.duration} onChange={set("duration")} required />
          </div>

          <div className="kc-field">
            <label className="kc-label">Release Date <span>*</span></label>
            <input className="kc-input" type="date" value={form.release_date} onChange={set("release_date")} required />
          </div>

          <div className="kc-field">
            <label className="kc-label">Poster URL <span>*</span></label>
            <input className="kc-input" type="url" placeholder="https://..." value={form.poster_url} onChange={set("poster_url")} required />
            <span className="kc-hint">Link to the poster image (JPG, PNG).</span>
          </div>

          <div className="kc-field">
            <label className="kc-label">Trailer URL</label>
            <input className="kc-input" type="url" placeholder="https://..." value={form.trailer_url} onChange={set("trailer_url")} />
            <span className="kc-hint">Optional link to the trailer.</span>
          </div>

          <div className="kc-field full">
            <label className="kc-label">Description <span>*</span></label>
            <textarea className="kc-textarea" placeholder="Short synopsis of the movie..." value={form.description} onChange={set("description")} required />
          </div>

          <div className="kc-form-actions">
            <button type="submit" className="kc-btn kc-btn-primary" disabled={submitting}>
              {submitting ? "Creating..." : "Create Movie"}
            </button>
            <button type="button" className="kc-btn kc-btn-ghost" onClick={() => navigate("/admin/movies")}>Cancel</button>
          </div>
        </div>
      </form>
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
  },
}