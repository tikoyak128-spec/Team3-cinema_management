import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../../api/client";
import "../admin.css";

const emptyForm = {
  name: "",
  cinema_id: "",
  total_seats: "",
};

export default function RoomForm({ isEdit = false }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [cinemas, setCinemas] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .get("/cinemas")
      .then(({ data }) => {
        if (!cancelled) setCinemas(data);
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load cinemas.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isEdit || !id) return;
    let cancelled = false;
    api
      .get(`/rooms/${id}`)
      .then(({ data }) => {
        if (cancelled) return;
        setForm({
          name: data.name || "",
          cinema_id: data.cinema_id,
          total_seats: data.total_seats,
        });
      })
      .catch((err) => {
        if (!cancelled) setError(err?.response?.data?.message || "Failed to load room.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isEdit, id]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        name: form.name.trim(),
        cinema_id: Number(form.cinema_id),
        total_seats: Number(form.total_seats),
      };
      if (isEdit) {
        await api.put(`/rooms/${id}`, payload);
      } else {
        await api.post("/rooms", payload);
      }
      navigate("/admin/rooms");
    } catch (err) {
      const errors = err?.response?.data?.errors;
      setError(
        errors?.name?.[0] ||
          errors?.cinema_id?.[0] ||
          errors?.total_seats?.[0] ||
          err?.response?.data?.message ||
          `Failed to ${isEdit ? "update" : "create"} room.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="kc-page">
        <div className="kc-empty"><p>Loading room...</p></div>
      </div>
    );
  }

  return (
    <div className="kc-page">
      <div className="kc-head">
        <div>
          <h1>{isEdit ? "Edit Room" : "Add Room"}</h1>
          <p className="kc-subtitle">{isEdit ? "Update this screening room." : "Create a new screening room."}</p>
        </div>
      </div>

      {error && <div className="kc-error-banner" style={styles.banner}>{error}</div>}

      <form className="kc-form-card" onSubmit={handleSubmit}>
        <div className="kc-form-grid">
          <div className="kc-field">
            <label className="kc-label">Room Name <span>*</span></label>
            <input className="kc-input" placeholder="e.g. Hall 1" value={form.name} onChange={set("name")} required />
          </div>

          <div className="kc-field">
            <label className="kc-label">Cinema <span>*</span></label>
            <select className="kc-select-lg" value={form.cinema_id} onChange={set("cinema_id")} required>
              <option value="">Select a cinema</option>
              {cinemas.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="kc-field">
            <label className="kc-label">Total Seats <span>*</span></label>
            <input className="kc-input" type="number" min="1" placeholder="e.g. 180" value={form.total_seats} onChange={set("total_seats")} required />
          </div>

          <div className="kc-form-actions">
            <button type="submit" className="kc-btn kc-btn-primary" disabled={submitting}>
              {submitting ? (isEdit ? "Saving..." : "Creating...") : (isEdit ? "Save Changes" : "Create Room")}
            </button>
            <button type="button" className="kc-btn kc-btn-ghost" onClick={() => navigate("/admin/rooms")}>Cancel</button>
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