import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../../api/client";
import { usePrefs } from "../../../../context/PrefsContext";

export default function MovieEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = usePrefs();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: "", movie_category_id: "", description: "", duration: "", release_date: "", poster: "", trailer_url: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api.get(`/movies/${id}`),
      api.get("/categories"),
    ]).then(([movieRes, catRes]) => {
      const m = movieRes.data;
      setForm({
        title: m.title,
        movie_category_id: m.movie_category_id,
        description: m.description || "",
        duration: m.duration || "",
        release_date: m.release_date || "",
        poster: m.poster || "",
        trailer_url: m.trailer_url || "",
      });
      setCategories(catRes.data);
    }).catch(() => setError(t("adminMovieForm.failedLoad")))
      .finally(() => setLoading(false));
  }, [id]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await api.put(`/movies/${id}`, {
        title: form.title,
        movie_category_id: form.movie_category_id,
        description: form.description,
        duration: form.duration ? parseInt(form.duration) : 0,
        release_date: form.release_date,
        poster: form.poster || "https://via.placeholder.com/300x450",
        trailer_url: form.trailer_url || null,
      });
      navigate("/admin/movies");
    } catch (err) {
      const errors = err?.response?.data?.errors;
      setError(errors?.title?.[0] || err?.response?.data?.message || t("adminMovieForm.failedUpdate"));
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
          <h1 className="text-[26px] font-extrabold tracking-wide">{t("adminMovieForm.titleEdit")}</h1>
          <p className="text-[14px] text-[var(--app-mute)] mt-1">{t("adminMovieForm.editSubtitle")}</p>
        </div>
      </div>

      {error && <div className="bg-[rgba(229,9,20,0.12)] border border-[rgba(229,9,20,0.4)] text-[#ff6b6b] text-[13px] py-2.5 px-3.5 rounded-[10px] w-full max-w-[720px]">{error}</div>}

      <form className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl p-7 w-full max-w-[720px]" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-[18px] max-sm:grid-cols-1">
          <div className="flex flex-col gap-[7px] col-span-full max-sm:col-span-1">
            <label className="text-[13px] font-bold text-[var(--app-ink2)]">{t("adminMovieForm.movieTitle")} <span className="text-[#e50914]">*</span></label>
            <input className="bg-[var(--app-panel2)] border border-[var(--app-edge)] rounded-xl py-3 px-3.5 text-[var(--app-ink)] font-inherit text-[14px] outline-none transition-colors duration-200 focus:border-[#e50914]" value={form.title} onChange={set("title")} required />
          </div>

          <div className="flex flex-col gap-[7px]">
            <label className="text-[13px] font-bold text-[var(--app-ink2)]">{t("adminMovieForm.category")} <span className="text-[#e50914]">*</span></label>
            <select className="bg-[var(--app-panel2)] border border-[var(--app-edge)] rounded-xl py-3 px-3.5 text-[var(--app-ink)] font-inherit text-[14px] outline-none transition-colors duration-200 focus:border-[#e50914] cursor-pointer appearance-none" value={form.movie_category_id} onChange={set("movie_category_id")} required>
              <option value="">{t("adminMovieForm.selectCategory")}</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-[7px]">
            <label className="text-[13px] font-bold text-[var(--app-ink2)]">{t("adminMovieForm.duration")}</label>
            <input className="bg-[var(--app-panel2)] border border-[var(--app-edge)] rounded-xl py-3 px-3.5 text-[var(--app-ink)] font-inherit text-[14px] outline-none transition-colors duration-200 focus:border-[#e50914]" type="number" min="1" value={form.duration} onChange={set("duration")} />
          </div>

          <div className="flex flex-col gap-[7px]">
            <label className="text-[13px] font-bold text-[var(--app-ink2)]">{t("adminMovieForm.releaseDate")}</label>
            <input className="bg-[var(--app-panel2)] border border-[var(--app-edge)] rounded-xl py-3 px-3.5 text-[var(--app-ink)] font-inherit text-[14px] outline-none transition-colors duration-200 focus:border-[#e50914]" type="date" value={form.release_date} onChange={set("release_date")} />
          </div>

          <div className="flex flex-col gap-[7px] col-span-full max-sm:col-span-1">
            <label className="text-[13px] font-bold text-[var(--app-ink2)]">{t("adminMovieForm.posterUrl")}</label>
            <input className="bg-[var(--app-panel2)] border border-[var(--app-edge)] rounded-xl py-3 px-3.5 text-[var(--app-ink)] font-inherit text-[14px] outline-none transition-colors duration-200 focus:border-[#e50914]" type="url" value={form.poster} onChange={set("poster")} />
          </div>

          <div className="flex flex-col gap-[7px] col-span-full max-sm:col-span-1">
            <label className="text-[13px] font-bold text-[var(--app-ink2)]">{t("adminMovieForm.trailerUrl")}</label>
            <input className="bg-[var(--app-panel2)] border border-[var(--app-edge)] rounded-xl py-3 px-3.5 text-[var(--app-ink)] font-inherit text-[14px] outline-none transition-colors duration-200 focus:border-[#e50914]" type="url" value={form.trailer_url} onChange={set("trailer_url")} />
          </div>

          <div className="flex flex-col gap-[7px] col-span-full max-sm:col-span-1">
            <label className="text-[13px] font-bold text-[var(--app-ink2)]">{t("adminMovieForm.description")}</label>
            <textarea className="bg-[var(--app-panel2)] border border-[var(--app-edge)] rounded-xl py-3 px-3.5 text-[var(--app-ink)] font-inherit text-[14px] outline-none transition-colors duration-200 focus:border-[#e50914] resize-y min-h-[100px]" value={form.description} onChange={set("description")} />
          </div>

          <div className="flex gap-3 items-center mt-[26px] col-span-full max-sm:col-span-1">
            <button type="submit" className="inline-flex items-center gap-2 border-none cursor-pointer font-inherit py-[11px] px-5 text-[14px] font-bold rounded-xl transition-all duration-200 bg-[#e50914] text-white shadow-[0_4px_14px_rgba(229,9,20,0.35)] hover:bg-[#f40612] hover:-translate-y-px" disabled={submitting}>
              {submitting ? t("common.saving") : t("common.save")}
            </button>
            <button type="button" className="inline-flex items-center gap-2 border-none cursor-pointer font-inherit py-[11px] px-5 text-[14px] font-bold rounded-xl transition-all duration-200 bg-transparent text-[var(--app-ink2)] border border-[var(--app-edge2)] hover:bg-[var(--app-fill)] hover:border-[var(--app-edge2)]" onClick={() => navigate("/admin/movies")}>{t("common.cancel")}</button>
          </div>
        </div>
      </form>
    </div>
  );
}
