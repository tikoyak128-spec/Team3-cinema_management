import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api, { buildFormData } from "../../../../api/client";
import { usePrefs } from "../../../../context/PrefsContext";
import { X } from "lucide-react";

export default function GalleryForm({ isEdit = false }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = usePrefs();
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    image: "",
    image_file: null,
    alt: "",
    sort_order: 0,
    is_active: true,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEdit) {
      api.get(`/gallery-images/${id}`)
        .then(({ data }) => {
          setForm({
            title: data.title || "",
            subtitle: data.subtitle || "",
            image: data.image || "",
            image_file: null,
            alt: data.alt || "",
            sort_order: data.sort_order ?? 0,
            is_active: Boolean(data.is_active),
          });
          setImagePreview(data.image || null);
        })
        .catch(() => setError(t("adminGalleryForm.failedLoad")))
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
      title: form.title,
      subtitle: form.subtitle || null,
      image: form.image || null,
      image_file: form.image_file,
      alt: form.alt || null,
      sort_order: form.sort_order ?? 0,
      is_active: form.is_active ? 1 : 0,
    });

    if (form.image_file) payload.delete("image");

    if (isEdit) payload.append("_method", "put");

    try {
      if (isEdit) {
        await api.post(`/gallery-images/${id}`, payload);
      } else {
        await api.post("/gallery-images", payload);
      }
      navigate("/admin/gallery");
    } catch (err) {
      setError(
        err?.response?.data?.errors?.title?.[0] ||
          err?.response?.data?.errors?.image_file?.[0] ||
          err?.response?.data?.errors?.image?.[0] ||
          err?.response?.data?.message ||
          t("adminGalleryForm.failedSave")
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
        <h1 className="text-[26px] font-extrabold tracking-wide">{isEdit ? t("adminGalleryForm.titleEdit") : t("adminGalleryForm.titleAdd")}</h1>
        <p className="text-[14px] text-[var(--app-mute)] mt-1">{isEdit ? t("adminGalleryForm.editSubtitle") : t("adminGalleryForm.addSubtitle")}</p>
      </div>

      {error && <div className="bg-[rgba(229,9,20,0.12)] border border-[rgba(229,9,20,0.4)] text-[#ff6b6b] text-[13px] py-2.5 px-3.5 rounded-[10px] w-full max-w-[720px]">{error}</div>}

      <form className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl p-7 w-full max-w-[720px]" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-[18px] max-sm:grid-cols-1">
          <div className="flex flex-col gap-[7px]">
            <label className="text-[13px] font-bold text-[var(--app-ink2)]">{t("adminGalleryForm.title")} <span className="text-[#e50914]">*</span></label>
            <input className={inputClass} placeholder={t("adminGalleryForm.titlePh")} value={form.title} onChange={set("title")} required />
          </div>
          <div className="flex flex-col gap-[7px]">
            <label className="text-[13px] font-bold text-[var(--app-ink2)]">{t("adminGalleryForm.subtitle")}</label>
            <input className={inputClass} placeholder={t("adminGalleryForm.subtitlePh")} value={form.subtitle} onChange={set("subtitle")} />
          </div>

          <div className="flex flex-col gap-[7px] col-span-full max-sm:col-span-1">
            <label className="text-[13px] font-bold text-[var(--app-ink2)]">{t("adminCinemaForm.imageUrl")}</label>
            <input className={inputClass} type="file" accept="image/*" onChange={setFile} />
            {imagePreview && (
              <div className="flex flex-col gap-1.5 mt-2">
                <div className="flex items-center gap-3">
                  <img src={imagePreview} alt="Gallery preview" className="w-32 h-24 object-cover rounded-lg border border-[var(--app-edge)]" />
                  <button type="button" className="text-[12px] text-[#e50914] font-bold bg-transparent border-none cursor-pointer" onClick={() => { setForm((prev) => ({ ...prev, image: "" })); setImagePreview(null); }}>{t("common.remove") ?? "Remove"}</button>
                </div>
                {!form.image_file && (
                  <>
                    <span className="text-[12px] text-[var(--app-mute)]">{t("adminCinemaForm.orUseUrl") ?? "Or paste a URL instead"}</span>
                    <input className={inputClass} placeholder={t("adminCinemaForm.urlPh")} value={form.image} onChange={set("image")} />
                  </>
                )}
              </div>
            )}
            {!imagePreview && (
              <div className="flex flex-col gap-1.5">
                <span className="text-[12px] text-[var(--app-mute)]">{t("adminCinemaForm.orUseUrl") ?? "Or paste a URL instead"}</span>
                <input className={inputClass} placeholder={t("adminCinemaForm.urlPh")} value={form.image} onChange={set("image")} />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-[7px]">
            <label className="text-[13px] font-bold text-[var(--app-ink2)]">{t("adminGalleryForm.alt")}</label>
            <input className={inputClass} placeholder={t("adminGalleryForm.altPh")} value={form.alt} onChange={set("alt")} />
          </div>
          <div className="flex flex-col gap-[7px]">
            <label className="text-[13px] font-bold text-[var(--app-ink2)]">{t("adminGalleryForm.sortOrder")}</label>
            <input className={inputClass} type="number" min="0" value={form.sort_order} onChange={set("sort_order")} />
          </div>

          <div className="flex items-center gap-3 col-span-full max-sm:col-span-1">
            <input
              type="checkbox"
              id="is_active"
              checked={form.is_active}
              onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))}
              className="w-[18px] h-[18px] accent-[#e50914] cursor-pointer"
            />
            <label htmlFor="is_active" className="text-[14px] font-bold text-[var(--app-ink2)] cursor-pointer">{t("adminGalleryForm.active")}</label>
          </div>

          <div className="flex gap-3 items-center mt-[26px] col-span-full max-sm:col-span-1">
            <button type="submit" className="inline-flex items-center gap-2 border-none cursor-pointer font-inherit py-[11px] px-5 text-[14px] font-bold rounded-xl transition-all duration-200 bg-[#e50914] text-white shadow-[0_4px_14px_rgba(229,9,20,0.35)] hover:bg-[#f40612] hover:-translate-y-px" disabled={submitting}>
              {submitting ? t("common.saving") : isEdit ? t("common.save") : t("adminGalleryForm.create")}
            </button>
            <button type="button" className="inline-flex items-center gap-2 border cursor-pointer font-inherit py-[11px] px-5 text-[14px] font-bold rounded-xl transition-all duration-200 bg-[var(--app-panel2)] text-[var(--app-ink2)] border-[var(--app-edge2)] hover:bg-[rgba(229,9,20,0.08)] hover:text-brand hover:border-[rgba(229,9,20,0.35)]" onClick={() => navigate("/admin/gallery")}><X size={16} /> {t("common.cancel")}</button>
          </div>
        </div>
      </form>
    </div>
  );
}