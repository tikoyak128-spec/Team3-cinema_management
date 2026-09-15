import { useEffect, useMemo, useState } from "react";
import { Armchair, CircleCheck, CircleDollarSign, SearchX, Ticket } from "lucide-react";
import api from "../api/client";
import { usePrefs } from "../context/PrefsContext";

const fmtTime = (s) => {
  if (!s) return "—";
  const d = new Date(s.replace(" ", "T"));
  return isNaN(d) ? s : d.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
};

export default function Dashboard() {
  const { t } = usePrefs();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    api.get("/staff/bookings")
      .then(({ data }) => { if (!cancelled) setBookings(data); })
      .catch((err) => { if (!cancelled) setError(err?.response?.data?.message || t("staff.loadingBookings")); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todays = bookings.filter((b) => (b.created_at || "").slice(0, 10) === today);
    const confirmed = bookings.filter((b) => b.status === "confirmed");
    const scanned = bookings.reduce((n, b) => n + (b.tickets || []).filter((t) => t.status === "checked_in").length, 0);
    const revenue = confirmed.reduce((sum, b) => sum + Number(b.total_amount || 0), 0);
    return [
      { label: t("staff.bookingsToday"), value: todays.length, icon: Ticket, color: "#e50914" },
      { label: t("staff.ticketsScanned"), value: scanned, icon: CircleCheck, color: "#22c55e" },
      { label: t("staff.confirmedBookings"), value: confirmed.length, icon: CircleDollarSign, color: "#60a5fa" },
      { label: t("staff.revenue"), value: `$${revenue.toFixed(2)}`, icon: CircleDollarSign, color: "#eab308" },
    ];
  }, [bookings, t]);

  const recent = useMemo(() => [...bookings].sort((a, b) => (b.created_at || "").localeCompare(a.created_at || "")).slice(0, 6), [bookings]);

  const statusBadge = (s) =>
    s === "confirmed"
      ? "bg-[rgba(22,163,74,0.14)] text-[#22c55e] border border-[rgba(34,197,94,0.3)]"
      : s === "pending"
      ? "bg-[rgba(234,179,8,0.14)] text-[#eab308] border border-[rgba(234,179,8,0.3)]"
      : "bg-[rgba(229,9,20,0.14)] text-[#e50914] border border-[rgba(229,9,20,0.3)]";

  return (
    <div className="flex flex-col gap-6 text-[var(--app-ink)]">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-[26px] font-extrabold">{t("staff.staffDashboard")}</h1>
          <p className="text-sm text-[var(--app-mute)] mt-1">{t("staff.dashboardSubtitle")}</p>
        </div>
      </div>

      {error && (
        <div className="bg-[rgba(229,9,20,0.12)] border border-[rgba(229,9,20,0.4)] text-[#ff6b6b] text-[13px] p-[10px_14px] rounded-[10px] flex justify-between items-center">
          {error}
          <button onClick={() => setError("")} className="bg-transparent border-none text-[#ff6b6b] text-[18px] cursor-pointer leading-none">×</button>
        </div>
      )}

      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] max-[640px]:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-5">
        {stats.map((s) => (
          <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl p-[22px] transition-all duration-200 hover:-translate-y-[3px] hover:border-[rgba(229,9,20,0.4)]" key={s.label}>
            <span className="text-[26px] float-right opacity-80"><s.icon size={22} /></span>
            <div className="text-[13px] text-[var(--app-mute)] font-semibold">{s.label}</div>
            <div className="text-[32px] font-extrabold mt-1.5 text-[var(--c)]" style={{ "--c": s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl p-6">
        <h2 className="text-lg font-extrabold mb-[18px]">{t("staff.recentBookings")}</h2>
        {loading ? (
          <p className="text-[var(--app-mute)] py-4">{t("staff.loadingBookings")}</p>
        ) : recent.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-[30px] text-[var(--app-mute)] [text-align:center]">
            <div className="text-[40px] mb-2"><SearchX size={28} /></div>
            <p>{t("staff.noBookings")}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {recent.map((b) => (
              <div key={b.id} className="flex justify-between items-center p-4 bg-[var(--app-panel2)] rounded-xl border border-[var(--app-edge)] flex-wrap gap-3">
                <div>
                  <div className="font-bold text-[15px]">{b.user?.name || t("staff.walkIn")}</div>
                  <div className="text-[13px] text-[var(--app-mute)] mt-1">
                    {b.showtime?.movie?.title} · {b.booking_code} · {fmtTime(b.created_at)}
                  </div>
                  <div className="text-[12px] text-[var(--app-mute)] mt-1 flex flex-wrap items-center gap-1.5">
                    {(b.booking_seats || []).map((bs) => (
                      <span key={bs.id} className="inline-flex items-center gap-1 bg-[var(--app-fill)] border border-[var(--app-edge2)] px-2 py-0.5 rounded-[6px]"><Armchair size={11} /> {bs.seat?.seat_number}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-[var(--app-ink)]">${Number(b.total_amount).toFixed(2)}</span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-[5px] text-xs font-bold rounded-[20px] whitespace-nowrap ${statusBadge(b.status)}`}>{b.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}