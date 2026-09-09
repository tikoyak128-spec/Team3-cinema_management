import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../../api/client";
import "../admin.css";

export default function CategoriesForm({ isEdit = false }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState({
    name: "",
    description: "",
  });
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEdit || !id) return;
    let cancelled = false;
    api
      .get(`/categories/${id}`)
      .then(({ data }) => {
        if (cancelled) return;
        setForm({
          name: data.name || "",
          description: data.description || "",
        });
      })
      .catch((err) => {
        if (!cancelled) setError(err?.response?.data?.message || "Failed to load category.");
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
      if (isEdit) {
        await api.put(`/categories/${id}`, {
          name: form.name.trim(),
          description: form.description.trim() || null,
        });
      } else {
        await api.post("/categories", {
          name: form.name.trim(),
          description: form.description.trim() || null,
        });
      }
      navigate("/admin/categories");
    } catch (err) {
      const errors = err?.response?.data?.errors;
      setError(
        errors?.name?.[0] ||
          errors?.description?.[0] ||
          err?.response?.data?.message ||
          `Failed to ${isEdit ? "update" : "create"} category.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="kc-page">
        <div className="kc-empty"><p>Loading category...</p></div>
      </div>
    );
  }

  return (
    <div className="kc-page">
      <div className="kc-head">
        <div>
          <h1>{isEdit ? "Edit Category" : "Add Category"}</h1>
          <p className="kc-subtitle">{isEdit ? "Update this category." : "Create a new movie category."}</p>
        </div>
      </div>

      {error && <div className="kc-error-banner" style={styles.banner}>{error}</div>}

      <form className="kc-form-card" onSubmit={handleSubmit}>
        <div className="kc-form-grid">
          <div className="kc-field full">
            <label className="kc-label">Category Name <span>*</span></label>
            <input className="kc-input" placeholder="e.g. Action" value={form.name} onChange={set("name")} required />
          </div>

          <div className="kc-field full">
            <label className="kc-label">Description</label>
            <textarea className="kc-textarea" placeholder="Short description of this category..." value={form.description} onChange={set("description")} />
          </div>

          <div className="kc-form-actions">
            <button type="submit" className="kc-btn kc-btn-primary" disabled={submitting}>
              {submitting ? (isEdit ? "Saving..." : "Creating...") : (isEdit ? "Save Changes" : "Create Category")}
            </button>
            <button type="button" className="kc-btn kc-btn-ghost" onClick={() => navigate("/admin/categories")}>Cancel</button>
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
