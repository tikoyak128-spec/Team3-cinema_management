import { useEffect, useMemo, useRef, useState } from "react";
import {
  Armchair,
  Building2,
  Calendar,
  CheckCircle2,
  CircleUser,
  Clapperboard,
  Clock,
  Download,
  Loader2,
  QrCode,
  ScanLine,
  Search,
  Ticket,
  X,
} from "lucide-react";
import api from "../api/client";
import { usePrefs } from "../context/PrefsContext";
import TicketCard from "../components/TicketCard";
import PaymentModal from "../components/PaymentModal";
import downloadPdf from "../utils/downloadPdf";

const TABS = ["all", "upcoming", "past"];

const currencySymbol = (currency) => (currency === "KHR" ? "៛" : "$");

const toDate = (v) => {
  if (!v) return null;
  const d = new Date(String(v).includes("T") ? v : v.replace(" ", "T"));
  return isNaN(d) ? null : d;
};

const fmtDate = (v) => {
  const d = toDate(v);
  return d ? d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : "—";
};

const fmtTime = (v) => {
  const d = toDate(v);
  if (!d) return "—";
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

const fmtDateTime = (v) => {
  const d = toDate(v);
  return d ? d.toLocaleString(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
};

function StatusBadge({ status, t }) {
  const map = {
    confirmed: { cls: "bg-[rgba(22,163,74,0.14)] text-[#22c55e] border-[rgba(34,197,94,0.3)]", key: "myBookings.statusConfirmed" },
    pending: { cls: "bg-[rgba(234,179,8,0.14)] text-[#eab308] border-[rgba(234,179,8,0.3)]", key: "myBookings.statusPending" },
    cancelled: { cls: "bg-[rgba(229,9,20,0.14)] text-[#e50914] border-[rgba(229,9,20,0.3)]", key: "myBookings.statusCancelled" },
    checked_in: { cls: "bg-[rgba(139,92,246,0.14)] text-[#a78bfa] border-[rgba(139,92,246,0.3)]", key: "myBookings.statusCheckedIn" },
    valid: { cls: "bg-[rgba(22,163,74,0.14)] text-[#22c55e] border-[rgba(34,197,94,0.3)]", key: "myBookings.statusValid" },
  };
  const conf = map[status] || { cls: "bg-[var(--app-fill)] text-[var(--app-ink)] border-[var(--app-edge)]", key: status };
  return (
    <span className={`inline-flex items-center gap-1.5 py-[5px] px-3 text-[12px] font-bold rounded-full border whitespace-nowrap ${conf.cls}`}>
      {t(conf.key)}
    </span>
  );
}

function TicketStatusBadge({ status, t }) {
  const map = {
    valid: { cls: "bg-[rgba(22,163,74,0.14)] text-[#22c55e] border-[rgba(34,197,94,0.3)]", key: "myBookings.statusValid" },
    checked_in: { cls: "bg-[rgba(139,92,246,0.14)] text-[#a78bfa] border-[rgba(139,92,246,0.3)]", key: "myBookings.statusCheckedIn" },
    cancelled: { cls: "bg-[rgba(229,9,20,0.14)] text-[#e50914] border-[rgba(229,9,20,0.3)]", key: "myBookings.statusCancelled" },
  };
  const conf = map[status] || { cls: "bg-[var(--app-fill)] text-[var(--app-ink)] border-[var(--app-edge)]", key: status };
  return (
    <span className={`inline-flex items-center gap-1.5 py-[3px] px-2.5 text-[11px] font-bold rounded-full border whitespace-nowrap ${conf.cls}`}>
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
        <span key={bs.id} className="inline-flex items-center gap-1.5 bg-[rgba(229,9,20,0.12)] border border-[rgba(229,9,20,0.3)] text-[#e50914] py-1.5 px-3 rounded-[10px] text-[13px] font-bold">
          <Armchair size={13} />
          {bs.seat?.seat_number || `Seat ${bs.seat_id}`}
        </span>
      ))}
    </div>
  );
}

