import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../../api/client";
import { usePrefs } from "../../../../context/PrefsContext";

export default function SeatForm({ isEdit = false }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = usePrefs();
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState({ cinema_room_id: "", seat_number: "", row: "", seat_type: "regular" });
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/rooms").then(({ data }) => setRooms(data)).catch(() => {});
    if (isEdit) {
      api.get(`/seats/${id}`)
        .then(({ data }) => setForm({ cinema_room_id: data.cinema_room_id, seat_number: data.seat_number, row: data.row || "", seat_type: data.seat_type }))
        .catch(() => setError(t("adminSeatForm.failedLoad")))
        .finally(() => setLoading(false));
    }
  }, [isEdit, id]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      if (isEdit) {
        await api.put(`/seats/${id}`, form);
      } else {
        await api.post("/seats", form);
      }
      navigate("/admin/seats");
    } catch (err) {
      setError(err?.response?.data?.errors?.seat_number?.[0] || err?.response?.data?.message || t("adminSeatForm.failedSave"));
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
        <h1 className="text-[26px] font-extrabold tracking-wide">{isEdit ? t("adminSeatForm.titleEdit") : t("adminSeatForm.titleAdd")}</h1>
        <p className="text-[14px] text-[var(--app-mute)] mt-1">{isEdit ? t("adminSeatForm.editSubtitle") : t("adminSeatForm.addSubtitle")}</p>
      </div>

      {error && <div className="bg-[rgba(229,9,20,0.12)] border border-[rgba(229,9,20,0.4)] text-[#ff6b6b] text-[13px] py-2.5 px-3.5 rounded-[10px] w-full max-w-[720px]">{error}</div>}

      <form className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl p-7 w-full max-w-[720px]" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-[18px] max-sm:grid-cols-1">
          <div className="flex flex-col gap-[7px]">
            <label className="text-[13px] font-bold text-[var(--app-ink2)]">{t("adminSeatForm.room")} <span className="text-[#e50914]">*</span></label>
            <select className="bg-[var(--app-panel2)] border border-[var(--app-edge)] rounded-xl py-3 px-3.5 text-[var(--app-ink)] font-inherit text-[14px] outline-none transition-colors duration-200 focus:border-[#e50914] cursor-pointer appearance-none" value={form.cinema_room_id} onChange={set("cinema_room_id")} required>
              <option value="">{t("adminSeatForm.selectRoom")}</option>
              {rooms.map((r) => <option key={r.id} value={r.id}>{r.name} ({r.cinema?.name})</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-[7px]">
            <label className="text-[13px] font-bold text-[var(--app-ink2)]">{t("adminSeatForm.seatNumber")} <span className="text-[#e50914]">*</span></label>
            <input className="bg-[var(--app-panel2)] border border-[var(--app-edge)] rounded-xl py-3 px-3.5 text-[var(--app-ink)] font-inherit text-[14px] outline-none transition-colors duration-200 focus:border-[#e50914]" placeholder={t("adminSeatForm.seatNumberPh")} value={form.seat_number} onChange={set("seat_number")} required />
          </div>
          <div className="flex flex-col gap-[7px]">
            <label className="text-[13px] font-bold text-[var(--app-ink2)]">{t("adminSeatForm.row")}</label>
            <input className="bg-[var(--app-panel2)] border border-[var(--app-edge)] rounded-xl py-3 px-3.5 text-[var(--app-ink)] font-inherit text-[14px] outline-none transition-colors duration-200 focus:border-[#e50914]" placeholder={t("adminSeatForm.rowPh")} value={form.row} onChange={set("row")} />
          </div>
          <div className="flex flex-col gap-[7px]">
            <label className="text-[13px] font-bold text-[var(--app-ink2)]">{t("adminSeatForm.seatType")} <span className="text-[#e50914]">*</span></label>
            <select className="bg-[var(--app-panel2)] border border-[var(--app-edge)] rounded-xl py-3 px-3.5 text-[var(--app-ink)] font-inherit text-[14px] outline-none transition-colors duration-200 focus:border-[#e50914] cursor-pointer appearance-none" value={form.seat_type} onChange={set("seat_type")}>
              <option value="regular">{t("seatType.regular")}</option>
              <option value="vip">{t("seatType.vip")}</option>
              <option value="couple">{t("seatType.couple")}</option>
            </select>
          </div>
          <div className="flex gap-3 items-center mt-[26px] col-span-full max-sm:col-span-1">
            <button type="submit" className="inline-flex items-center gap-2 border-none cursor-pointer font-inherit py-[11px] px-5 text-[14px] font-bold rounded-xl transition-all duration-200 bg-[#e50914] text-white shadow-[0_4px_14px_rgba(229,9,20,0.35)] hover:bg-[#f40612] hover:-translate-y-px" disabled={submitting}>
              {submitting ? t("common.saving") : isEdit ? t("common.save") : t("admin.addSeat")}
            </button>
            <button type="button" className="inline-flex items-center gap-2 border-none cursor-pointer font-inherit py-[11px] px-5 text-[14px] font-bold rounded-xl transition-all duration-200 bg-transparent text-[var(--app-ink2)] border border-[var(--app-edge2)] hover:bg-[var(--app-fill)]" onClick={() => navigate("/admin/seats")}>{t("common.cancel")}</button>
          </div>
        </div>
      </form>
    </div>
  );
}
