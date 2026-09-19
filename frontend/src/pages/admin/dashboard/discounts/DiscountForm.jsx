import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../../api/client";
import { usePrefs } from "../../../../context/PrefsContext";
import { X } from "lucide-react";

const toInputValue = (val) => {
  if (!val) return "";
  try {
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return "";
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return "";
  }
};

export default function DiscountForm({ isEdit = false }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = usePrefs();
  const [form, setForm] = useState({
    code: "",
    name: "",
    description: "",
    type: "percent",
    value: "",
    min_amount: "",
    max_discount: "",
    starts_at: "",
    ends_at: "",
    is_active: true,
  });
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEdit) {
      api.get(`/discounts/${id}`)
        .then(({ data }) => {
          setForm({
            code: data.code || "",
            name: data.name || "",
            description: data.description || "",
            type: data.type || "percent",
            value: data.value ?? "",
            min_amount: data.min_amount ?? "",
            max_discount: data.max_discount ?? "",
            starts_at: toInputValue(data.starts_at),
            ends_at: toInputValue(data.ends_at),
            is_active: Boolean(data.is_active),
          });
        })
        .catch(() => setError(t("adminDiscountForm.failedLoad")))
        .finally(() => setLoading(false));
    }
  }, [isEdit, id]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const payload = {
      code: form.code,
      name: form.name,
      description: form.description || null,
      type: form.type,
      value: form.value,
      min_amount: form.min_amount === "" ? null : form.min_amount,
      max_discount: form.max_discount === "" ? null : form.max_discount,
      starts_at: form.starts_at || null,
      ends_at: form.ends_at || null,
      is_active: form.is_active ? 1 : 0,
    };

    try {
      if (isEdit) {
        await api.put(`/discounts/${id}`, payload);
      } else {
        await api.post("/discounts", payload);
      }
      navigate("/admin/discounts");
    } catch (err) {
      const errors = err?.response?.data?.errors || {};
      setError(
        Object.values(errors)[0]?.[0] ||
          err?.response?.data?.message ||
          t("adminDiscountForm.failedSave")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "bg-[var(--app-panel2)] border border-[var(--app-edge)] rounded-xl py-3 px-3.5 text-[var(--app-ink)] font-inherit text-[14px] outline-none transition-colors duration-200 focus:border-[#e50914]";

  if (loading) {
    return <div className="flex flex-col gap-6 text-[var(--app-ink)] [&_*]:box-border"><div className="flex flex-col items-center justify-center py-[60px] px-5 text-center text-[var(--app-mute)]"><p>{t("common.loading")}</p></div></div>;
  }

  return (
    <div className="flex flex-col items-center gap-6 text-[var(--app-ink)] [&_*]:box-border">
      <div className="w-full max-w-[720px]">
        <h1 className="text-[26px] font-extrabold tracking-wide">{isEdit ? t("adminDiscountForm.titleEdit") : t("adminDiscountForm.titleAdd")}</h1>
        <p className="text-[14px] text-[var(--app-mute)] mt-1">{isEdit ? t("adminDiscountForm.editSubtitle") : t("adminDiscountForm.addSubtitle")}</p>
      </div>

      {error && <div className="bg-[rgba(229,9,20,0.12)] border border-[rgba(229,9,20,0.4)] text-[#ff6b6b] text-[13px] py-2.5 px-3.5 rounded-[10px] w-full max-w-[720px]">{error}</div>}

      <form className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl p-7 w-full max-w-[720px]" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-[18px] max-sm:grid-cols-1">
          <div className="flex flex-col gap-[7px]">
            <label className="text-[13px] font-bold text-[var(--app-ink2)]">{t("adminDiscountForm.code")} <span className="text-[#e50914]">*</span></label>
            <input className={inputClass} placeholder="e.g. SAVE20" value={form.code} onChange={set("code")} required />
          </div>
          <div className="flex flex-col gap-[7px]">
            <label className="text-[13px] font-bold text-[var(--app-ink2)]">{t("adminDiscountForm.name")} <span className="text-[#e50914]">*</span></label>
            <input className={inputClass} placeholder={t("adminDiscountForm.namePh")} value={form.name} onChange={set("name")} required />
          </div>

          <div className="flex flex-col gap-[7px] col-span-full max-sm:col-span-1">
            <label className="text-[13px] font-bold text-[var(--app-ink2)]">{t("adminDiscountForm.description")}</label>
            <textarea className={`${inputClass} resize-none min-h-[80px]`} placeholder={t("adminDiscountForm.descriptionPh")} value={form.description} onChange={set("description")} />
          </div>

          <div className="flex flex-col gap-[7px]">
            <label className="text-[13px] font-bold text-[var(--app-ink2)]">{t("adminDiscountForm.type")} <span className="text-[#e50914]">*</span></label>
            <select className={inputClass} value={form.type} onChange={set("type")}>
              <option value="percent">{t("adminDiscountForm.percent")}</option>
              <option value="fixed">{t("adminDiscountForm.fixed")}</option>
            </select>
          </div>
          <div className="flex flex-col gap-[7px]">
            <label className="text-[13px] font-bold text-[var(--app-ink2)]">{form.type === "fixed" ? t("adminDiscountForm.fixedValue") : t("adminDiscountForm.percentValue")} <span className="text-[#e50914]">*</span></label>
            <input className={inputClass} type="number" step="0.01" min="0.01" placeholder={form.type === "fixed" ? "5.00" : "20"} value={form.value} onChange={set("value")} required />
          </div>

          <div className="flex flex-col gap-[7px]">
            <label className="text-[13px] font-bold text-[var(--app-ink2)]">{t("adminDiscountForm.minAmount")}</label>
            <input className={inputClass} type="number" step="0.01" min="0" placeholder={t("adminDiscountForm.minAmountPh")} value={form.min_amount} onChange={set("min_amount")} />
          </div>
          <div className="flex flex-col gap-[7px]">
            <label className="text-[13px] font-bold text-[var(--app-ink2)]">{t("adminDiscountForm.maxDiscount")}</label>
            <input className={inputClass} type="number" step="0.01" min="0" placeholder={t("adminDiscountForm.maxDiscountPh")} value={form.max_discount} onChange={set("max_discount")} />
          </div>

          <div className="flex flex-col gap-[7px]">
            <label className="text-[13px] font-bold text-[var(--app-ink2)]">{t("adminDiscountForm.startsAt")}</label>
            <input className={inputClass} type="datetime-local" value={form.starts_at} onChange={set("starts_at")} />
          </div>
          <div className="flex flex-col gap-[7px]">
            <label className="text-[13px] font-bold text-[var(--app-ink2)]">{t("adminDiscountForm.endsAt")}</label>
            <input className={inputClass} type="datetime-local" value={form.ends_at} onChange={set("ends_at")} />
          </div>

          <div className="flex items-center gap-3 col-span-full max-sm:col-span-1">
            <input
              type="checkbox"
              id="is_active"
              checked={form.is_active}
              onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))}
              className="w-[18px] h-[18px] accent-[#e50914] cursor-pointer"
            />
            <label htmlFor="is_active" className="text-[14px] font-bold text-[var(--app-ink2)] cursor-pointer">{t("adminDiscountForm.active")}</label>
          </div>

          <div className="flex gap-3 items-center mt-[26px] col-span-full max-sm:col-span-1">
            <button type="submit" className="inline-flex items-center gap-2 border-none cursor-pointer font-inherit py-[11px] px-5 text-[14px] font-bold rounded-xl transition-all duration-200 bg-[#e50914] text-white shadow-[0_4px_14px_rgba(229,9,20,0.35)] hover:bg-[#f40612] hover:-translate-y-px" disabled={submitting}>
              {submitting ? t("common.saving") : isEdit ? t("common.save") : t("adminDiscountForm.create")}
            </button>
            <button type="button" className="inline-flex items-center gap-2 border cursor-pointer font-inherit py-[11px] px-5 text-[14px] font-bold rounded-xl transition-all duration-200 bg-[var(--app-panel2)] text-[var(--app-ink2)] border-[var(--app-edge2)] hover:bg-[rgba(229,9,20,0.08)] hover:text-brand hover:border-[rgba(229,9,20,0.35)]" onClick={() => navigate("/admin/discounts")}><X size={16} /> {t("common.cancel")}</button>
          </div>
        </div>
      </form>
    </div>
  );
}