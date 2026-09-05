import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../../api/client";
import { usePrefs } from "../../../../context/PrefsContext";
import "../admin.css";

export default function UserForm({ isEdit = false }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = usePrefs();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "staff",
  });
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEdit) {
      api
        .get(`/users/${id}`)
        .then(({ data }) => {
          setForm({
            name: data.name,
            email: data.email,
            phone: data.phone || "",
            password: "",
            role: data.role,
          });
        })
        .catch(() => setError(t("users.failedLoad")))
        .finally(() => setLoading(false));
    }
  }, [isEdit, id, t]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        name: form.name,
        email: form.email.trim(),
        phone: form.phone || null,
        role: form.role,
      };
      if (!isEdit || form.password) payload.password = form.password;

      if (isEdit) {
        await api.put(`/users/${id}`, payload);
      } else {
        await api.post("/users", payload);
      }
      navigate("/admin/users");
    } catch (err) {
      setError(
        err?.response?.data?.errors?.email?.[0] ||
          err?.response?.data?.errors?.role?.[0] ||
          err?.response?.data?.message ||
          t("users.failedSave")
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="kc-page">
        <div className="kc-empty"><p>{t("common.loading")}</p></div>
      </div>
    );
  }

  return (
    <div className="kc-page">
      <div className="kc-head">
        <div>
          <h1>{isEdit ? t("users.editUserTitle") : t("users.addUserTitle")}</h1>
          <p className="kc-subtitle">
            {isEdit ? t("users.editUserSubtitle") : t("users.addUserSubtitle")}
          </p>
        </div>
      </div>

      {error && <div className="kc-error-banner" style={styles.banner}>{error}</div>}

      <form className="kc-form-card" onSubmit={handleSubmit}>
        <div className="kc-form-grid">
          <div className="kc-field">
            <label className="kc-label">{t("auth.fullName")} <span>*</span></label>
            <input className="kc-input" placeholder="e.g. John Doe" value={form.name} onChange={set("name")} required />
          </div>

          <div className="kc-field">
            <label className="kc-label">{t("auth.emailAddress")} <span>*</span></label>
            <input className="kc-input" type="email" placeholder="e.g. staff@cinema.com" value={form.email} onChange={set("email")} required />
          </div>

          <div className="kc-field">
            <label className="kc-label">{t("users.role")} <span>*</span></label>
            <select className="kc-select-lg" value={form.role} onChange={set("role")}>
              <option value="admin">{t("users.admins")}</option>
              <option value="staff">{t("users.staff")}</option>
              <option value="customer">{t("users.customers")}</option>
            </select>
            <p className="kc-hint">{t("users.roleHint")}</p>
          </div>

          <div className="kc-field">
            <label className="kc-label">{t("users.phone")}</label>
            <input className="kc-input" placeholder="e.g. +855 12 345 678" value={form.phone} onChange={set("phone")} />
          </div>

          <div className="kc-field full">
            <label className="kc-label">
              {isEdit ? t("users.passwordHint") : t("auth.password")} <span>{!isEdit && "*"}</span>
            </label>
            <input className="kc-input" type="password" placeholder={isEdit ? "••••••••" : t("users.passwordPlaceholder")} value={form.password} onChange={set("password")} required={!isEdit} minLength={isEdit ? undefined : 8} />
          </div>

          <div className="kc-form-actions">
            <button type="submit" className="kc-btn kc-btn-primary" disabled={submitting}>
              {submitting ? t("users.saving") : isEdit ? t("users.saveChanges") : t("users.createUser")}
            </button>
            <button type="button" className="kc-btn kc-btn-ghost" onClick={() => navigate("/admin/users")}>{t("common.cancel")}</button>
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