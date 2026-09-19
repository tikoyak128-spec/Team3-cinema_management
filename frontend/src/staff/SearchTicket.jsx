import { useState, useMemo } from "react";
import { Armchair, CalendarClock, CheckCircle2, CircleUser, Clapperboard, MapPin, QrCode, Search, SearchX, Ticket } from "lucide-react";
import api from "../api/client";
import { usePrefs } from "../context/PrefsContext";
import PaymentModal from "../components/PaymentModal";

const fmtDate = (s) => {
  if (!s) return "—";
  const d = new Date(s.replace(" ", "T"));
  return isNaN(d) ? s : d.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
};

export default function SearchTicket() {
  const { t } = usePrefs();
  const [code, setCode] = useState("");
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [confirmingId, setConfirmingId] = useState(null);
  const [payBooking, setPayBooking] = useState(null);
  const [payStatus, setPayStatus] = useState("pending");
  const [payError, setPayError] = useState("");
  const [payChecking, setPayChecking] = useState(false);
  const [payRefreshing, setPayRefreshing] = useState(false);

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

  const handleConfirm = async (booking) => {
    setConfirmingId(booking.id);
    setError("");
    try {
      const { data } = await api.post(`/staff/bookings/${booking.id}/confirm-payment`);
      setResults((prev) => prev.map((b) => (b.id === booking.id ? data.booking || data : b)));
      if (data.payment_status === "confirmed") {
        setInfo(t("staff.paymentConfirmed"));
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Could not confirm payment.");
    } finally {
      setConfirmingId(null);
    }
  };

  const handlePay = (booking) => {
    setPayBooking(booking);
    setPayStatus("pending");
    setPayError("");
    setError("");
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
        setResults((prev) =>
          prev.map((b) =>
            b.id === payBooking.id ? (updated || { ...b, status: "confirmed" }) : b
          )
        );
        setPayBooking(null);
        setInfo(t("staff.paymentConfirmed"));
        return;
      }
      if (verification_error) {
        setPayError(message || t("staff.paymentCheckFailed"));
      }
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
      const res = await api.post(`/staff/bookings/${payBooking.id}/payment/refresh`);
      if (res.data?.payment_status === "confirmed") {
        const updated = res.data?.booking || { ...payBooking, status: "confirmed" };
        setResults((prev) =>
          prev.map((b) => (b.id === payBooking.id ? updated : b))
        );
        setPayBooking(null);
        setInfo(t("staff.paymentConfirmed"));
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
      setPayError(err?.response?.data?.message || t("staff.refreshPaymentFailed"));
    } finally {
      setPayRefreshing(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setSearched(true);
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/staff/bookings/search", { params: { code: code.trim() } });
      setResults(data);
    } catch (err) {
      setResults([]);
      setError(err?.response?.data?.message || t("staff.searching"));
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = (s) =>
    s === "confirmed"
      ? "bg-[rgba(22,163,74,0.14)] text-[#22c55e] border border-[rgba(34,197,94,0.3)]"
      : s === "pending"
      ? "bg-[rgba(234,179,8,0.14)] text-[#eab308] border border-[rgba(234,179,8,0.3)]"
      : "bg-[rgba(229,9,20,0.14)] text-[#e50914] border border-[rgba(229,9,20,0.3)]";

  const ticketStatusBadge = (s) =>
    s === "valid"
      ? "bg-[rgba(22,163,74,0.14)] text-[#22c55e] border border-[rgba(34,197,94,0.3)]"
      : s === "checked_in"
      ? "bg-[rgba(96,165,250,0.14)] text-[#60a5fa] border border-[rgba(96,165,250,0.3)]"
      : "bg-[rgba(229,9,20,0.14)] text-[#e50914] border border-[rgba(229,9,20,0.3)]";

  return (
    <div className="flex flex-col gap-6 text-[var(--app-ink)]">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-[26px] font-extrabold">{t("staff.searchTicket")}</h1>
          <p className="text-sm text-[var(--app-mute)] mt-1">{t("staff.searchTicketSubtitle")}</p>
        </div>
      </div>

      <form className="flex items-center gap-3.5 bg-[var(--app-deep)] border-2 border-[var(--app-edge)] rounded-2xl py-5 px-6 mb-5" onSubmit={handleSearch}>
        <span className="text-2xl"><Search size={18} /></span>
        <input
          className="bg-transparent border-none outline-none text-[var(--app-ink)] text-lg w-full placeholder:text-[var(--app-ink2)]"
          placeholder={t("staff.bookingPlaceholder")}
          value={code}
          onChange={(e) => { setCode(e.target.value); setSearched(false); }}
        />
        <button type="submit" className="inline-flex items-center gap-2 border-none cursor-pointer py-[11px] px-5 text-sm font-bold rounded-xl transition-all duration-200 bg-[#e50914] text-white shadow-[0_4px_14px_rgba(229,9,20,0.35)] hover:bg-[#f40612] hover:-translate-y-0.5">
          {loading ? t("staff.searching") : t("staff.search")}
        </button>
      </form>

      {error && (
        <div className="bg-[rgba(229,9,20,0.12)] border border-[rgba(229,9,20,0.4)] text-[#ff6b6b] text-[13px] p-[10px_14px] rounded-[10px] flex justify-between items-center">
          {error}
          <button onClick={() => setError("")} className="bg-transparent border-none text-[#ff6b6b] text-[18px] cursor-pointer leading-none">×</button>
        </div>
      )}

      {info && (
        <div className="bg-[rgba(34,197,94,0.12)] border border-[rgba(34,197,94,0.35)] text-[#6ee7a8] text-[13px] p-[10px_14px] rounded-[10px] flex justify-between items-center">
          {info}
          <button onClick={() => setInfo("")} className="bg-transparent border-none text-[#6ee7a8] text-[18px] cursor-pointer leading-none">×</button>
        </div>
      )}

      {loading && <p className="text-[var(--app-mute)]">{t("staff.searching")}</p>}

      {searched && !loading && results.length === 0 && !error && (
        <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl p-6">
          <div className="flex flex-col items-center justify-center py-[40px] text-[var(--app-mute)] [text-align:center]">
            <div className="text-[44px] mb-[10px]"><SearchX size={44} /></div>
            <p>{t("staff.noBookingFound", { code: code.toUpperCase() })}</p>
          </div>
        </div>
      )}

      {searched && !loading && results.length > 0 && (
        <div className="flex flex-col gap-4">
          {results.map((b) => (
            <div key={b.id} className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl p-6">
              <div className="flex items-center gap-3.5 p-4 bg-[var(--app-panel2)] rounded-xl border border-[var(--app-edge)] mb-4 flex-wrap">
                <div className="w-[44px] h-[44px] rounded-full bg-[rgba(229,9,20,0.12)] flex items-center justify-center text-lg shrink-0"><Ticket size={20} /></div>
                <div className="min-w-0 flex-1">
                  <div className="font-extrabold text-base">{t("staff.booking")} #{b.booking_code}</div>
                  <div className="text-[13px] text-[var(--app-mute)]">{b.showtime?.movie?.title} · {b.showtime?.room?.cinema?.name} · {b.showtime?.room?.name}</div>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-[5px] text-xs font-bold rounded-[20px] whitespace-nowrap ${statusBadge(b.status)}`}>
                  {b.status}
                </span>
              </div>

              <div className="bg-[var(--app-panel2)] border border-[var(--app-edge)] rounded-[14px] p-[22px]">
                <div className="flex justify-between items-center py-3 border-b border-[var(--app-edge)] last:border-b-0">
                  <span className="text-[13px] text-[var(--app-mute)] font-semibold"><CircleUser size={13} className="mr-1 inline" /> {t("staff.customer")}</span>
                  <span className="text-[15px] font-bold text-right">{b.user?.name || t("staff.walkIn")} {b.user?.email ? `· ${b.user.email}` : ""}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-[var(--app-edge)] last:border-b-0">
                  <span className="text-[13px] text-[var(--app-mute)] font-semibold"><Clapperboard size={13} className="mr-1 inline" /> {t("staff.movie")}</span>
                  <span className="text-[15px] font-bold text-right">{b.showtime?.movie?.title}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-[var(--app-edge)] last:border-b-0">
                  <span className="text-[13px] text-[var(--app-mute)] font-semibold"><MapPin size={13} className="mr-1 inline" /> {t("staff.cinema")}</span>
                  <span className="text-[15px] font-bold text-right">{b.showtime?.room?.cinema?.name} · {b.showtime?.room?.name}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-[var(--app-edge)] last:border-b-0">
                  <span className="text-[13px] text-[var(--app-mute)] font-semibold"><CalendarClock size={13} className="mr-1 inline" /> {t("staff.showtime")}</span>
                  <span className="text-[15px] font-bold text-right">{fmtDate(b.showtime?.start_time)}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-[var(--app-edge)] last:border-b-0">
                  <span className="text-[13px] text-[var(--app-mute)] font-semibold">{t("staff.seats")}</span>
                  <span className="text-[15px] font-bold text-right flex flex-wrap gap-2.5 justify-end">
                    {(b.booking_seats || []).map((bs) => (
                      <span key={bs.id} className="inline-flex items-center gap-1.5 bg-[var(--app-panel2)] border border-[var(--app-edge2)] text-[var(--app-ink2)] py-1.5 px-3 rounded-[10px] text-[13px] font-semibold"><Armchair size={13} /> {bs.seat?.seat_number || "?"}</span>
                    ))}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-[var(--app-edge)] last:border-b-0">
                  <span className="text-[13px] text-[var(--app-mute)] font-semibold">{t("staff.totalPaid")}</span>
                  <span className="text-[15px] font-bold text-[var(--app-ink)] text-right">${Number(b.total_amount).toFixed(2)}</span>
                </div>
                {b.status === "pending" && (
                  <div className="flex justify-end items-center py-3 last:border-b-0 gap-2.5 flex-wrap">
                    <button
                      onClick={() => handlePay(b)}
                      className="inline-flex items-center gap-2 border border-[var(--app-edge2)] cursor-pointer py-2.5 px-5 text-sm font-bold text-[var(--app-ink2)] rounded-xl transition-all duration-200 bg-[var(--app-panel2)] hover:bg-[var(--app-fill)] hover:-translate-y-0.5"
                    >
                      <QrCode size={16} />
                      {t("staff.showQrCode")}
                    </button>
                    <button
                      onClick={() => handleConfirm(b)}
                      disabled={confirmingId === b.id}
                      className="inline-flex items-center gap-2 border-none cursor-pointer py-2.5 px-5 text-sm font-bold rounded-xl transition-all duration-200 bg-[#22c55e] text-white shadow-[0_4px_14px_rgba(34,197,94,0.3)] hover:bg-[#16a34a] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-wait disabled:hover:translate-y-0"
                    >
                      <CheckCircle2 size={16} />
                      {confirmingId === b.id ? t("staff.confirming") : t("staff.confirmPayment")}
                    </button>
                  </div>
                )}
                {(b.tickets || []).length > 0 && (
                  <div className="flex flex-wrap justify-between items-center py-3 last:border-b-0 gap-3">
                    <span className="text-[13px] text-[var(--app-mute)] font-semibold">{t("staff.tickets")}</span>
                    <span className="text-right flex flex-wrap gap-2 justify-end">
                      {b.tickets.map((tk) => (
                        <span key={tk.id} className="inline-flex flex-col items-end gap-1.5">
                          <span className="inline-flex items-center gap-1.5 bg-[var(--app-panel2)] border border-[var(--app-edge2)] text-[var(--app-ink2)] py-1.5 px-3 rounded-[10px] text-[13px] font-mono font-semibold"><Ticket size={13} /> {tk.ticket_code}</span>
                          <span className={`inline-flex items-center gap-1.5 py-[3px] px-2.5 text-[10px] font-bold rounded-full whitespace-nowrap ${ticketStatusBadge(tk.status)}`}>{tk.status}</span>
                        </span>
                      ))}
                    </span>
                  </div>
                )}
              </div>
            </div>
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