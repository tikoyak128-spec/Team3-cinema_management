import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../../api/client";
import Select from "../../../../components/Select";
import { usePrefs } from "../../../../context/PrefsContext";
import { X } from "lucide-react";

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
      <div className="flex flex-col gap-6 text-[var(--app-ink)] [&_*]:box-border">
        <div className="flex flex-col items-center justify-center py-[60px] px-5 text-center text-[var(--app-mute)]"><p>{t("common.loading")}</p></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 text-[var(--app-ink)] [&_*]:box-border">
      <div className="flex items-center justify-between flex-wrap gap-4 w-full max-w-[720px]">
        <div>
          <h1 className="text-[26px] font-extrabold tracking-wide">{isEdit ? t("users.editUserTitle") : t("users.addUserTitle")}</h1>
          <p className="text-[14px] text-[var(--app-mute)] mt-1">
            {isEdit ? t("users.editUserSubtitle") : t("users.addUserSubtitle")}
          </p>
        </div>
      </div>

      {error && <div className="bg-[rgba(229,9,20,0.12)] border border-[rgba(229,9,20,0.4)] text-[#ff6b6b] text-[13px] py-2.5 px-3.5 rounded-[10px] mb-4 w-full max-w-[720px]">{error}</div>}

      <form className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl p-7 w-full max-w-[720px]" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-[18px] max-sm:grid-cols-1">
          <div className="flex flex-col gap-[7px]">
            <label className="text-[13px] font-bold text-[var(--app-ink2)]">{t("auth.fullName")} <span className="text-[#e50914]">*</span></label>
            <input className="bg-[var(--app-panel2)] border border-[var(--app-edge)] rounded-xl py-3 px-3.5 text-[var(--app-ink)] font-inherit text-[14px] outline-none transition-colors duration-200 focus:border-[#e50914]" placeholder="e.g. John Doe" value={form.name} onChange={set("name")} required />
          </div>

          <div className="flex flex-col gap-[7px]">
            <label className="text-[13px] font-bold text-[var(--app-ink2)]">{t("auth.emailAddress")} <span className="text-[#e50914]">*</span></label>
            <input className="bg-[var(--app-panel2)] border border-[var(--app-edge)] rounded-xl py-3 px-3.5 text-[var(--app-ink)] font-inherit text-[14px] outline-none transition-colors duration-200 focus:border-[#e50914]" type="email" placeholder="e.g. staff@cinema.com" value={form.email} onChange={set("email")} required />
          </div>

          <div className="flex flex-col gap-[7px]">
            <label className="text-[13px] font-bold text-[var(--app-ink2)]">{t("users.role")} <span className="text-[#e50914]">*</span></label>
            <Select className="bg-[var(--app-panel2)] border border-[var(--app-edge)] rounded-xl py-3 px-3.5 text-[var(--app-ink)] font-inherit text-[14px] outline-none transition-colors duration-200 focus:border-[#e50914] cursor-pointer appearance-none" value={form.role} onChange={set("role")}>
              <option value="admin">{t("users.admins")}</option>
              <option value="staff">{t("users.staff")}</option>
              <option value="customer">{t("users.customers")}</option>
            </Select>
            <p className="text-[12px] text-[var(--app-mute)]">{t("users.roleHint")}</p>
          </div>

          <div className="flex flex-col gap-[7px]">
            <label className="text-[13px] font-bold text-[var(--app-ink2)]">{t("users.phone")}</label>
            <input className="bg-[var(--app-panel2)] border border-[var(--app-edge)] rounded-xl py-3 px-3.5 text-[var(--app-ink)] font-inherit text-[14px] outline-none transition-colors duration-200 focus:border-[#e50914]" placeholder="e.g. +855 12 345 678" value={form.phone} onChange={set("phone")} />
          </div>

          <div className="flex flex-col gap-[7px] col-span-full max-sm:col-span-1">
            <label className="text-[13px] font-bold text-[var(--app-ink2)]">
              {isEdit ? t("users.passwordHint") : t("auth.password")} <span className="text-[#e50914]">{!isEdit && "*"}</span>
            </label>
            <input className="bg-[var(--app-panel2)] border border-[var(--app-edge)] rounded-xl py-3 px-3.5 text-[var(--app-ink)] font-inherit text-[14px] outline-none transition-colors duration-200 focus:border-[#e50914]" type="password" placeholder={isEdit ? "••••••••" : t("users.passwordPlaceholder")} value={form.password} onChange={set("password")} required={!isEdit} minLength={isEdit ? undefined : 8} />
          </div>

          <div className="flex gap-3 items-center mt-[26px] col-span-full max-sm:col-span-1">
            <button type="submit" className="inline-flex items-center gap-2 border-none cursor-pointer font-inherit py-[11px] px-5 text-[14px] font-bold rounded-xl transition-all duration-200 bg-[#e50914] text-white shadow-[0_4px_14px_rgba(229,9,20,0.35)] hover:bg-[#f40612] hover:-translate-y-px" disabled={submitting}>
              {submitting ? t("users.saving") : isEdit ? t("users.saveChanges") : t("users.createUser")}
            </button>
            <button type="button" className="inline-flex items-center gap-2 border cursor-pointer font-inherit py-[11px] px-5 text-[14px] font-bold rounded-xl transition-all duration-200 bg-[var(--app-panel2)] text-[var(--app-ink2)] border-[var(--app-edge2)] hover:bg-[rgba(229,9,20,0.08)] hover:text-brand hover:border-[rgba(229,9,20,0.35)]" onClick={() => navigate("/admin/users")}><X size={16} /> {t("common.cancel")}</button>
          </div>
        </div>
      </form>
    </div>
  );
}
