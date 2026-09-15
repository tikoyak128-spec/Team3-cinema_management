import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { usePrefs } from "../context/PrefsContext";
import api from "../api/client";
import {
  Ticket,
  Armchair,
  MapPin,
  Calendar,
  Clock,
  Loader2,
  Clapperboard,
  ChevronDown,
  Building2,
  ScanLine,
} from "lucide-react";

const TABS = ["all", "upcoming", "past"];

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDateTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({ status, t }) {
  const map = {
    confirmed: {
      cls: "bg-[rgba(22,163,74,0.14)] text-[#22c55e] border-[rgba(34,197,94,0.3)]",
      key: "myBookings.statusConfirmed",
    },
    pending: {
      cls: "bg-[rgba(234,179,8,0.14)] text-[#eab308] border-[rgba(234,179,8,0.3)]",
      key: "myBookings.statusPending",
    },
    cancelled: {
      cls: "bg-[rgba(229,9,20,0.14)] text-[#e50914] border-[rgba(229,9,20,0.3)]",
      key: "myBookings.statusCancelled",
    },
    checked_in: {
      cls: "bg-[rgba(139,92,246,0.14)] text-[#a78bfa] border-[rgba(139,92,246,0.3)]",
      key: "myBookings.statusCheckedIn",
    },
    valid: {
      cls: "bg-[rgba(22,163,74,0.14)] text-[#22c55e] border-[rgba(34,197,94,0.3)]",
      key: "myBookings.statusValid",
    },
  };
  const conf = map[status] || {
    cls: "bg-[var(--app-fill)] text-[var(--app-ink)] border-[var(--app-edge)]",
    key: status,
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 py-[5px] px-3 text-[12px] font-bold rounded-full border whitespace-nowrap ${conf.cls}`}
    >
      {t(conf.key)}
    </span>
  );
}

function SeatChips({ booking }) {
  const seats = booking.booking_seats || [];
  if (seats.length === 0) return <span className="text-[var(--app-mute)]">—</span>;
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {seats.map((bs) => (
        <span
          key={bs.id}
          className="inline-flex items-center gap-1.5 bg-[rgba(229,9,20,0.12)] border border-[rgba(229,9,20,0.3)] text-[#e50914] py-1.5 px-3 rounded-[10px] text-[13px] font-bold"
        >
          <Armchair size={13} />
          {bs.seat?.seat_number || `Seat ${bs.seat_id}`}
        </span>
      ))}
    </div>
  );
}

function UpcomingCard({ booking, t, i }) {
  const [open, setOpen] = useState(i === 0);
  const movie = booking.showtime?.movie;
  const cinema = booking.showtime?.room?.cinema?.name;
  const room = booking.showtime?.room?.name;
  const tickets = booking.tickets || [];

  return (
    <div className="bg-[linear-gradient(135deg,var(--app-panel),var(--app-panel2))] border border-[var(--app-edge)] rounded-2xl overflow-hidden transition-colors duration-300">
      <div className="flex flex-col sm:flex-row">
        {/* Poster */}
        <div className="sm:w-[150px] sm:min-w-[150px] h-[110px] sm:h-auto relative">
          {movie?.poster ? (
            <img
              src={movie.poster}
              alt={movie?.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-brand to-red-700 flex items-center justify-center text-white">
              <Clapperboard size={28} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent sm:bg-gradient-to-r" />
        </div>

        {/* Info */}
        <div className="flex-1 p-5 sm:p-6 flex flex-col gap-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-extrabold text-[var(--app-ink)] leading-snug">
                {movie?.title || "N/A"}
              </h3>
              <p className="text-xs text-[var(--app-mute)] mt-0.5">
                {booking.booking_code || `#${booking.id}`}
              </p>
            </div>
            <StatusBadge status={booking.status} t={t} />
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-[var(--app-mute)]">
            {cinema && (
              <span className="inline-flex items-center gap-1.5">
                <Building2 size={14} className="text-brand" /> {cinema}
              </span>
            )}
            {room && (
              <span className="inline-flex items-center gap-1.5">
                <Ticket size={14} className="text-brand" /> {room}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={14} className="text-brand" />
              {formatDate(booking.showtime?.start_time)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock size={14} className="text-brand" />
              {formatTime(booking.showtime?.start_time)}
            </span>
          </div>

          <SeatChips booking={booking} />

          {/* Tickets */}
          {tickets.length > 0 && (
            <div className="rounded-xl border border-dashed border-[var(--app-edge2)] bg-[var(--app-fill)]/60 overflow-hidden">
              <button
                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-sm font-bold text-[var(--app-ink)] cursor-pointer bg-transparent"
                onClick={() => setOpen((o) => !o)}
              >
                <span className="inline-flex items-center gap-2">
                  <ScanLine size={15} className="text-brand" />
                  {t("myBookings.tickets")} ({tickets.length})
                </span>
                <ChevronDown
                  size={16}
                  className={`text-[var(--app-mute)] transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                />
              </button>
              <div
                className={`grid transition-all duration-300 ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
              >
                <div className="overflow-hidden">
                  <ul className="px-4 pb-4 flex flex-col gap-2">
                    {tickets.map((tk) => (
                      <li
                        key={tk.id}
                        className="flex items-center justify-between gap-3 bg-[var(--app-panel2)] border border-[var(--app-edge)] rounded-lg px-3.5 py-2.5"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                          <code className="font-mono text-[13px] font-bold text-[var(--app-ink)] tracking-wider truncate">
                            {tk.ticket_code || "—"}
                          </code>
                        </div>
                        <StatusBadge status={tk.status} t={t} />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--app-edge)] pt-4">
            <span className="text-xs text-[var(--app-mute)]">
              {t("myBookings.bookedOn")}:{" "}
              <b className="text-[var(--app-ink)]">{formatDateTime(booking.created_at)}</b>
            </span>
            <span className="text-lg font-black text-[var(--app-ink)]">
              ${Number(booking.total_amount || 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ titleKey, descKey, t, onBrowse }) {
  return (
    <div className="flex flex-col items-center justify-center py-[70px] px-5 text-center">
      <div className="w-16 h-16 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center mb-4">
        <Ticket size={26} className="text-brand" />
      </div>
      <h3 className="text-lg font-extrabold text-[var(--app-ink)]">{t(titleKey)}</h3>
      <p className="text-sm text-[var(--app-mute)] mt-1.5 max-w-[340px]">{t(descKey)}</p>
      <button
        onClick={onBrowse}
        className="mt-5 inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer"
      >
        <Clapperboard size={15} />
        {t("myBookings.browseMovies")}
      </button>
    </div>
  );
}

function HistoryTable({ bookings, t }) {
  return (
    <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[14px] [&>thead_th]:text-left [&>thead_th]:py-[14px] [&>thead_th]:px-[18px] [&>thead_th]:text-[var(--app-mute)] [&>thead_th]:text-[12px] [&>thead_th]:font-bold [&>thead_th]:uppercase [&>thead_th]:tracking-widest [&>thead_th]:border-b [&>thead_th]:border-[var(--app-edge)] [&>thead_th]:bg-[var(--app-fill)] [&>thead_th]:whitespace-nowrap [&>tbody_td]:py-[14px] [&>tbody_td]:px-[18px] [&>tbody_td]:border-b [&>tbody_td]:border-[var(--app-edge)] [&>tbody_td]:text-[var(--app-ink2)] [&>tbody_td]:align-middle [&>tbody>tr]:transition-colors [&>tbody>tr]:duration-150 [&>tbody>tr:hover]:bg-[var(--app-fill)] [&>tbody>tr:last-child>td]:border-b-0">
          <thead>
            <tr>
              <th>{t("myBookings.showtime")}</th>
              <th>{t("myBookings.movie")}</th>
              <th>{t("myBookings.cinema")}</th>
              <th>{t("myBookings.seats")}</th>
              <th>{t("myBookings.total")}</th>
              <th>{t("myBookings.status")}</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id}>
                <td>
                  <span className="block font-bold text-[var(--app-ink)]">
                    {formatDate(b.showtime?.start_time)}
                  </span>
                  <span className="block text-[12px] text-[var(--app-mute)]">
                    {formatTime(b.showtime?.start_time)}
                  </span>
                </td>
                <td>
                  <span className="font-bold text-[var(--app-ink)]">
                    {b.showtime?.movie?.title || "N/A"}
                  </span>
                  <span className="block text-[12px] text-[var(--app-mute)] font-mono tracking-wide">
                    {b.booking_code || `#${b.id}`}
                  </span>
                </td>
                <td>
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={13} className="text-brand" />{" "}
                    {b.showtime?.room?.cinema?.name || "N/A"}
                  </span>
                </td>
                <td>
                  <SeatChips booking={b} />
                </td>
                <td>
                  <span className="font-bold text-[var(--app-ink)]">
                    ${Number(b.total_amount || 0).toFixed(2)}
                  </span>
                </td>
                <td>
                  <StatusBadge status={b.status} t={t} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function MyBookings() {
  const { t } = usePrefs();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("all");

  useEffect(() => {
    let cancelled = false;
    api
      .get("/bookings/my")
      .then(({ data }) => {
        if (!cancelled) setBookings(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.response?.data?.message || "Failed to load bookings.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const now = new Date();

  const { upcoming, past } = useMemo(() => {
    const up = bookings.filter(
      (b) =>
        b.status === "confirmed" && new Date(b.showtime?.start_time) >= now
    );
    const pa = bookings.filter(
      (b) => b.status === "cancelled" || new Date(b.showtime?.start_time) < now
    );
    return { upcoming: up, past: pa };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings]);

  const filtered =
    tab === "all" ? bookings : tab === "upcoming" ? upcoming : past;

  const isEmpty =
    !loading && !error && (tab === "all" ? bookings.length === 0 : filtered.length === 0);

  const emptyKey =
    tab === "upcoming" ? "myBookings.noUpcoming" : tab === "past" ? "myBookings.noPast" : "myBookings.noBookings";
  const emptyDescKey =
    tab === "upcoming" ? "myBookings.noUpcomingDesc" : tab === "past" ? "myBookings.noPastDesc" : "myBookings.noBookingsDesc";

  return (
    <div className="max-w-[1080px] mx-auto px-5 sm:px-6 lg:px-8 pb-14 sm:pb-16 md:pb-20 pt-24 sm:pt-28 md:pt-32">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-[var(--app-edge)] bg-[linear-gradient(135deg,var(--app-panel),var(--app-panel2))] p-6 sm:p-8 mb-6">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[rgba(229,9,20,0.15)] blur-[70px]" />
        <div className="absolute -bottom-24 -left-16 w-64 h-64 rounded-full bg-[rgba(139,92,246,0.08)] blur-[70px]" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand/15 border border-brand/30 flex items-center justify-center text-brand shrink-0">
            <Ticket size={24} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--app-ink)]">
              {t("myBookings.pageTitle")}
            </h1>
            <p className="text-sm text-[var(--app-mute)] mt-1">{t("myBookings.pageSubtitle")}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-[var(--app-panel2)] border border-[var(--app-edge)] rounded-full p-1 gap-1 mb-6 w-fit">
        {TABS.map((tb) => (
          <button
            key={tb}
            className={`text-[13px] font-bold px-5 py-2.5 rounded-full transition-all cursor-pointer ${
              tab === tb
                ? "bg-brand text-white"
                : "text-[var(--app-mute)] hover:text-[var(--app-ink)]"
            }`}
            onClick={() => setTab(tb)}
          >
            {t(`myBookings.tab${tb.charAt(0).toUpperCase()}${tb.slice(1)}`)}
            {tb === "all" && !loading ? (
              <span className="hidden sm:inline ml-1.5 text-[11px] opacity-70">
                ({bookings.length})
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3 text-[var(--app-mute)]">
            <Loader2 size={26} className="text-brand animate-spin" />
            <span className="text-sm font-semibold">{t("myBookings.loading")}</span>
          </div>
        </div>
      ) : error ? (
        <div className="bg-[rgba(229,9,20,0.12)] border border-[rgba(229,9,20,0.4)] text-[#ff6b6b] text-[13px] p-4 rounded-xl">
          {error}
        </div>
      ) : isEmpty ? (
        <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl">
          <EmptyState
            titleKey={emptyKey}
            descKey={emptyDescKey}
            t={t}
            onBrowse={() => navigate("/now-showing")}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {tab === "past" ? (
            <HistoryTable bookings={filtered} t={t} />
          ) : (
            filtered.map((b, i) => <UpcomingCard key={b.id} booking={b} t={t} i={i} />)
          )}
        </div>
      )}
    </div>
  );
}