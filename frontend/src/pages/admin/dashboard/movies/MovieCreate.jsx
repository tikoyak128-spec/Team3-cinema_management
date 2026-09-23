import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { buildFormData } from "../../../../api/client";
import Select from "../../../../components/Select";
import { usePrefs } from "../../../../context/PrefsContext";
import { X } from "lucide-react";

export default function MovieCreate() {
  const navigate = useNavigate();
  const { t } = usePrefs();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: "", movie_category_id: "", description: "", duration: "", release_date: "",
    poster: "", poster_file: null, trailer_url: "", trailer_file: null,
  });
  const [posterPreview, setPosterPreview] = useState(null);
  const [trailerPreview, setTrailerPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/categories").then(({ data }) => setCategories(data)).catch(() => {});
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const setFile = (k) => (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((prev) => ({ ...prev, [k]: file, [`${k.replace("_file", "")}_file`]: file }));
    if (k === "poster_file") {
      setPosterPreview(URL.createObjectURL(file));
    }
    if (k === "trailer_file") {
      setTrailerPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const payload = buildFormData({
        title: form.title,
        movie_category_id: form.movie_category_id,
        description: form.description,
        duration: form.duration ? parseInt(form.duration) : 0,
        release_date: form.release_date,
        poster: form.poster || null,
        poster_file: form.poster_file,
        trailer_url: form.trailer_url || null,
        trailer_file: form.trailer_file,
      });

      if (form.poster_file) payload.delete("poster");

      await api.post("/movies", payload);
      navigate("/admin/movies");
    } catch (err) {
      const errors = err?.response?.data?.errors;
      setError(errors?.title?.[0] || errors?.movie_category_id?.[0] || err?.response?.data?.message || t("adminMovieForm.failedCreate"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 text-[var(--app-ink)] [&_*]:box-border">
      <div className="flex items-center justify-between flex-wrap gap-4 w-full max-w-[720px]">
        <div>
          <h1 className="text-[26px] font-extrabold tracking-wide">{t("adminMovieForm.titleAdd")}</h1>
          <p className="text-[14px] text-[var(--app-mute)] mt-1">{t("adminMovieForm.addSubtitle")}</p>
        </div>
      </div>

      {error && <div className="bg-[rgba(229,9,20,0.12)] border border-[rgba(229,9,20,0.4)] text-[#ff6b6b] text-[13px] py-2.5 px-3.5 rounded-[10px] w-full max-w-[720px]">{error}</div>}

      <form className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl p-7 w-full max-w-[720px]" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-[18px] max-sm:grid-cols-1">
          <div className="flex flex-col gap-[7px] col-span-full max-sm:col-span-1">
            <label className="text-[13px] font-bold text-[var(--app-ink2)]">{t("adminMovieForm.movieTitle")} <span className="text-[#e50914]">*</span></label>
            <input className="bg-[var(--app-panel2)] border border-[var(--app-edge)] rounded-xl py-3 px-3.5 text-[var(--app-ink)] font-inherit text-[14px] outline-none transition-colors duration-200 focus:border-[#e50914]" placeholder={t("adminMovieForm.titlePh")} value={form.title} onChange={set("title")} required />
          </div>

          <div className="flex flex-col gap-[7px]">
            <label className="text-[13px] font-bold text-[var(--app-ink2)]">{t("adminMovieForm.category")} <span className="text-[#e50914]">*</span></label>
            <Select className="bg-[var(--app-panel2)] border border-[var(--app-edge)] rounded-xl py-3 px-3.5 text-[var(--app-ink)] font-inherit text-[14px] outline-none transition-colors duration-200 focus:border-[#e50914] cursor-pointer appearance-none" value={form.movie_category_id} onChange={set("movie_category_id")} required>
              <option value="">{t("adminMovieForm.selectCategory")}</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </div>

          <div className="flex flex-col gap-[7px]">
            <label className="text-[13px] font-bold text-[var(--app-ink2)]">{t("adminMovieForm.duration")} <span className="text-[#e50914]">*</span></label>
            <input className="bg-[var(--app-panel2)] border border-[var(--app-edge)] rounded-xl py-3 px-3.5 text-[var(--app-ink)] font-inherit text-[14px] outline-none transition-colors duration-200 focus:border-[#e50914]" type="number" min="1" placeholder={t("adminMovieForm.durationPh")} value={form.duration} onChange={set("duration")} required />
          </div>

          <div className="flex flex-col gap-[7px]">
            <label className="text-[13px] font-bold text-[var(--app-ink2)]">{t("adminMovieForm.releaseDate")} <span className="text-[#e50914]">*</span></label>
            <input className="bg-[var(--app-panel2)] border border-[var(--app-edge)] rounded-xl py-3 px-3.5 text-[var(--app-ink)] font-inherit text-[14px] outline-none transition-colors duration-200 focus:border-[#e50914]" type="date" value={form.release_date} onChange={set("release_date")} required />
          </div>

          <div className="flex flex-col gap-[7px] col-span-full max-sm:col-span-1">
            <label className="text-[13px] font-bold text-[var(--app-ink2)]">{t("adminMovieForm.posterUrl")}</label>
            <input className="bg-[var(--app-panel2)] border border-[var(--app-edge)] rounded-xl py-3 px-3.5 text-[var(--app-ink)] font-inherit text-[14px] outline-none transition-colors duration-200 focus:border-[#e50914]" type="file" accept="image/*" onChange={setFile("poster_file")} />
            {posterPreview && (
              <div className="flex items-center gap-3 mt-2">
                <img src={posterPreview} alt="Poster preview" className="w-16 h-24 object-cover rounded-lg border border-[var(--app-edge)]" />
                <button type="button" className="text-[12px] text-[#e50914] font-bold bg-transparent border-none cursor-pointer" onClick={() => { setForm((prev) => ({ ...prev, poster_file: null })); setPosterPreview(null); }}>{t("common.remove") ?? "Remove"}</button>
              </div>
            )}
            {!posterPreview && (
              <div className="flex flex-col gap-1.5">
                <span className="text-[12px] text-[var(--app-mute)]">{t("adminMovieForm.orUseUrl") ?? "Or paste a URL instead"}</span>
                <input className="bg-[var(--app-panel2)] border border-[var(--app-edge)] rounded-xl py-3 px-3.5 text-[var(--app-ink)] font-inherit text-[14px] outline-none transition-colors duration-200 focus:border-[#e50914]" type="url" placeholder={t("adminMovieForm.posterPh")} value={form.poster} onChange={set("poster")} />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-[7px] col-span-full max-sm:col-span-1">
            <label className="text-[13px] font-bold text-[var(--app-ink2)]">{t("adminMovieForm.trailerUrl")}</label>
            <input className="bg-[var(--app-panel2)] border border-[var(--app-edge)] rounded-xl py-3 px-3.5 text-[var(--app-ink)] font-inherit text-[14px] outline-none transition-colors duration-200 focus:border-[#e50914]" type="file" accept="video/*" onChange={setFile("trailer_file")} />
            {trailerPreview && (
              <div className="flex items-center gap-3 mt-2">
                <video src={trailerPreview} controls className="w-48 h-28 object-cover rounded-lg border border-[var(--app-edge)]" />
                <button type="button" className="text-[12px] text-[#e50914] font-bold bg-transparent border-none cursor-pointer" onClick={() => { setForm((prev) => ({ ...prev, trailer_file: null })); setTrailerPreview(null); }}>{t("common.remove") ?? "Remove"}</button>
              </div>
            )}
            {!trailerPreview && (
              <div className="flex flex-col gap-1.5">
                <span className="text-[12px] text-[var(--app-mute)]">{t("adminMovieForm.orUseUrl") ?? "Or paste a URL instead"}</span>
                <input className="bg-[var(--app-panel2)] border border-[var(--app-edge)] rounded-xl py-3 px-3.5 text-[var(--app-ink)] font-inherit text-[14px] outline-none transition-colors duration-200 focus:border-[#e50914]" type="url" placeholder={t("adminMovieForm.trailerPh")} value={form.trailer_url} onChange={set("trailer_url")} />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-[7px] col-span-full max-sm:col-span-1">
            <label className="text-[13px] font-bold text-[var(--app-ink2)]">{t("adminMovieForm.description")} <span className="text-[#e50914]">*</span></label>
            <textarea className="bg-[var(--app-panel2)] border border-[var(--app-edge)] rounded-xl py-3 px-3.5 text-[var(--app-ink)] font-inherit text-[14px] outline-none transition-colors duration-200 focus:border-[#e50914] resize-y min-h-[100px]" placeholder={t("adminMovieForm.descriptionPh")} value={form.description} onChange={set("description")} required />
          </div>

          <div className="flex gap-3 items-center mt-[26px] col-span-full max-sm:col-span-1">
            <button type="submit" className="inline-flex items-center gap-2 border-none cursor-pointer font-inherit py-[11px] px-5 text-[14px] font-bold rounded-xl transition-all duration-200 bg-[#e50914] text-white shadow-[0_4px_14px_rgba(229,9,20,0.35)] hover:bg-[#f40612] hover:-translate-y-px" disabled={submitting}>
              {submitting ? t("adminMovieForm.creating") : t("adminMovieForm.create")}
            </button>
            <button type="button" className="inline-flex items-center gap-2 border cursor-pointer font-inherit py-[11px] px-5 text-[14px] font-bold rounded-xl transition-all duration-200 bg-[var(--app-panel2)] text-[var(--app-ink2)] border-[var(--app-edge2)] hover:bg-[rgba(229,9,20,0.08)] hover:text-brand hover:border-[rgba(229,9,20,0.35)]" onClick={() => navigate("/admin/movies")}><X size={16} /> {t("common.cancel")}</button>
          </div>
        </div>
      </form>
    </div>
  );
}