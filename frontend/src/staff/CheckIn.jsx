import { useState } from "react";
import { Armchair, CalendarClock, CircleCheck, Clapperboard, DoorOpen, ScanLine, Search, TriangleAlert } from "lucide-react";
import api from "../api/client";
import { usePrefs } from "../context/PrefsContext";

const fmtDate = (s) => {
  if (!s) return "—";
  const d = new Date(s.replace(" ", "T"));
  return isNaN(d) ? s : d.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
};

export default function CheckIn() {
  const { t } = usePrefs();
  const [code, setCode] = useState("");
  const [tickets, setTickets] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [checkingId, setCheckingId] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!code.trim()) { setError(t("staff.enterCodeError")); return; }
    setSearched(false);
    setLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      const { data } = await api.get("/staff/tickets/search", { params: { code: code.trim() } });
      setTickets(data);
    } catch (err) {
      setTickets([]);
      setError(err?.response?.data?.message || t("staff.searching"));
    } finally {
      setSearched(true);
      setLoading(false);
    }
  };

  const handleCheckIn = async (tk) => {
    setCheckingId(tk.id);
    setError("");
    setSuccessMsg("");
    try {
      const { data } = await api.post(`/staff/tickets/${tk.id}/check-in`);
      setTickets((prev) => prev.map((t) => (t.id === tk.id ? { ...t, status: "checked_in" } : t)));
      setSuccessMsg(t("staff.checkedInMsg", { code: data.ticket_code || tk.ticket_code }));
    } catch (err) {
      const msg = err?.response?.data?.message || t("staff.checkingIn");
      setError(msg);
      if (err?.response?.data?.ticket) {
        setTickets((prev) => prev.map((t) => (t.id === tk.id ? { ...err.response.data.ticket } : t)));
      }
    } finally {
      setCheckingId(null);
    }
  };

  const statusBadge = (s) =>
    s === "valid"
      ? "bg-[rgba(22,163,74,0.14)] text-[#22c55e] border border-[rgba(34,197,94,0.3)]"
      : s === "checked_in"
      ? "bg-[rgba(96,165,250,0.14)] text-[#60a5fa] border border-[rgba(96,165,250,0.3)]"
      : "bg-[rgba(229,9,20,0.14)] text-[#e50914] border border-[rgba(229,9,20,0.3)]";

  return (
    <div className="flex flex-col gap-6 text-[var(--app-ink)]">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-[26px] font-extrabold">{t("staff.checkIn")}</h1>
          <p className="text-sm text-[var(--app-mute)] mt-1">{t("staff.checkInSubtitle")}</p>
        </div>
      </div>

      <form className="flex items-center gap-3.5 bg-[var(--app-deep)] border-2 border-[var(--app-edge)] rounded-2xl py-5 px-6 mb-5" onSubmit={handleSearch}>
        <span className="text-2xl"><ScanLine size={18} /></span>
        <input
          className="bg-transparent border-none outline-none text-[var(--app-ink)] text-lg w-full placeholder:text-[var(--app-ink2)]"
          placeholder={t("staff.scanPlaceholder")}
          value={code}
          onChange={(e) => { setCode(e.target.value); setError(""); setSuccessMsg(""); }}
        />
        <button type="submit" className="inline-flex items-center gap-2 border-none cursor-pointer py-[11px] px-5 text-sm font-bold rounded-xl transition-all duration-200 bg-[#22a34e] text-white shadow-[0_4px_14px_rgba(34,163,78,0.35)] hover:bg-[#1e9344]">
          {loading ? t("staff.searching") : t("staff.validate")}
        </button>
      </form>

      {error && (
        <div className="bg-[rgba(229,9,20,0.12)] border border-[rgba(229,9,20,0.4)] text-[#ff6b6b] text-[13px] p-[10px_14px] rounded-[10px] flex justify-between items-center">
          {error}
          <button onClick={() => setError("")} className="bg-transparent border-none text-[#ff6b6b] text-[18px] cursor-pointer leading-none">×</button>
        </div>
      )}

      {successMsg && (
        <div className="bg-[rgba(34,197,94,0.12)] border border-[rgba(34,197,94,0.4)] text-[#22c55e] text-[13px] p-[10px_14px] rounded-[10px] flex justify-between items-center font-bold">
          <span className="inline-flex items-center gap-2"><CircleCheck size={16} /> {successMsg}</span>
          <button onClick={() => setSuccessMsg("")} className="bg-transparent border-none text-[#22c55e] text-[18px] cursor-pointer leading-none">×</button>
        </div>
      )}

      {searched && !loading && tickets.length === 0 && !error && (
        <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl p-6">
          <div className="[text-align:center] py-[30px] text-[var(--app-mute)]">
            <div className="text-[44px] mb-[10px]"><Search size={44} /></div>
            <p>{t("staff.noTicketFound", { code: code.toUpperCase() })}</p>
          </div>
        </div>
      )}

      {tickets.length > 0 && (
        <div className="flex flex-col gap-4">
          {tickets.map((tk) => (
            <div key={tk.id} className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl p-6">
              <div className="flex items-center gap-3.5 flex-wrap justify-between mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-[44px] h-[44px] rounded-full bg-[rgba(34,163,78,0.12)] flex items-center justify-center text-lg shrink-0"><Clapperboard size={20} /></div>
                  <div className="min-w-0">
                    <div className="font-extrabold text-base">{tk.ticket_code}</div>
                    <div className="text-[13px] text-[var(--app-mute)]">{tk.booking?.booking_code}</div>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-[5px] text-xs font-bold rounded-[20px] whitespace-nowrap ${statusBadge(tk.status)}`}>{tk.status}</span>
              </div>

              <div className="bg-[var(--app-panel2)] border border-[var(--app-edge)] rounded-[14px] p-[22px]">
                <div className="flex justify-between items-center py-3 border-b border-[var(--app-edge)] last:border-b-0"><span className="text-[13px] text-[var(--app-mute)] font-semibold">{t("staff.movie")}</span><span className="text-[15px] font-bold text-right">{tk.booking?.showtime?.movie?.title}</span></div>
                <div className="flex justify-between items-center py-3 border-b border-[var(--app-edge)] last:border-b-0"><span className="text-[13px] text-[var(--app-mute)] font-semibold">{t("staff.cinema")}</span><span className="text-[15px] font-bold text-right">{tk.booking?.showtime?.room?.cinema?.name} · {tk.booking?.showtime?.room?.name}</span></div>
                <div className="flex justify-between items-center py-3 border-b border-[var(--app-edge)] last:border-b-0"><span className="text-[13px] text-[var(--app-mute)] font-semibold">{t("staff.showtime")}</span><span className="text-[15px] font-bold text-right">{fmtDate(tk.booking?.showtime?.start_time)}</span></div>
                <div className="flex justify-between items-center py-3 last:border-b-0">
                  <span className="text-[13px] text-[var(--app-mute)] font-semibold">{t("staff.seat")}</span>
                  <span className="text-[15px] font-bold text-right inline-flex items-center gap-2">
                    {(tk.booking?.booking_seats || []).map((bs) => (
                      <span key={bs.id} className="inline-flex items-center gap-1.5 bg-[var(--app-panel2)] border border-[var(--app-edge2)] text-[var(--app-ink2)] py-1.5 px-3 rounded-[10px] text-[13px] font-semibold"><Armchair size={13} /> {bs.seat?.seat_number}</span>
                    ))}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                {tk.status === "valid" ? (
                  <button onClick={() => handleCheckIn(tk)} disabled={checkingId !== null} className="inline-flex items-center gap-2 border-none cursor-pointer py-[11px] px-5 text-sm font-bold rounded-xl transition-all duration-200 bg-[#22a34e] text-white shadow-[0_4px_14px_rgba(34,163,78,0.35)] hover:bg-[#1e9344] disabled:opacity-60 disabled:cursor-not-allowed">
                    <CircleCheck size={16} /> {checkingId === tk.id ? t("staff.checkingIn") : t("staff.checkInBtn")}
                  </button>
                ) : (
                  <span className="text-[12px] text-[var(--app-mute)] inline-flex items-center gap-1.5"><CalendarClock size={13} /> {tk.status === "checked_in" ? t("staff.alreadyCheckedIn") : t("staff.cannotBeCheckedIn")}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}