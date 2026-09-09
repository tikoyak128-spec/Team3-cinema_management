import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../../api/client";
import "../admin.css";

const emptyForm = {
  name: "",
  location: "",
  address: "",
  halls: "",
  seats: "",
  phone: "",
  status: "active",
};

export default function CinemaForm({ isEdit = false }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEdit || !id) return;
    let cancelled = false;
    api
      .get(`/cinemas/${id}`)
      .then(({ data }) => {
        if (cancelled) return;
        setForm({
          name: data.name || "",
          location: data.location || "",
          address: data.address || "",
          halls: data.halls || "",
          seats: data.seats || "",
          phone: data.phone || "",
          status: data.status || "active",
        });
      })
      .catch((err) => {
        if (!cancelled) setError(err?.response?.data?.message || "Failed to load cinema.");
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
        location: form.location.trim(),
        address: form.address.trim() || null,
        halls: Number(form.halls) || 0,
        seats: Number(form.seats) || 0,
        phone: form.phone.trim() || null,
        status: form.status,
      };
      if (isEdit) {
        await api.put(`/cinemas/${id}`, payload);
      } else {
        await api.post("/cinemas", payload);
      }
      navigate("/admin/cinemas");
    } catch (err) {
      const errors = err?.response?.data?.errors;
      setError(
        errors?.name?.[0] ||
          errors?.location?.[0] ||
          errors?.address?.[0] ||
          errors?.halls?.[0] ||
          errors?.seats?.[0] ||
          errors?.phone?.[0] ||
          errors?.status?.[0] ||
          err?.response?.data?.message ||
          `Failed to ${isEdit ? "update" : "create"} cinema.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="kc-page">
        <div className="kc-empty"><p>Loading cinema...</p></div>
      </div>
    );
  }

  return (
    <div className="kc-page">
      <div className="kc-head">
        <div>
          <h1>{isEdit ? "Edit Cinema" : "Add Cinema"}</h1>
          <p className="kc-subtitle">{isEdit ? "Update this cinema branch." : "Register a new cinema branch."}</p>
        </div>
      </div>

      {error && <div className="kc-error-banner" style={styles.banner}>{error}</div>}

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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="kc-form-actions">
            <button type="submit" className="kc-btn kc-btn-primary" disabled={submitting}>
              {submitting ? (isEdit ? "Saving..." : "Creating...") : (isEdit ? "Save Changes" : "Create Cinema")}
            </button>
            <button type="button" className="kc-btn kc-btn-ghost" onClick={() => navigate("/admin/cinemas")}>Cancel</button>
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