import { useEffect, useState } from "react";
import { Armchair, CircleUser, MapPin, Search, Ticket } from "lucide-react";
import api from "../../../../api/client";
import { usePrefs } from "../../../../context/PrefsContext";

export default function BookingList() {
  const { t } = usePrefs();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    api.get("/bookings").then(({ data }) => { if (!cancelled) setBookings(data); })
      .catch((err) => { if (!cancelled) setError(err?.response?.data?.message || t("adminBookings.failedLoad")); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const filtered = bookings.filter((b) => {
    const q = search.toLowerCase();
    return (
      (b.user?.name || "").toLowerCase().includes(q) ||
      (b.showtime?.movie?.title || "").toLowerCase().includes(q)
    );
  });

  const statusBadge = (s) =>
    s === "confirmed" ? "bg-[rgba(22,163,74,0.14)] text-[#22c55e] border border-[rgba(34,197,94,0.3)]" : s === "pending" ? "bg-[rgba(234,179,8,0.14)] text-[#eab308] border border-[rgba(234,179,8,0.3)]" : "bg-[rgba(229,9,20,0.14)] text-[#e50914] border border-[rgba(229,9,20,0.3)]";

  const statusLabel = (s) =>
    s === "confirmed" || s === "pending" || s === "cancelled" ? t(`status.${s}`) : s;

  const seatsChips = (b) => (
    <div className="flex items-center gap-2.5 flex-wrap">
      {(b.booking_seats || []).map((bs) => (
        <span key={bs.id} className="inline-flex items-center gap-1.5 bg-[var(--app-panel2)] border border-[var(--app-edge2)] text-[var(--app-ink2)] py-1.5 px-3 rounded-[10px] text-[13px] font-semibold"><Armchair size={13} /> {bs.seat?.seat_number || "?"}</span>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col gap-6 text-[var(--app-ink)] [&_*]:box-border">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[22px] sm:text-[26px] font-extrabold tracking-wide">{t("admin.bookings")}</h1>
          <p className="text-[14px] text-[var(--app-mute)] mt-1">{t("adminBookings.subtitle")}</p>
        </div>
        <div className="flex gap-2.5 items-center">
          <span className="text-[14px] text-[var(--app-mute)]">
            {t("adminBookings.totalLabel")} <b className="text-[var(--app-ink)]">{bookings.length}</b>
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-[rgba(229,9,20,0.12)] border border-[rgba(229,9,20,0.4)] text-[#ff6b6b] text-[13px] p-[10px_14px] rounded-[10px] flex justify-between items-center">
          {error}
          <button onClick={() => setError("")} className="bg-transparent border-none text-[#ff6b6b] text-[18px] cursor-pointer leading-none">×</button>
        </div>
      )}

      <div className="flex items-center gap-2.5 bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-xl py-2.5 px-3.5 text-[var(--app-mute)] w-full sm:max-w-xs">
        <span className="shrink-0"><Search size={16} /></span>
        <input className="bg-transparent border-none outline-none text-[var(--app-ink)] font-inherit text-[14px] w-full" placeholder={t("adminBookings.searchPlaceholder")} value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 px-5 text-center text-[var(--app-mute)]">
            <p>{t("adminBookings.loading")}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-[60px] px-5 text-center text-[var(--app-mute)]">
            <div className="text-[44px] mb-3"><Ticket size={32} /></div>
            <p>{t("adminBookings.noData")}</p>
          </div>
        ) : (
          <>
            {/* Mobile / tablet card list */}
            <div className="md:hidden flex flex-col gap-3 p-4 sm:p-5">
              {filtered.map((b) => (
                <div key={b.id} className="bg-[var(--app-panel2)] border border-[var(--app-edge2)] rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-[38px] h-[38px] rounded-full bg-[rgba(229,9,20,0.12)] flex items-center justify-center text-[16px] shrink-0"><CircleUser size={18} /></div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-[var(--app-ink)] leading-snug">{b.user?.name || "Unknown"}</div>
                      <div className="text-[12px] text-[var(--app-mute)] mt-0.5">{b.user?.email || ""}</div>
                    </div>
                    <span className={`shrink-0 inline-flex items-center gap-1.5 py-[5px] px-3 text-[12px] font-bold rounded-[20px] whitespace-nowrap ${statusBadge(b.status)}`}>{statusLabel(b.status)}</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-[var(--app-edge)] flex flex-col gap-2.5 text-[13px]">
                    <div className="font-bold text-[var(--app-ink)]">{b.showtime?.movie?.title || "N/A"}</div>
                    <div className="flex flex-wrap items-center gap-2 text-[var(--app-mute)]">
                      <span className="inline-flex items-center gap-1"><MapPin size={13} /> {b.showtime?.room?.cinema?.name || "N/A"}</span>
                      <span className="ml-auto font-bold text-[var(--app-ink)]">${Number(b.total_amount).toFixed(2)}</span>
                    </div>
                    <div>{seatsChips(b)}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse text-[14px] [&>thead_th]:text-left [&>thead_th]:py-[14px] [&>thead_th]:px-[18px] [&>thead_th]:text-[var(--app-mute)] [&>thead_th]:text-[12px] [&>thead_th]:font-bold [&>thead_th]:uppercase [&>thead_th]:tracking-widest [&>thead_th]:border-b [&>thead_th]:border-[var(--app-edge)] [&>thead_th]:bg-[var(--app-fill)] [&>thead_th]:whitespace-nowrap [&>th]:sticky [&>th]:top-0 [&>th]:z-5 [&>th]:bg-[var(--app-panel)] [&>tbody_td]:py-[14px] [&>tbody_td]:px-[18px] [&>tbody_td]:border-b [&>tbody_td]:border-[var(--app-edge)] [&>tbody_td]:text-[var(--app-ink2)] [&>tbody_td]:align-middle [&>tbody>tr]:transition-colors [&>tbody>tr]:duration-150 [&>tbody>tr:hover]:bg-[var(--app-fill)] [&>tbody>tr:last-child>td]:border-b-0">
                <thead>
                  <tr><th>{t("adminBookings.customer")}</th><th>{t("adminBookings.movie")}</th><th>{t("adminBookings.cinema")}</th><th>{t("adminBookings.seats")}</th><th>{t("adminBookings.total")}</th><th>{t("adminBookings.status")}</th></tr>
                </thead>
                <tbody>
                  {filtered.map((b) => (
                    <tr key={b.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-[38px] h-[38px] rounded-full bg-[rgba(229,9,20,0.12)] flex items-center justify-center text-[16px] shrink-0"><CircleUser size={18} /></div>
                          <div>
                            <div className="font-bold text-[var(--app-ink)]">{b.user?.name || "Unknown"}</div>
                            <div className="text-[12px] text-[var(--app-mute)]">{b.user?.email || ""}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="font-bold text-[var(--app-ink)]">{b.showtime?.movie?.title || "N/A"}</span></td>
                      <td><span className="inline-flex items-center gap-1"><MapPin size={13} /> {b.showtime?.room?.cinema?.name || "N/A"}</span></td>
                      <td>{seatsChips(b)}</td>
                      <td><span className="font-bold text-[var(--app-ink)]">${Number(b.total_amount).toFixed(2)}</span></td>
                      <td><span className={`inline-flex items-center gap-1.5 py-[5px] px-3 text-[12px] font-bold rounded-[20px] whitespace-nowrap ${statusBadge(b.status)}`}>{statusLabel(b.status)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}