function DownloadTicketsModal({ booking, t, onClose }) {
  const refs = useRef({});
  const movie = booking.showtime?.movie;
  const tickets = booking.tickets || [];

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-[720px] max-h-[92vh] overflow-hidden bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-[26px] shadow-[0_30px_80px_rgba(0,0,0,0.55)]" onClick={(e) => e.stopPropagation()}>
        <div className="h-[6px] bg-gradient-to-r from-[#e50914] via-[#ff5a5f] to-[#e50914]" />
        <div className="px-6 pt-5 pb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-extrabold text-[var(--app-ink)]">
                {t("staff.tickets")} ({tickets.length})
              </h3>
              <p className="text-[13px] text-[var(--app-mute)] mt-1">
                {movie?.title || "—"} · {booking.booking_code || `#${booking.id}`}
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-9 h-9 rounded-full flex items-center justify-center bg-[var(--app-fill)] border border-[var(--app-edge2)] text-[var(--app-mute)] cursor-pointer transition-all duration-200 hover:text-white hover:bg-brand hover:border-brand shrink-0"
            >
              <X size={17} />
            </button>
          </div>

          <div className="mt-5 flex flex-col gap-6 items-center max-h-[62vh] overflow-y-auto pt-1 pb-3">
            {tickets.map((tk) => (
              <div key={tk.id} className="flex flex-col items-center gap-3 w-full">
                <div ref={(el) => { refs.current[tk.id] = el; }}>
                  <TicketCard
                    movie={movie?.title}
                    cinema={booking.showtime?.room?.cinema?.name}
                    room={booking.showtime?.room?.name}
                    startTime={booking.showtime?.start_time}
                    bookingCode={booking.booking_code}
                    ticketCode={tk.ticket_code}
                    seats={[(booking.booking_seats || []).find((b) => b.id === tk.booking_seat_id)].filter(Boolean)}
                    amount={Number(booking.total_amount || 0) / (tickets.length || 1)}
                    currency={booking.currency || "USD"}
                  />
                </div>
                <div className="inline-flex items-center gap-2.5">
                  <button
                    className="inline-flex items-center gap-2 border-none cursor-pointer py-2.5 px-5 text-sm font-bold rounded-xl transition-all duration-200 bg-[rgba(22,163,74,0.12)] text-[#16a34a] hover:bg-[rgba(22,163,74,0.2)]"
                    onClick={() => downloadPdf(refs.current[tk.id], `${tk.ticket_code || "ticket"}.pdf`)}
                  >
                    <Download size={15} /> {t("myBookings.downloadPdf")}
                  </button>
                  <TicketStatusBadge status={tk.status} t={t} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function BookingCard({ booking, t, dlOpen, setDlOpen, onResume, onConfirm, confirmingId }) {
  const [open, setOpen] = useState(false);
  const ticketRefs = useRef({});
  const movie = booking.showtime?.movie;
  const cinema = booking.showtime?.room?.cinema?.name;
  const room = booking.showtime?.room?.name;
  const tickets = booking.tickets || [];
  const currency = booking.currency || "USD";
  const sym = currencySymbol(currency);

  return (
    <div className="bg-[linear-gradient(135deg,var(--app-panel),var(--app-panel2))] border border-[var(--app-edge)] rounded-2xl overflow-hidden transition-colors duration-300">
      <div className="flex flex-col sm:flex-row">
        {/* Poster */}
        <div className="sm:w-[150px] sm:min-w-[150px] h-[110px] sm:h-auto relative">
          {movie?.poster ? (
            <img src={movie.poster} alt={movie?.title} className="w-full h-full object-cover" />
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
            <div className="min-w-0">
              <h3 className="text-lg font-extrabold text-[var(--app-ink)] leading-snug">
                {movie?.title || "N/A"}
              </h3>
              <p className="text-xs text-[var(--app-mute)] mt-0.5 font-mono">
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
              {fmtDate(booking.showtime?.start_time)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock size={14} className="text-brand" />
              {fmtTime(booking.showtime?.start_time)}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-[var(--app-mute)]">
            <span className="inline-flex items-center gap-1.5">
              <CircleUser size={14} className="text-brand" />
              {t("staff.customer")}: <b className="text-[var(--app-ink)]">{booking.user?.name || t("staff.walkIn")}</b>
              {booking.user?.email ? <span className="text-[12px]">· {booking.user.email}</span> : null}
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
                  {t("staff.tickets")} ({tickets.length})
                </span>
                <span className="inline-flex items-center gap-3">
                  {tickets.length > 1 && (
                    <span
                      className="inline-flex items-center gap-1.5 border-none cursor-pointer py-1.5 px-3 text-xs font-bold rounded-lg bg-[rgba(22,163,74,0.12)] text-[#16a34a] hover:bg-[rgba(22,163,74,0.2)]"
                      onClick={(e) => { e.stopPropagation(); setDlOpen(true); }}
                    >
                      <Download size={13} /> {t("myBookings.downloadAll")}
                    </span>
                  )}
                  <span className="text-[var(--app-mute)] transition-transform duration-300 inline-flex"><X size={16} className={open ? "rotate-45" : ""} /></span>
                </span>
              </button>
              <div className={`grid transition-all duration-300 ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                <div className="overflow-hidden">
                  <div className="px-4 pb-4 flex flex-col gap-4 items-center">
                    {tickets.map((tk) => (
                      <div key={tk.id} className="flex sm:flex-row flex-col items-center gap-3 w-full sm:justify-center">
                        <div ref={(el) => { ticketRefs.current[tk.id] = el; }}>
                          <TicketCard
                            movie={movie?.title}
                            cinema={cinema}
                            room={room}
                            startTime={booking.showtime?.start_time}
                            bookingCode={booking.booking_code}
                            ticketCode={tk.ticket_code}
                            seats={[(booking.booking_seats || []).find((b) => b.id === tk.booking_seat_id)].filter(Boolean)}
                            amount={Number(booking.total_amount || 0) / (tickets.length || 1)}
                            currency={currency}
                          />
                        </div>
                        <div className="flex flex-col gap-1 items-center sm:items-start">
                          <span className="inline-flex items-center gap-1.5 flex-wrap justify-center bg-[rgba(229,9,20,0.1)] border border-[rgba(229,9,20,0.25)] text-[#e50914] py-1 px-2.5 rounded-[8px] text-[12px] font-mono font-bold max-sm:text-center"><Ticket size={12} /> {tk.ticket_code}</span>
                          <TicketStatusBadge status={tk.status} t={t} />
                          <button
                            className="inline-flex items-center gap-2 border-none cursor-pointer py-2 px-4 text-xs font-bold rounded-lg transition-all duration-200 bg-[rgba(22,163,74,0.12)] text-[#16a34a] hover:bg-[rgba(22,163,74,0.2)]"
                            onClick={() => downloadPdf(ticketRefs.current[tk.id], `${tk.ticket_code || "ticket"}.pdf`)}
                          >
                            <Download size={13} /> {t("myBookings.downloadPdf")}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {booking.status === "pending" && (
            <div className="border-t border-[var(--app-edge)] pt-4 flex flex-col gap-3">
              <p className="text-[13px] font-semibold text-[var(--app-mute)] leading-relaxed">
                <QrCode size={14} className="inline text-brand mr-1" />
                {t("myBookings.pendingPaymentNote")}
              </p>
              <div className="flex flex-wrap gap-2.5">
                <button
                  onClick={() => onResume(booking)}
                  className="inline-flex items-center justify-center gap-2 bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold text-[13px] px-5 py-3 rounded-xl transition-all cursor-pointer"
                >
                  <QrCode size={15} />
                  {t("myBookings.resumePayment")}
                </button>
                {booking.payment_method === "bakong" && (
                  <button
                    onClick={() => booking.status === "pending" && onConfirm(booking)}
                    disabled={confirmingId === booking.id}
                    className="inline-flex items-center justify-center gap-2 border border-[rgba(34,197,94,0.4)] text-[#16a34a] hover:bg-[rgba(34,197,94,0.12)] disabled:opacity-60 disabled:cursor-not-allowed font-bold text-[13px] px-5 py-3 rounded-xl transition-all cursor-pointer"
                  >
                    <CheckCircle2 size={15} />
                    {confirmingId === booking.id ? t("staff.confirming") : t("staff.confirmPayment")}
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--app-edge)] pt-4">
            <span className="text-xs text-[var(--app-mute)]">
              {t("myBookings.bookedOn")}: <b className="text-[var(--app-ink)]">{fmtDateTime(booking.created_at)}</b>
            </span>
            <span className="text-lg font-black text-[var(--app-ink)]">
              {sym}{Number(booking.total_amount || 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
      {dlOpen && <DownloadTicketsModal booking={booking} t={t} onClose={() => setDlOpen(false)} />}
    </div>
  );
}

export default function Tickets() {
  const { t } = usePrefs();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [dlBooking, setDlBooking] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);
  const [payBooking, setPayBooking] = useState(null);
  const [payStatus, setPayStatus] = useState("pending");
  const [payError, setPayError] = useState("");
  const [payChecking, setPayChecking] = useState(false);
  const [payRefreshing, setPayRefreshing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api.get("/staff/bookings")
      .then(({ data }) => { if (!cancelled) setBookings(Array.isArray(data) ? data : []); })
      .catch((err) => { if (!cancelled) setError(err?.response?.data?.message || t("staff.loadingBookings")); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const now = new Date();

  const { upcoming, past } = useMemo(() => {
    const up = bookings.filter(
      (b) => b.status === "confirmed" && new Date(b.showtime?.start_time) >= now
    );
    const pa = bookings.filter(
      (b) => b.status === "cancelled" || new Date(b.showtime?.start_time) < now
    );
    return { upcoming: up, past: pa };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings]);

  const base = tab === "all" ? bookings : tab === "upcoming" ? upcoming : past;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return base;
    return base.filter((b) => {
      const hay = [
        b.booking_code || "",
        b.user?.name || "",
        b.user?.email || "",
        b.showtime?.movie?.title || "",
        b.showtime?.room?.cinema?.name || "",
        ...(b.tickets || []).map((tk) => tk.ticket_code || ""),
      ].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [base, search]);

  const isEmpty = !loading && !error && filtered.length === 0;

  const handleResume = (booking) => {
    setPayBooking(booking);
    setPayStatus("pending");
    setPayError("");
  };

  const handleConfirm = async (booking) => {
    setConfirmingId(booking.id);
    setError("");
    try {
      const { data } = await api.post(`/staff/bookings/${booking.id}/confirm-payment`);
      const updated = data.booking || data;
      setBookings((prev) => prev.map((b) => (b.id === booking.id ? updated : b)));
    } catch (err) {
      setError(err?.response?.data?.message || t("staff.paymentCheckFailed"));
    } finally {
      setConfirmingId(null);
    }
  };

  const checkPay = async () => {
    if (!payBooking?.id) return;
    setPayChecking(true);
    setPayError("");
    try {
      const { data } = await api.get(`/bookings/${payBooking.id}/payment`);
      const { payment_status, message, verification_error, booking: updated } = data;
      setPayStatus(payment_status);
      if (payment_status === "confirmed") {
        setBookings((prev) => prev.map((b) => (b.id === payBooking.id ? updated || { ...b, status: "confirmed" } : b)));
        setPayBooking(null);
        setPayError("");
        return;
      }
      if (verification_error) setPayError(message || t("staff.paymentCheckFailed"));
    } catch (err) {
      setPayError(err?.response?.data?.message || t("staff.paymentCheckFailed"));
    } finally {
      setPayChecking(false);
    }
  };

  const refreshPay = async () => {
    if (!payBooking?.id) return;
    setPayRefreshing(true);
    setPayError("");
    try {
      const { data } = await api.post(`/staff/bookings/${payBooking.id}/payment/refresh`);
      if (data.payment_status === "confirmed") {
        const updated = data.booking || { ...payBooking, status: "confirmed" };
        setBookings((prev) => prev.map((b) => (b.id === payBooking.id ? updated : b)));
        setPayBooking(null);
        return;
      }
      const np = data.payment || {};
      setPayBooking((prev) =>
        prev ? { ...prev, payment_qr: np.qr, payment_md5: np.md5, payment_expires_at: np.expires_at } : prev
      );
      setPayStatus("pending");
    } catch (err) {
      setPayError(err?.response?.data?.message || t("staff.refreshPaymentFailed"));
    } finally {
      setPayRefreshing(false);
    }
  };

  const payPayment = useMemo(() => {
    if (!payBooking) return null;
    return {
      qr: payBooking.payment_qr,
      md5: payBooking.payment_md5,
      amount: payBooking.total_amount,
      currency: payBooking.currency || "USD",
      expires_at: payBooking.payment_expires_at,
    };
  }, [payBooking]);

  const emptyKey =
    tab === "upcoming" ? "myBookings.noUpcoming" : tab === "past" ? "myBookings.noPast" : "myBookings.noBookings";

  return (
    <div className="flex flex-col gap-6 text-[var(--app-ink)]">
      <div className="relative overflow-hidden rounded-2xl border border-[var(--app-edge)] bg-[linear-gradient(135deg,var(--app-panel),var(--app-panel2))] p-6 sm:p-8">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[rgba(229,9,20,0.15)] blur-[70px]" />
        <div className="absolute -bottom-24 -left-16 w-64 h-64 rounded-full bg-[rgba(237,195,143,0.08)] blur-[70px]" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand/15 border border-brand/30 flex items-center justify-center text-brand shrink-0">
            <Ticket size={24} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--app-ink)]">{t("staff.tickets")}</h1>
            <p className="text-sm text-[var(--app-mute)] mt-1">{t("staff.ticketsSubtitle")}</p>
          </div>
        </div>
      </div>

      {/* Tabs + search */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex bg-[var(--app-panel2)] border border-[var(--app-edge)] rounded-full p-1 gap-1 w-fit">
          {TABS.map((tb) => (
            <button
              key={tb}
              className={`text-[13px] font-bold px-5 py-2.5 rounded-full transition-all cursor-pointer ${tab === tb ? "bg-brand text-white" : "text-[var(--app-mute)] hover:text-[var(--app-ink)]"}`}
              onClick={() => setTab(tb)}
            >
              {t(`myBookings.tab${tb.charAt(0).toUpperCase()}${tb.slice(1)}`)}
              {tb === "all" && !loading ? (
                <span className="hidden sm:inline ml-1.5 text-[11px] opacity-70">({bookings.length})</span>
              ) : null}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2.5 bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-xl py-2.5 px-3.5 text-[var(--app-mute)] w-full lg:w-[320px]">
          <span className="shrink-0"><Search size={16} /></span>
          <input
            className="bg-transparent border-none outline-none text-[var(--app-ink)] font-inherit text-[14px] w-full"
            placeholder={t("staff.ticketsSearchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="bg-[rgba(229,9,20,0.12)] border border-[rgba(229,9,20,0.4)] text-[#ff6b6b] text-[13px] p-[10px_14px] rounded-[10px] flex justify-between items-center">
          {error}
          <button onClick={() => setError("")} className="bg-transparent border-none text-[#ff6b6b] text-[18px] cursor-pointer leading-none">×</button>
        </div>
      )}

      {loading ? (
        <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3 text-[var(--app-mute)]">
            <Loader2 size={26} className="text-brand animate-spin" />
            <span className="text-sm font-semibold">{t("myBookings.loading")}</span>
          </div>
        </div>
      ) : isEmpty ? (
        <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center mb-4">
            <Ticket size={26} className="text-brand" />
          </div>
          <h3 className="text-lg font-extrabold text-[var(--app-ink)]">{t(emptyKey)}</h3>
          <p className="text-sm text-[var(--app-mute)] mt-1.5 max-w-[340px]">{t("staff.ticketsNoResults")}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {filtered.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              t={t}
              dlOpen={dlBooking === b.id}
              setDlOpen={(v) => setDlBooking(v ? b : null)}
              onResume={handleResume}
              onConfirm={handleConfirm}
              confirmingId={confirmingId}
            />
          ))}
        </div>
      )}

      {payPayment && (
        <PaymentModal
          open={Boolean(payBooking)}
          payment={payPayment}
          status={payStatus}
          error={payError}
          checking={payChecking}
          refreshing={payRefreshing}
          bookingCode={payBooking?.booking_code}
          onCheck={checkPay}
          onRefresh={refreshPay}
          onClose={() => {
            setPayBooking(null);
            setPayError("");
          }}
        />
      )}
    </div>
  );
}