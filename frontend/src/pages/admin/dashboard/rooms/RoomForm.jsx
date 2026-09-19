import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../../api/client";
import Select from "../../../../components/Select";
import { usePrefs } from "../../../../context/PrefsContext";
import { X } from "lucide-react";

export default function RoomForm({ isEdit = false }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = usePrefs();
  const [cinemas, setCinemas] = useState([]);
  const [form, setForm] = useState({ name: "", cinema_id: "", capacity: "" });
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/cinemas").then(({ data }) => setCinemas(data)).catch(() => {});
    if (isEdit) {
      api.get(`/rooms/${id}`)
        .then(({ data }) => setForm({ name: data.name, cinema_id: data.cinema_id, capacity: data.capacity }))
        .catch(() => setError(t("adminRoomForm.failedLoad")))
        .finally(() => setLoading(false));
    }
  }, [isEdit, id]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const payload = { name: form.name, cinema_id: form.cinema_id, capacity: parseInt(form.capacity) || 0 };
      if (isEdit) {
        await api.put(`/rooms/${id}`, payload);
      } else {
        await api.post("/rooms", payload);
      }
      navigate("/admin/rooms");
    } catch (err) {
      setError(err?.response?.data?.errors?.name?.[0] || err?.response?.data?.message || t("adminRoomForm.failedSave"));
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
        <h1 className="text-[26px] font-extrabold tracking-wide">{isEdit ? t("adminRoomForm.titleEdit") : t("adminRoomForm.titleAdd")}</h1>
        <p className="text-[14px] text-[var(--app-mute)] mt-1">{isEdit ? t("adminRoomForm.editSubtitle") : t("adminRoomForm.addSubtitle")}</p>
      </div>

      {error && <div className="bg-[rgba(229,9,20,0.12)] border border-[rgba(229,9,20,0.4)] text-[#ff6b6b] text-[13px] py-2.5 px-3.5 rounded-[10px] w-full max-w-[720px]">{error}</div>}

      <form className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl p-7 w-full max-w-[720px]" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-[18px] max-sm:grid-cols-1">
          <div className="flex flex-col gap-[7px]">
            <label className="text-[13px] font-bold text-[var(--app-ink2)]">{t("adminRoomForm.roomName")} <span className="text-[#e50914]">*</span></label>
            <input className="bg-[var(--app-panel2)] border border-[var(--app-edge)] rounded-xl py-3 px-3.5 text-[var(--app-ink)] font-inherit text-[14px] outline-none transition-colors duration-200 focus:border-[#e50914]" placeholder={t("adminRoomForm.namePh")} value={form.name} onChange={set("name")} required />
          </div>
          <div className="flex flex-col gap-[7px]">
            <label className="text-[13px] font-bold text-[var(--app-ink2)]">{t("adminRoomForm.cinema")} <span className="text-[#e50914]">*</span></label>
            <Select className="bg-[var(--app-panel2)] border border-[var(--app-edge)] rounded-xl py-3 px-3.5 text-[var(--app-ink)] font-inherit text-[14px] outline-none transition-colors duration-200 focus:border-[#e50914] cursor-pointer appearance-none" value={form.cinema_id} onChange={set("cinema_id")} required>
              <option value="">{t("adminRoomForm.selectCinema")}</option>
              {cinemas.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </div>
          <div className="flex flex-col gap-[7px]">
            <label className="text-[13px] font-bold text-[var(--app-ink2)]">{t("adminRoomForm.capacity")}</label>
            <input className="bg-[var(--app-panel2)] border border-[var(--app-edge)] rounded-xl py-3 px-3.5 text-[var(--app-ink)] font-inherit text-[14px] outline-none transition-colors duration-200 focus:border-[#e50914]" type="number" min="1" value={form.capacity} onChange={set("capacity")} />
          </div>
          <div className="flex gap-3 items-center mt-[26px] col-span-full max-sm:col-span-1">
            <button type="submit" className="inline-flex items-center gap-2 border-none cursor-pointer font-inherit py-[11px] px-5 text-[14px] font-bold rounded-xl transition-all duration-200 bg-[#e50914] text-white shadow-[0_4px_14px_rgba(229,9,20,0.35)] hover:bg-[#f40612] hover:-translate-y-px" disabled={submitting}>
              {submitting ? t("common.saving") : isEdit ? t("common.save") : t("adminRoomForm.create")}
            </button>
            <button type="button" className="inline-flex items-center gap-2 border cursor-pointer font-inherit py-[11px] px-5 text-[14px] font-bold rounded-xl transition-all duration-200 bg-[var(--app-panel2)] text-[var(--app-ink2)] border-[var(--app-edge2)] hover:bg-[rgba(229,9,20,0.08)] hover:text-brand hover:border-[rgba(229,9,20,0.35)]" onClick={() => navigate("/admin/rooms")}><X size={16} /> {t("common.cancel")}</button>
          </div>
        </div>
      </form>
    </div>
  );
}
