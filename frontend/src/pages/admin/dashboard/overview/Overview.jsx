import { useEffect, useState } from "react";
import {
  Armchair,
  Building2,
  CalendarClock,
  CircleUser,
  Clapperboard,
  DoorOpen,
  Film,
  MapPin,
  RefreshCw,
  Ticket,
  Users,
  Wallet,
} from "lucide-react";
import api from "../../../../api/client";
import { usePrefs } from "../../../../context/PrefsContext";
import { AreaChart, DonutChart } from "../analytics/charts";

const palette = ["#e50914", "#60a5fa", "#eab308", "#22c55e", "#a78bfa", "#fb7185", "#f97316", "#14b8a6"];

const statusBadge =
  (s) =>
    s === "confirmed"
      ? "bg-[rgba(22,163,74,0.14)] text-[#22c55e] border border-[rgba(34,197,94,0.3)]"
      : s === "pending"
        ? "bg-[rgba(234,179,8,0.14)] text-[#eab308] border border-[rgba(234,179,8,0.3)]"
        : "bg-[rgba(229,9,20,0.14)] text-[#e50914] border border-[rgba(229,9,20,0.3)]";

const fmtMoney = (v) => `$${Number(v || 0).toFixed(2)}`;

function lastNDays(n) {
  const days = [];
  for (let i = n - 1; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  return days;
}

const dayKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export default function Overview() {
  const { t } = usePrefs();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      api.get("/bookings"),
      api.get("/movies"),
      api.get("/cinemas"),
      api.get("/rooms"),
      api.get("/seats"),
      api.get("/showtimes"),
      api.get("/users"),
    ])
      .then(([b, m, c, r, s, st, u]) => {
        if (!cancelled) {
          setData({ bookings: b.data, movies: m.data, cinemas: c.data, rooms: r.data, seats: s.data, showtimes: st.data, users: u.data });
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err?.response?.data?.message || t("adminOverview.failedLoad"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reload]);

  if (loading) {
    return <div className="text-[var(--app-mute)] text-[14px] px-1 py-10 text-center">{t("adminOverview.loading")}</div>;
  }

  if (error || !data) {
    return (
      <div className="bg-[rgba(229,9,20,0.12)] border border-[rgba(229,9,20,0.4)] text-[#ff6b6b] text-[13px] p-[10px_14px] rounded-[10px] flex justify-between items-center">
        {error || t("adminOverview.noData")}
        <button onClick={() => { setError(""); setReload((n) => n + 1); }} className="bg-transparent border-none text-[#ff6b6b] text-[18px] cursor-pointer leading-none">×</button>
      </div>
    );
  }

  const { bookings, movies, cinemas, rooms, seats, showtimes, users } = data;

  const confirmed = bookings.filter((b) => b.status === "confirmed");
  const pending = bookings.filter((b) => b.status === "pending");
  const revenue = confirmed.reduce((sum, b) => sum + Number(b.total_amount || 0), 0);
  const pendingAmount = pending.reduce((sum, b) => sum + Number(b.total_amount || 0), 0);
  const seatsSold = bookings.reduce((sum, b) => sum + (b.booking_seats || []).length, 0);
  const avgTicket = seatsSold ? bookings.reduce((sum, b) => sum + (b.booking_seats || []).reduce((s, bs) => s + Number(bs.price || 0), 0), 0) / seatsSold : 0;

  const days = lastNDays(14);
  const revenueSeries = days.map((d) =>
    confirmed
      .filter((b) => {
        const t = b.created_at ? new Date(b.created_at) : null;
        return t && dayKey(t) === dayKey(d);
      })
      .reduce((sum, b) => sum + Number(b.total_amount || 0), 0)
  );

  const genreMap = {};
  movies.forEach((m) => {
    const name = m.category?.name || t("adminOverview.uncategorized");
    genreMap[name] = (genreMap[name] || 0) + 1;
  });
  const genres = Object.entries(genreMap).map(([name, value], i) => ({ name, value, color: palette[i % palette.length] }));

  const movieById = new Map(movies.map((m) => [m.id, m]));
  const cinemaMap = {};
  let cinemaTotal = 0;
  bookings.forEach((b) => {
    const name = b.showtime?.room?.cinema?.name || "N/A";
    const count = (b.booking_seats || []).length;
    cinemaMap[name] = (cinemaMap[name] || 0) + count;
    cinemaTotal += count;
  });
  const cinemaBars = Object.entries(cinemaMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
  const maxCinema = Math.max(...cinemaBars.map((c) => c.value), 1);

  const filmMap = {};
  bookings.forEach((b) => {
    const movie = b.showtime?.movie;
    if (!movie) return;
    const entry = filmMap[movie.id] || { id: movie.id, title: movie.title, tickets: 0, revenue: 0 };
    entry.tickets += (b.booking_seats || []).length;
    entry.revenue += Number(b.total_amount || 0);
    filmMap[movie.id] = entry;
  });
  const topFilms = Object.values(filmMap)
    .sort((a, b) => b.tickets - a.tickets)
    .slice(0, 5);
  const maxFilm = Math.max(...topFilms.map((f) => f.tickets), 1);

  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    .slice(0, 6);

  const kpis = [
    { label: t("adminOverview.totalRevenue"), value: fmtMoney(revenue), sub: t("adminOverview.revenueSub", { paid: confirmed.length, amount: fmtMoney(pendingAmount) }), icon: Wallet, color: "#22c55e" },
    { label: t("adminOverview.bookings"), value: bookings.length, sub: t("adminOverview.awaitingPayment", { count: pending.length }), icon: Ticket, color: "#60a5fa" },
    { label: t("adminOverview.ticketsSold"), value: seatsSold, sub: t("adminOverview.acrossCinemas", { count: cinemas.length }), icon: Clapperboard, color: "#eab308" },
    { label: t("adminOverview.avgTicketPrice"), value: fmtMoney(avgTicket), sub: t("adminOverview.perSeat"), icon: Armchair, color: "#e50914" },
  ];

  const stats = [
    { label: t("admin.movies"), value: movies.length, icon: Film, color: "#60a5fa" },
    { label: t("admin.cinemas"), value: cinemas.length, icon: Building2, color: "#22c55e" },
    { label: t("admin.rooms"), value: rooms.length, icon: DoorOpen, color: "#eab308" },
    { label: t("admin.seats"), value: seats.length, icon: Armchair, color: "#a78bfa" },
    { label: t("admin.showtimes"), value: showtimes.length, icon: CalendarClock, color: "#fb7185" },
    { label: t("admin.users"), value: users.length, icon: Users, color: "#14b8a6" },
  ];

  const statusLabel = (s) =>
    s === "confirmed" || s === "pending" || s === "cancelled" ? t(`status.${s}`) : s;

  return (
    <div className="flex flex-col gap-6 text-[var(--app-ink)] [&_*]:box-border">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-[22px] sm:text-[26px] font-extrabold tracking-wide">{t("admin.dashboard")}</h1>
          <p className="text-[14px] text-[var(--app-mute)] mt-1">{t("adminOverview.subtitle")}</p>
        </div>
        <button
          onClick={() => setReload((n) => n + 1)}
          className="inline-flex items-center gap-2 border-none cursor-pointer font-inherit py-[11px] px-5 text-[14px] font-bold rounded-xl transition-all duration-200 bg-[var(--app-panel)] border border-[var(--app-edge)] text-[var(--app-ink)] hover:border-[rgba(229,9,20,0.4)]"
        >
          <RefreshCw size={15} /> {t("common.refresh")}
        </button>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-[18px]">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl p-[18px_20px] transition-all duration-200 hover:-translate-y-[3px] hover:border-[rgba(229,9,20,0.4)]" key={k.label}>
              <div className="flex items-center justify-between mb-[14px]">
                <span className="w-[42px] h-[42px] rounded-xl flex items-center justify-center bg-[color-mix(in_srgb,var(--c)_12%,transparent)] text-[var(--c)]" style={{ "--c": k.color }}>
                  <Icon size={20} />
                </span>
              </div>
              <div className="text-[26px] font-extrabold tracking-wide">{typeof k.value === "number" ? k.value.toLocaleString() : k.value}</div>
              <div className="text-[13px] text-[var(--app-mute)] mt-1">{k.label}</div>
              <div className="text-[12px] text-[var(--app-mute)] mt-0.5 opacity-80">{k.sub}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-[14px]">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-xl px-4 py-4 flex items-center gap-3" key={s.label}>
              <span className="w-9 h-9 rounded-lg flex items-center justify-center bg-[color-mix(in_srgb,var(--c)_12%,transparent)] text-[var(--c)] shrink-0" style={{ "--c": s.color }}>
                <Icon size={17} />
              </span>
              <div className="min-w-0">
                <div className="text-[18px] font-extrabold leading-none">{s.value.toLocaleString()}</div>
                <div className="text-[12px] text-[var(--app-mute)] mt-1">{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-[18px] max-[1100px]:grid-cols-1">
        <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl p-5">
          <div className="flex items-center justify-between gap-2.5 flex-wrap mb-[18px]">
            <h3 className="text-[16px] font-extrabold">{t("adminOverview.revenueOverview")}</h3>
            <span className="text-[12px] text-[var(--app-mute)] inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
              {t("adminOverview.revenueSubtitle")}
            </span>
          </div>
          <div className="w-full">
            <AreaChart labels={days.map((d) => d.toLocaleDateString("en-US", { day: "numeric", month: "short" }))} values={revenueSeries} color="#22c55e" gradientId="ov-rev-grad" format={(v) => `$${Math.round(v)}`} />
          </div>
        </div>

        <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl p-5">
          <div className="flex items-center justify-between gap-2.5 flex-wrap mb-[18px]">
            <h3 className="text-[16px] font-extrabold">{t("adminOverview.genreShare")}</h3>
          </div>
          <div className="flex items-center gap-6 flex-wrap">
            <DonutChart data={genres} centerValue={movies.length} centerLabel={t("admin.movies")} />
            <div className="flex flex-col gap-2.5 flex-1 min-w-[150px]">
              {genres.map((g) => (
                <div className="flex items-center gap-2.5 text-[13px]" key={g.name}>
                  <span className="w-3 h-3 rounded shrink-0 bg-[var(--c)]" style={{ "--c": g.color }} />
                  <span className="text-[var(--app-ink2)] flex-1">{g.name}</span>
                  <span className="font-bold">{g.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-[18px] max-[1100px]:grid-cols-1">
        <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl p-5">
          <div className="flex items-center justify-between gap-2.5 flex-wrap mb-[18px]">
            <h3 className="text-[16px] font-extrabold">{t("adminOverview.ticketsByCinema")}</h3>
            <span className="text-[12px] text-[var(--app-mute)]">{t("adminOverview.tickets", { count: cinemaTotal.toLocaleString() })}</span>
          </div>
          <div className="flex flex-col gap-4">
            {cinemaBars.length === 0 ? (
              <div className="text-[13px] text-[var(--app-mute)] py-6 text-center">{t("adminOverview.noTickets")}</div>
            ) : (
              cinemaBars.map((c, i) => (
                <div className="flex items-center gap-3" key={c.name}>
                  <span className="w-[148px] text-[13px] text-[var(--app-ink2)] shrink-0 whitespace-nowrap overflow-hidden text-ellipsis">{c.name}</span>
                  <div className="flex-1 h-[10px] bg-[var(--app-panel2)] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-[400ms] ease-in-out w-[var(--w)] bg-[var(--c)]" style={{ "--w": `${(c.value / maxCinema) * 100}%`, "--c": palette[i % palette.length] }} />
                  </div>
                  <span className="w-14 text-right text-[13px] font-bold text-[var(--app-mute)]">{c.value.toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl p-5">
          <div className="flex items-center justify-between gap-2.5 flex-wrap mb-[18px]">
            <h3 className="text-[16px] font-extrabold">{t("adminOverview.topFilms")}</h3>
            <span className="text-[12px] text-[var(--app-mute)]">{t("adminOverview.byTickets")}</span>
          </div>
          <div className="flex flex-col gap-[14px]">
            {topFilms.length === 0 ? (
              <div className="text-[13px] text-[var(--app-mute)] py-6 text-center">{t("adminOverview.noBookings")}</div>
            ) : (
              topFilms.map((f, i) => {
                const genre = movieById.get(f.id)?.category?.name || t("adminOverview.movieFallback");
                return (
                  <div className="flex items-center gap-3" key={f.title}>
                    <span className="w-7 h-7 rounded-[9px] bg-[rgba(229,9,20,0.12)] text-[#e50914] text-[12px] font-extrabold flex items-center justify-center shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-bold whitespace-nowrap overflow-hidden text-ellipsis">{f.title}</div>
                      <div className="text-[12px] text-[var(--app-mute)] mt-[2px]">{genre} · {t("adminOverview.ticketsCount", { count: f.tickets })}</div>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="w-20 h-[7px] bg-[var(--app-panel2)] rounded-full overflow-hidden">
                        <span className="h-full rounded-full block w-[var(--w)] bg-[var(--c)]" style={{ "--w": `${(f.tickets / maxFilm) * 100}%`, "--c": palette[i % palette.length] }} />
                      </span>
                      <span className="w-[46px] text-right text-[12px] font-bold text-[var(--app-mute)]">{fmtMoney(f.revenue)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between gap-2.5 flex-wrap px-5 pt-5 pb-3">
          <h3 className="text-[16px] font-extrabold">{t("adminOverview.recentBookings")}</h3>
          <span className="text-[12px] text-[var(--app-mute)]">{t("adminOverview.latestActivity")}</span>
        </div>

        <div className="md:hidden flex flex-col gap-3 p-4 sm:p-5">
          {recentBookings.map((b) => (
            <div key={b.id} className="bg-[var(--app-panel2)] border border-[var(--app-edge2)] rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-[38px] h-[38px] rounded-full bg-[rgba(229,9,20,0.12)] flex items-center justify-center shrink-0"><CircleUser size={18} /></div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-[var(--app-ink)] leading-snug">{b.user?.name || "Unknown"}</div>
                  <div className="text-[12px] text-[var(--app-mute)] mt-0.5">{b.showtime?.movie?.title || "N/A"}</div>
                </div>
                <span className={`shrink-0 inline-flex items-center gap-1.5 py-[5px] px-3 text-[12px] font-bold rounded-[20px] whitespace-nowrap ${statusBadge(b.status)}`}>{statusLabel(b.status)}</span>
              </div>
              <div className="mt-3 pt-3 border-t border-[var(--app-edge)] flex flex-wrap items-center gap-2 text-[13px] text-[var(--app-mute)]">
                <span className="inline-flex items-center gap-1"><MapPin size={13} /> {b.showtime?.room?.cinema?.name || "N/A"}</span>
                <span className="inline-flex items-center gap-1"><Armchair size={13} /> {(b.booking_seats || []).length}</span>
                <span className="ml-auto font-bold text-[var(--app-ink)]">{fmtMoney(b.total_amount)}</span>
              </div>
            </div>
          ))}
          {recentBookings.length === 0 && <div className="text-center text-[var(--app-mute)] text-[13px] py-8">{t("adminOverview.noBookings")}</div>}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse text-[14px] [&>thead_th]:text-left [&>thead_th]:py-[14px] [&>thead_th]:px-[18px] [&>thead_th]:text-[var(--app-mute)] [&>thead_th]:text-[12px] [&>thead_th]:font-bold [&>thead_th]:uppercase [&>thead_th]:tracking-widest [&>thead_th]:border-b [&>thead_th]:border-[var(--app-edge)] [&>thead_th]:bg-[var(--app-fill)] [&>thead_th]:whitespace-nowrap [&>th]:sticky [&>th]:top-[70px] [&>th]:z-5 [&>th]:bg-[var(--app-panel)] [&>tbody_td]:py-[14px] [&>tbody_td]:px-[18px] [&>tbody_td]:border-b [&>tbody_td]:border-[var(--app-edge)] [&>tbody_td]:text-[var(--app-ink2)] [&>tbody_td]:align-middle [&>tbody>tr]:transition-colors [&>tbody>tr]:duration-150 [&>tbody>tr:hover]:bg-[var(--app-fill)] [&>tbody>tr:last-child>td]:border-b-0">
            <thead>
              <tr><th>{t("adminOverview.customer")}</th><th>{t("adminOverview.movie")}</th><th>{t("adminOverview.cinema")}</th><th>{t("adminOverview.seats")}</th><th>{t("adminOverview.total")}</th><th>{t("adminOverview.status")}</th></tr>
            </thead>
            <tbody>
              {recentBookings.map((b) => (
                <tr key={b.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-[38px] h-[38px] rounded-full bg-[rgba(229,9,20,0.12)] flex items-center justify-center shrink-0"><CircleUser size={18} /></div>
                      <div>
                        <div className="font-bold text-[var(--app-ink)]">{b.user?.name || "Unknown"}</div>
                        <div className="text-[12px] text-[var(--app-mute)]">{b.user?.email || ""}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="font-bold text-[var(--app-ink)]">{b.showtime?.movie?.title || "N/A"}</span></td>
                  <td><span className="inline-flex items-center gap-1"><MapPin size={13} /> {b.showtime?.room?.cinema?.name || "N/A"}</span></td>
                  <td>{(b.booking_seats || []).length}</td>
                  <td><span className="font-bold text-[var(--app-ink)]">{fmtMoney(b.total_amount)}</span></td>
                  <td><span className={`inline-flex items-center gap-1.5 py-[5px] px-3 text-[12px] font-bold rounded-[20px] whitespace-nowrap ${statusBadge(b.status)}`}>{statusLabel(b.status)}</span></td>
                </tr>
              ))}
              {recentBookings.length === 0 && (
                <tr><td colSpan={6} className="text-center text-[var(--app-mute)] py-8">{t("adminOverview.noBookings")}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}