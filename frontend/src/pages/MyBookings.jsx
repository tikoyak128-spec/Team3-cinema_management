import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { usePrefs } from "../context/PrefsContext";
import api from "../api/client";
import TicketCard from "../components/TicketCard";
import PaymentModal from "../components/PaymentModal";
import downloadPdf from "../utils/downloadPdf";
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
  Download,
  QrCode,
  X,
  XCircle,
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

function UpcomingCard({ booking, t, i, onCancel, onPay, cancellingId }) {
  const [open, setOpen] = useState(i === 0);
  const [dlOpen, setDlOpen] = useState(false);
  const ticketRefs = useRef({});
  const movie = booking.showtime?.movie;
  const cinema = booking.showtime?.room?.cinema?.name;
  const room = booking.showtime?.room?.name;
  const tickets = booking.tickets || [];
  const canCancel =
    ["pending", "confirmed"].includes(booking.status) &&
    booking.showtime?.start_time &&
    new Date(booking.showtime.start_time) >= new Date();

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
                <span className="inline-flex items-center gap-3">
                  <span
                    className="inline-flex items-center gap-1.5 border-none cursor-pointer py-1.5 px-3 text-xs font-bold rounded-lg bg-[rgba(22,163,74,0.12)] text-[#16a34a] hover:bg-[rgba(22,163,74,0.2)]"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDlOpen(true);
                    }}
                  >
                    <Download size={13} /> {t("myBookings.downloadAll")}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-[var(--app-mute)] transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                  />
                </span>
              </button>
              <div
                className={`grid transition-all duration-300 ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
              >
                <div className="overflow-hidden">
                  <div className="px-4 pb-4 flex flex-col gap-4 items-center">
                    {tickets.map((tk) => (
                      <div key={tk.id} className="flex flex-col items-center gap-3 w-full">
                        <div ref={(el) => { ticketRefs.current[tk.id] = el; }}>
                          <TicketCard
                            movie={movie?.title}
                            cinema={booking.showtime?.room?.cinema?.name}
                            room={booking.showtime?.room?.name}
                            startTime={booking.showtime?.start_time}
                            bookingCode={booking.booking_code}
                            ticketCode={tk.ticket_code}
                            seats={[
                              (booking.booking_seats || []).find(
                                (b) => b.id === tk.booking_seat_id
                              ),
                            ].filter(Boolean)}
                            amount={Number(booking.total_amount || 0) / (tickets.length || 1)}
                            currency="USD"
                          />
                        </div>
                        <button
                          className="inline-flex items-center gap-2 border-none cursor-pointer py-2.5 px-5 text-sm font-bold rounded-xl transition-all duration-200 bg-[rgba(22,163,74,0.12)] text-[#16a34a] hover:bg-[rgba(22,163,74,0.2)]"
                          onClick={() => downloadPdf(ticketRefs.current[tk.id], `${tk.ticket_code || "ticket"}.pdf`)}
                        >
                          <Download size={15} /> {t("myBookings.downloadPdf")}
                        </button>
                      </div>
                    ))}
                  </div>
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

          {canCancel && (
            <button
              disabled={cancellingId === booking.id}
              onClick={() => onCancel(booking.id)}
              className="inline-flex items-center justify-center gap-2 border border-[rgba(229,9,20,0.4)] text-[#e50914] hover:bg-[rgba(229,9,20,0.12)] disabled:opacity-60 disabled:cursor-not-allowed font-bold text-[13px] px-4 py-2.5 rounded-xl transition-all cursor-pointer w-fit"
            >
              <XCircle size={15} />
              {cancellingId === booking.id
                ? t("myBookings.cancelling")
                : t("myBookings.cancelBooking")}
            </button>
          )}

          {booking.status === "pending" && (
            <div className="border-t border-[var(--app-edge)] pt-4 flex flex-col gap-3">
              <p className="text-[13px] font-semibold text-[var(--app-mute)] leading-relaxed">
                {t("myBookings.pendingPaymentNote")}
              </p>
              <button
                onClick={() => onPay(booking)}
                className="inline-flex items-center justify-center gap-2 bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold text-[13px] px-5 py-3 rounded-xl transition-all cursor-pointer w-fit"
              >
                <QrCode size={15} />
                {t("myBookings.resumePayment")}
              </button>
            </div>
          )}
        </div>
      </div>

      {dlOpen && <DownloadTicketsModal booking={booking} t={t} onClose={() => setDlOpen(false)} />}
    </div>
  );
}

function DownloadTicketsModal({ booking, t, onClose }) {
  const refs = useRef({});
  const movie = booking.showtime?.movie;
  const tickets = booking.tickets || [];

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[720px] max-h-[92vh] overflow-hidden bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-[26px] shadow-[0_30px_80px_rgba(0,0,0,0.55)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-[6px] bg-gradient-to-r from-[#e50914] via-[#ff5a5f] to-[#e50914]" />
        <div className="px-6 pt-5 pb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-extrabold text-[var(--app-ink)]">
                {t("myBookings.tickets")} ({tickets.length})
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
                    seats={[
                      (booking.booking_seats || []).find(
                        (b) => b.id === tk.booking_seat_id
                      ),
                    ].filter(Boolean)}
                    amount={Number(booking.total_amount || 0) / (tickets.length || 1)}
                    currency="USD"
                  />
                </div>
                <button
                  className="inline-flex items-center gap-2 border-none cursor-pointer py-2.5 px-5 text-sm font-bold rounded-xl transition-all duration-200 bg-[rgba(22,163,74,0.12)] text-[#16a34a] hover:bg-[rgba(22,163,74,0.2)]"
                  onClick={() => downloadPdf(refs.current[tk.id], `${tk.ticket_code || "ticket"}.pdf`)}
                >
                  <Download size={15} /> {t("myBookings.downloadPdf")}
                </button>
              </div>
            ))}
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
  const [dlBooking, setDlBooking] = useState(null);

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
              <th>{t("myBookings.ticket")}</th>
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
                <td>
                  {(b.tickets || []).length > 0 && (
                    <button
                      className="inline-flex items-center gap-1.5 border-none cursor-pointer py-1.5 px-3.5 text-[12px] font-bold rounded-lg bg-[rgba(22,163,74,0.12)] text-[#16a34a] hover:bg-[rgba(22,163,74,0.2)] whitespace-nowrap"
                      onClick={() => setDlBooking(b)}
                    >
                      <Download size={13} /> {t("myBookings.downloadPdf")}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {dlBooking && (
        <DownloadTicketsModal booking={dlBooking} t={t} onClose={() => setDlBooking(null)} />
      )}
    </div>
  );
}

export default function MyBookings() {
  const { t } = usePrefs();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [cancellingId, setCancellingId] = useState(null);
  const [tab, setTab] = useState("all");
  const [payBooking, setPayBooking] = useState(null);
  const [payStatus, setPayStatus] = useState("pending");
  const [payError, setPayError] = useState("");
  const [payChecking, setPayChecking] = useState(false);
  const [payRefreshing, setPayRefreshing] = useState(false);

  const handleCancel = async (id) => {
    if (!window.confirm(t("myBookings.cancelConfirm"))) return;
    setCancellingId(id);
    setError("");
    setNotice("");
    try {
      await api.post(`/bookings/${id}/cancel`);
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b))
      );
      setNotice(t("myBookings.cancelSuccess"));
    } catch (err) {
      setError(err?.response?.data?.message || t("myBookings.cancelFailed"));
    } finally {
      setCancellingId(null);
    }
  };

  const handlePay = (booking) => {
    setPayBooking(booking);
    setPayStatus("pending");
    setPayError("");
    setNotice("");
  };

  const checkPay = async () => {
    if (!payBooking?.id) return;
    setPayChecking(true);
    setPayError("");
    try {
      const res = await api.get(`/bookings/${payBooking.id}/payment`);
      const { payment_status, message, verification_error, booking: updated } = res.data;
      setPayStatus(payment_status);
      if (payment_status === "confirmed") {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === payBooking.id ? (updated || { ...b, status: "confirmed" }) : b
          )
        );
        setPayBooking(null);
        setNotice(t("myBookings.paymentConfirmedNotice"));
        return;
      }
      if (verification_error) {
        setPayError(message || t("myBookings.paymentCheckFailed"));
      }
    } catch (err) {
      setPayError(err?.response?.data?.message || t("myBookings.paymentCheckFailed"));
    } finally {
      setPayChecking(false);
    }
  };

  const refreshPay = async () => {
    if (!payBooking?.id) return;
    setPayRefreshing(true);
    setPayError("");
    try {
      const res = await api.post(`/bookings/${payBooking.id}/payment/refresh`);
      if (res.data?.payment_status === "confirmed") {
        const updated = res.data?.booking || { ...payBooking, status: "confirmed" };
        setBookings((prev) =>
          prev.map((b) => (b.id === payBooking.id ? updated : b))
        );
        setPayBooking(null);
        setNotice(t("myBookings.paymentConfirmedNotice"));
        return;
      }
      const np = res.data?.payment || {};
      setPayBooking((prev) =>
        prev
          ? {
              ...prev,
              payment_qr: np.qr,
              payment_md5: np.md5,
              payment_expires_at: np.expires_at,
            }
          : prev
      );
      setPayStatus("pending");
    } catch (err) {
      setPayError(err?.response?.data?.message || t("myBookings.refreshPaymentFailed"));
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
      currency: payBooking.currency || "KHR",
      expires_at: payBooking.payment_expires_at,
    };
  }, [payBooking]);

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
        <div className="absolute -bottom-24 -left-16 w-64 h-64 rounded-full bg-[rgba(237,195,143,0.08)] blur-[70px]" />
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
      {notice && (
        <div className="bg-[rgba(22,163,74,0.12)] border border-[rgba(34,197,94,0.4)] text-[#22c55e] text-[13px] p-4 rounded-xl mb-6 flex justify-between items-center">
          {notice}
          <button onClick={() => setNotice("")} className="bg-transparent border-none text-[#22c55e] text-[18px] cursor-pointer leading-none">×</button>
        </div>
      )}

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
            filtered.map((b, i) => (
              <UpcomingCard
                key={b.id}
                booking={b}
                t={t}
                i={i}
                onCancel={handleCancel}
                onPay={handlePay}
                cancellingId={cancellingId}
              />
            ))
          )}
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