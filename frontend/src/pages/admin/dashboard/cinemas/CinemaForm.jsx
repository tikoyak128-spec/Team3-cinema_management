import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api, { buildFormData } from "../../../../api/client";
import { usePrefs } from "../../../../context/PrefsContext";

export default function CinemaForm({ isEdit = false }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = usePrefs();
  const [form, setForm] = useState({
    name: "",
    location: "",
    area: "",
    phone: "",
    hours: "",
    image: "",
    image_file: null,
    tagline: "",
    features: "",
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEdit) {
      api.get(`/cinemas/${id}`)
        .then(({ data }) => {
          setForm({
            name: data.name,
            location: data.location,
            area: data.area || "",
            phone: data.phone || "",
            hours: data.hours || "",
            image: data.image || "",
            image_file: null,
            tagline: data.tagline || "",
            features: Array.isArray(data.features) ? data.features.join(", ") : "",
          });
          setImagePreview(data.image || null);
        })
        .catch(() => setError(t("adminCinemaForm.failedLoad")))
        .finally(() => setLoading(false));
    }
  }, [isEdit, id]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const setFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((prev) => ({ ...prev, image_file: file }));
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const payload = buildFormData({
      name: form.name,
      location: form.location,
      area: form.area || null,
      phone: form.phone || null,
      hours: form.hours || null,
      image: form.image || null,
      image_file: form.image_file,
      tagline: form.tagline || null,
      description: null,
      features: form.features
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean),
    });

    if (form.image_file) payload.delete("image");

    if (isEdit) {
      payload.append("_method", "put");
    }

    try {
      if (isEdit) {
        await api.post(`/cinemas/${id}`, payload);
      } else {
        await api.post("/cinemas", payload);
      }
      navigate("/admin/cinemas");
    } catch (err) {
      setError(err?.response?.data?.errors?.name?.[0] || err?.response?.data?.message || t("adminCinemaForm.failedSave"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex flex-col gap-6 text-[var(--app-ink)] [&_*]:box-border"><div className="flex flex-col items-center justify-center py-[60px] px-5 text-center text-[var(--app-mute)]"><p>{t("common.loading")}</p></div></div>;
  }

  return (
    <div className="flex flex-col items-center gap-6 text-[var(--app-ink)] [&_*]:box-border">
      <div className="w-full max-w-[720px]">
        <h1 className="text-[26px] font-extrabold tracking-wide">{isEdit ? t("adminCinemaForm.titleEdit") : t("adminCinemaForm.titleAdd")}</h1>
        <p className="text-[14px] text-[var(--app-mute)] mt-1">{isEdit ? t("adminCinemaForm.editSubtitle") : t("adminCinemaForm.addSubtitle")}</p>
      </div>

      {error && <div className="bg-[rgba(229,9,20,0.12)] border border-[rgba(229,9,20,0.4)] text-[#ff6b6b] text-[13px] py-2.5 px-3.5 rounded-[10px] w-full max-w-[720px]">{error}</div>}

      <form className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl p-7 w-full max-w-[720px]" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-[18px] max-sm:grid-cols-1">
          <div className="flex flex-col gap-[7px]">
            <label className="text-[13px] font-bold text-[var(--app-ink2)]">{t("adminCinemaForm.name")} <span className="text-[#e50914]">*</span></label>
            <input className="bg-[var(--app-panel2)] border border-[var(--app-edge)] rounded-xl py-3 px-3.5 text-[var(--app-ink)] font-inherit text-[14px] outline-none transition-colors duration-200 focus:border-[#e50914]" placeholder={t("adminCinemaForm.namePh")} value={form.name} onChange={set("name")} required />
          </div>
          <div className="flex flex-col gap-[7px]">
            <label className="text-[13px] font-bold text-[var(--app-ink2)]">{t("adminCinemaForm.location")} <span className="text-[#e50914]">*</span></label>
            <input className="bg-[var(--app-panel2)] border border-[var(--app-edge)] rounded-xl py-3 px-3.5 text-[var(--app-ink)] font-inherit text-[14px] outline-none transition-colors duration-200 focus:border-[#e50914]" placeholder={t("adminCinemaForm.locationPh")} value={form.location} onChange={set("location")} required />
          </div>
          <div className="flex flex-col gap-[7px]">
            <label className="text-[13px] font-bold text-[var(--app-ink2)]">{t("adminCinemaForm.area")}</label>
            <input className="bg-[var(--app-panel2)] border border-[var(--app-edge)] rounded-xl py-3 px-3.5 text-[var(--app-ink)] font-inherit text-[14px] outline-none transition-colors duration-200 focus:border-[#e50914]" placeholder={t("adminCinemaForm.areaPh")} value={form.area} onChange={set("area")} />
          </div>
          <div className="flex flex-col gap-[7px]">
            <label className="text-[13px] font-bold text-[var(--app-ink2)]">{t("adminCinemaForm.phone")}</label>
            <input className="bg-[var(--app-panel2)] border border-[var(--app-edge)] rounded-xl py-3 px-3.5 text-[var(--app-ink)] font-inherit text-[14px] outline-none transition-colors duration-200 focus:border-[#e50914]" placeholder={t("adminCinemaForm.phonePh")} value={form.phone} onChange={set("phone")} />
          </div>
          <div className="flex flex-col gap-[7px]">
            <label className="text-[13px] font-bold text-[var(--app-ink2)]">{t("adminCinemaForm.hours")}</label>
            <input className="bg-[var(--app-panel2)] border border-[var(--app-edge)] rounded-xl py-3 px-3.5 text-[var(--app-ink)] font-inherit text-[14px] outline-none transition-colors duration-200 focus:border-[#e50914]" placeholder={t("adminCinemaForm.hoursPh")} value={form.hours} onChange={set("hours")} />
          </div>
          <div className="flex flex-col gap-[7px]">
            <label className="text-[13px] font-bold text-[var(--app-ink2)]">{t("adminCinemaForm.tagline")}</label>
            <input className="bg-[var(--app-panel2)] border border-[var(--app-edge)] rounded-xl py-3 px-3.5 text-[var(--app-ink)] font-inherit text-[14px] outline-none transition-colors duration-200 focus:border-[#e50914]" placeholder={t("adminCinemaForm.taglinePh")} value={form.tagline} onChange={set("tagline")} />
          </div>
          <div className="flex flex-col gap-[7px]">
            <label className="text-[13px] font-bold text-[var(--app-ink2)]">{t("adminCinemaForm.imageUrl")}</label>
            <input className="bg-[var(--app-panel2)] border border-[var(--app-edge)] rounded-xl py-3 px-3.5 text-[var(--app-ink)] font-inherit text-[14px] outline-none transition-colors duration-200 focus:border-[#e50914]" type="file" accept="image/*" onChange={setFile} />
            {imagePreview && (
              <div className="flex flex-col gap-1.5 mt-2">
                <div className="flex items-center gap-3">
                  <img src={imagePreview} alt="Cinema preview" className="w-36 h-24 object-cover rounded-lg border border-[var(--app-edge)]" />
                  <button type="button" className="text-[12px] text-[#e50914] font-bold bg-transparent border-none cursor-pointer" onClick={() => { setForm((prev) => ({ ...prev, image: "" })); setImagePreview(null); }}>{t("common.remove") ?? "Remove"}</button>
                </div>
                {!form.image_file && (
                  <span className="text-[12px] text-[var(--app-mute)]">{t("adminCinemaForm.orUseUrl") ?? "Or paste a URL instead"}</span>
                )}
                {!form.image_file && (
                  <input className="bg-[var(--app-panel2)] border border-[var(--app-edge)] rounded-xl py-3 px-3.5 text-[var(--app-ink)] font-inherit text-[14px] outline-none transition-colors duration-200 focus:border-[#e50914]" placeholder={t("adminCinemaForm.urlPh")} value={form.image} onChange={set("image")} />
                )}
              </div>
            )}
            {!imagePreview && (
              <div className="flex flex-col gap-1.5">
                <span className="text-[12px] text-[var(--app-mute)]">{t("adminCinemaForm.orUseUrl") ?? "Or paste a URL instead"}</span>
                <input className="bg-[var(--app-panel2)] border border-[var(--app-edge)] rounded-xl py-3 px-3.5 text-[var(--app-ink)] font-inherit text-[14px] outline-none transition-colors duration-200 focus:border-[#e50914]" placeholder={t("adminCinemaForm.urlPh")} value={form.image} onChange={set("image")} />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-[7px] col-span-full max-sm:col-span-1">
            <label className="text-[13px] font-bold text-[var(--app-ink2)]">{t("adminCinemaForm.features")}</label>
            <input className="bg-[var(--app-panel2)] border border-[var(--app-edge)] rounded-xl py-3 px-3.5 text-[var(--app-ink)] font-inherit text-[14px] outline-none transition-colors duration-200 focus:border-[#e50914]" placeholder={t("adminCinemaForm.featuresPh")} value={form.features} onChange={set("features")} />
          </div>
          <div className="flex gap-3 items-center mt-[26px] col-span-full max-sm:col-span-1">
            <button type="submit" className="inline-flex items-center gap-2 border-none cursor-pointer font-inherit py-[11px] px-5 text-[14px] font-bold rounded-xl transition-all duration-200 bg-[#e50914] text-white shadow-[0_4px_14px_rgba(229,9,20,0.35)] hover:bg-[#f40612] hover:-translate-y-px" disabled={submitting}>
              {submitting ? t("common.saving") : isEdit ? t("common.save") : t("adminCinemaForm.create")}
            </button>
            <button type="button" className="inline-flex items-center gap-2 border-none cursor-pointer font-inherit py-[11px] px-5 text-[14px] font-bold rounded-xl transition-all duration-200 bg-transparent text-[var(--app-ink2)] border border-[var(--app-edge2)] hover:bg-[var(--app-fill)]" onClick={() => navigate("/admin/cinemas")}>{t("common.cancel")}</button>
          </div>
        </div>
      </form>
    </div>
  );
}