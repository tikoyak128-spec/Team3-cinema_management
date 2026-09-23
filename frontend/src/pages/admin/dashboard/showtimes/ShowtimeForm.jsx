import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../../api/client";
import Select from "../../../../components/Select";
import { usePrefs } from "../../../../context/PrefsContext";
import { X } from "lucide-react";

export default function ShowtimeForm({ isEdit = false }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = usePrefs();
  const [movies, setMovies] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState({ movie_id: "", cinema_room_id: "", start_time: "", end_time: "", price: "" });
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.get("/movies"), api.get("/rooms")]).then(([m, r]) => {
      setMovies(m.data);
      setRooms(r.data);
    }).catch(() => {});
    if (isEdit) {
      api.get(`/showtimes/${id}`)
        .then(({ data }) => {
          setForm({
            movie_id: data.movie_id,
            cinema_room_id: data.cinema_room_id,
            start_time: data.start_time ? data.start_time.replace(" ", "T").slice(0, 16) : "",
            end_time: data.end_time ? data.end_time.replace(" ", "T").slice(0, 16) : "",
            price: data.price,
          });
        })
        .catch(() => setError(t("adminShowtimeForm.failedLoad")))
        .finally(() => setLoading(false));
    }
  }, [isEdit, id]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        movie_id: form.movie_id,
        cinema_room_id: form.cinema_room_id,
        start_time: form.start_time,
        end_time: form.end_time,
        price: parseFloat(form.price),
      };
      if (isEdit) {
        await api.put(`/showtimes/${id}`, payload);
      } else {
        await api.post("/showtimes", payload);
      }
      navigate("/admin/showtimes");
    } catch (err) {
      setError(err?.response?.data?.errors?.movie_id?.[0] || err?.response?.data?.message || t("adminShowtimeForm.failedSave"));
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
        <h1 className="text-[26px] font-extrabold tracking-wide">{isEdit ? t("adminShowtimeForm.titleEdit") : t("adminShowtimeForm.titleAdd")}</h1>
        <p className="text-[14px] text-[var(--app-mute)] mt-1">{isEdit ? t("adminShowtimeForm.editSubtitle") : t("adminShowtimeForm.addSubtitle")}</p>
      </div>

      {error && <div className="bg-[rgba(229,9,20,0.12)] border border-[rgba(229,9,20,0.4)] text-[#ff6b6b] text-[13px] py-2.5 px-3.5 rounded-[10px] w-full max-w-[720px]">{error}</div>}

      <form className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl p-7 w-full max-w-[720px]" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-[18px] max-sm:grid-cols-1">
          <div className="flex flex-col gap-[7px] col-span-full max-sm:col-span-1">
            <label className="text-[13px] font-bold text-[var(--app-ink2)]">{t("adminShowtimeForm.movie")} <span className="text-[#e50914]">*</span></label>
            <Select className="bg-[var(--app-panel2)] border border-[var(--app-edge)] rounded-xl py-3 px-3.5 text-[var(--app-ink)] font-inherit text-[14px] outline-none transition-colors duration-200 focus:border-[#e50914] cursor-pointer appearance-none" value={form.movie_id} onChange={set("movie_id")} required>
              <option value="">{t("adminShowtimeForm.selectMovie")}</option>
              {movies.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
            </Select>
          </div>
          <div className="flex flex-col gap-[7px]">
            <label className="text-[13px] font-bold text-[var(--app-ink2)]">{t("adminShowtimeForm.room")} <span className="text-[#e50914]">*</span></label>
            <Select className="bg-[var(--app-panel2)] border border-[var(--app-edge)] rounded-xl py-3 px-3.5 text-[var(--app-ink)] font-inherit text-[14px] outline-none transition-colors duration-200 focus:border-[#e50914] cursor-pointer appearance-none" value={form.cinema_room_id} onChange={set("cinema_room_id")} required>
              <option value="">{t("adminShowtimeForm.selectRoom")}</option>
              {rooms.map((r) => <option key={r.id} value={r.id}>{r.name} ({r.cinema?.name})</option>)}
            </Select>
          </div>
          <div className="flex flex-col gap-[7px]">
            <label className="text-[13px] font-bold text-[var(--app-ink2)]">{t("adminShowtimeForm.startTime")} <span className="text-[#e50914]">*</span></label>
            <input className="bg-[var(--app-panel2)] border border-[var(--app-edge)] rounded-xl py-3 px-3.5 text-[var(--app-ink)] font-inherit text-[14px] outline-none transition-colors duration-200 focus:border-[#e50914]" type="datetime-local" value={form.start_time} onChange={set("start_time")} required />
          </div>
          <div className="flex flex-col gap-[7px]">
            <label className="text-[13px] font-bold text-[var(--app-ink2)]">{t("adminShowtimeForm.endTime")} <span className="text-[#e50914]">*</span></label>
            <input className="bg-[var(--app-panel2)] border border-[var(--app-edge)] rounded-xl py-3 px-3.5 text-[var(--app-ink)] font-inherit text-[14px] outline-none transition-colors duration-200 focus:border-[#e50914]" type="datetime-local" value={form.end_time} onChange={set("end_time")} required />
          </div>
          <div className="flex flex-col gap-[7px]">
            <label className="text-[13px] font-bold text-[var(--app-ink2)]">{t("adminShowtimeForm.ticketPrice")} <span className="text-[#e50914]">*</span></label>
            <input className="bg-[var(--app-panel2)] border border-[var(--app-edge)] rounded-xl py-3 px-3.5 text-[var(--app-ink)] font-inherit text-[14px] outline-none transition-colors duration-200 focus:border-[#e50914]" type="number" step="0.01" min="0" placeholder="5.00" value={form.price} onChange={set("price")} required />
          </div>
          <div className="flex gap-3 items-center mt-[26px] col-span-full max-sm:col-span-1">
            <button type="submit" className="inline-flex items-center gap-2 border-none cursor-pointer font-inherit py-[11px] px-5 text-[14px] font-bold rounded-xl transition-all duration-200 bg-[#e50914] text-white shadow-[0_4px_14px_rgba(229,9,20,0.35)] hover:bg-[#f40612] hover:-translate-y-px" disabled={submitting}>
              {submitting ? t("common.saving") : isEdit ? t("common.save") : t("admin.addShowtime")}
            </button>
            <button type="button" className="inline-flex items-center gap-2 border cursor-pointer font-inherit py-[11px] px-5 text-[14px] font-bold rounded-xl transition-all duration-200 bg-[var(--app-panel2)] text-[var(--app-ink2)] border-[var(--app-edge2)] hover:bg-[rgba(229,9,20,0.08)] hover:text-brand hover:border-[rgba(229,9,20,0.35)]" onClick={() => navigate("/admin/showtimes")}><X size={16} /> {t("common.cancel")}</button>
          </div>
        </div>
      </form>
    </div>
  );
}
