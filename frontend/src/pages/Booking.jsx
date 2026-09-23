import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, DoorOpen, Loader2, TriangleAlert, ScanLine, MapPin, Building2, ChevronDown, BadgePercent, Download, Receipt, CreditCard, CheckCircle2, Lock } from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import TicketCard from "../components/TicketCard";
import PaymentModal from "../components/PaymentModal";
import downloadPdf from "../utils/downloadPdf";

const steps = ["Showtime", "Seats", "Receipt", "Tickets"];

const currencySymbol = (currency) => (currency === "KHR" ? "៛" : "$");

const formatSeat = (seatNumber) => seatNumber;

export default function Booking() {
  const navigate = useNavigate();
  const { movieTitle } = useParams();
  const [searchParams] = useSearchParams();
  const promoId = searchParams.get("promo");
  const { user } = useAuth();
  const movieName = useMemo(() => decodeURIComponent(movieTitle || "Unknown Movie"), [movieTitle]);

  const [step, setStep] = useState(0);
  const [loadingShowtimes, setLoadingShowtimes] = useState(true);
  const [showtimes, setShowtimes] = useState([]);
  const [fallbackShowtimes, setFallbackShowtimes] = useState(false);
  const [showtimeError, setShowtimeError] = useState("");
  const [selectedShowtimeId, setSelectedShowtimeId] = useState(null);
  const [selectedCinemaId, setSelectedCinemaId] = useState(null);
  const [seats, setSeats] = useState([]);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [creating, setCreating] = useState(false);
  const [booking, setBooking] = useState(null);
  const [payment, setPayment] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [paymentError, setPaymentError] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(null);
  const [checking, setChecking] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("bakong");
  const [activePromo, setActivePromo] = useState(null);
  const [availableDiscounts, setAvailableDiscounts] = useState([]);
  const [discountInput, setDiscountInput] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [discountError, setDiscountError] = useState("");
  const pollRef = useRef(null);
  const ticketRefs = useRef({});

  const clearPoll = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  useEffect(() => {
    if (!promoId) return;
    let cancelled = false;
    api
      .get("/promotions")
      .then((res) => {
        if (cancelled) return;
        const match = (res.data || []).find((p) => String(p.id) === String(promoId));
        setActivePromo(match || null);
      })
      .catch(() => {
        if (!cancelled) setActivePromo(null);
      });
    return () => {
      cancelled = true;
    };
  }, [promoId]);

  useEffect(() => {
    let cancelled = false;
    api
      .get("/discounts")
      .then((res) => {
        if (cancelled) return;
        const now = new Date();
        const active = (res.data || []).filter(
          (d) =>
            d.is_active !== false &&
            (!d.starts_at || new Date(d.starts_at) <= now) &&
            (!d.ends_at || new Date(d.ends_at) >= now)
        );
        setAvailableDiscounts(active);
      })
      .catch(() => {
        if (!cancelled) setAvailableDiscounts([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoadingShowtimes(true);
    setFallbackShowtimes(false);
    api
      .get("/showtimes")
      .then((res) => {
        if (cancelled) return;
        const list = res.data || [];
        const mine = list.filter((st) =>
          (st.movie?.title || "").toLowerCase() === movieName.toLowerCase()
        );
        if (mine.length > 0) {
          setShowtimes(mine);
        } else {
          setShowtimes(list);
          setFallbackShowtimes(true);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setShowtimeError(err?.response?.data?.message || "Failed to load showtimes.");
      })
      .finally(() => {
        if (!cancelled) setLoadingShowtimes(false);
      });
    return () => {
      cancelled = true;
      clearPoll();
    };
  }, [movieName]);

  const selectedShowtime = showtimes.find((st) => st.id === selectedShowtimeId) || null;

  const groupedShowtimes = useMemo(() => {
    const map = {};
    showtimes.forEach((st) => {
      const cinema = st.room?.cinema || null;
      const cinemaId = cinema?.id ?? "unknown";
      if (!map[cinemaId]) map[cinemaId] = { cinema, cinemaId, rooms: {} };
      const roomId = st.room?.id ?? "unknown";
      if (!map[cinemaId].rooms[roomId]) {
        map[cinemaId].rooms[roomId] = { room: st.room ?? null, showtimes: [] };
      }
      if (!map[cinemaId].rooms[roomId].showtimes.some((x) => x.id === st.id)) {
        map[cinemaId].rooms[roomId].showtimes.push(st);
      }
    });
    return Object.values(map)
      .map((c) => ({
        ...c,
        rooms: Object.values(c.rooms)
          .map((room) => ({
            ...room,
            showtimes: room.showtimes.sort(
              (a, b) => new Date(a.start_time) - new Date(b.start_time)
            ),
          }))
          .sort((a, b) => String(a.room?.name || "").localeCompare(String(b.room?.name || ""))),
      }))
      .sort((a, b) => String(a.cinema?.name || "").localeCompare(String(b.cinema?.name || "")));
  }, [showtimes]);

  useEffect(() => {
    if (groupedShowtimes.length === 1) {
      setSelectedCinemaId(groupedShowtimes[0].cinemaId);
    }
  }, [groupedShowtimes.length]);

  useEffect(() => {
    if (!selectedShowtimeId) {
      setSeats([]);
      setSelectedSeats([]);
      return;
    }
    let cancelled = false;
    setLoadingSeats(true);
    api
      .get(`/showtimes/${selectedShowtimeId}/seats`)
      .then((res) => {
        if (cancelled) return;
        setSeats(res.data?.seats || []);
      })
      .catch(() => {
        if (!cancelled) setErrorMsg("Failed to load seats for this showtime.");
      })
      .finally(() => {
        if (!cancelled) setLoadingSeats(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedShowtimeId]);

  const seatsByRow = useMemo(() => {
    const map = {};
    seats.forEach((s) => {
      const row = s.row || (s.seat_number || "").replace(/[0-9]/g, "") || "?";
      if (!map[row]) map[row] = [];
      map[row].push(s);
    });
    Object.keys(map).forEach((row) =>
      map[row].sort((a, b) =>
        String(a.seat_number).localeCompare(String(b.seat_number), undefined, { numeric: true })
      )
    );
    const rows = Object.keys(map).sort();
    return rows.map((row) => ({ row, seats: map[row] }));
  }, [seats]);

  const subtotal = useMemo(() => {
    if (!selectedShowtime) return 0;
    return selectedShowtime.price * selectedSeats.length;
  }, [selectedShowtime, selectedSeats]);

  const promoRate = useMemo(() => {
    if (!activePromo) return 0;
    const pct = parseInt((activePromo.discount || "").replace(/[^0-9]/g, ""), 10);
    return Number.isFinite(pct) && pct > 0 ? pct : 0;
  }, [activePromo]);

  const promoClaimed = activePromo?.claim?.claimed === true;
  const promoLocked = !!activePromo && promoRate > 0 && !promoClaimed;
  const promoActive = !!activePromo && promoRate > 0 && promoClaimed;

  const isCashBooking = booking?.payment_method === "cash";
  const isBakongBooking = !!booking && !isCashBooking;

  const discountAmount = useMemo(() => {
    if (!promoRate) return 0;
    return Math.round(subtotal * (promoRate / 100) * 100) / 100;
  }, [promoRate, subtotal]);

  const displayCurrency = selectedShowtime?.payment_currency || "USD";

  const renderPrice = (amount) => `${currencySymbol(displayCurrency)}${Number(amount || 0).toFixed(2)}`;

  const discountValid = useMemo(() => {
    if (!appliedDiscount) return false;
    if (appliedDiscount.min_amount != null && subtotal < parseFloat(appliedDiscount.min_amount)) {
      return false;
    }
    return true;
  }, [appliedDiscount, subtotal]);

  const discountCodeAmount = useMemo(() => {
    if (!discountValid) return 0;
    let amount;
    if (appliedDiscount.type === "fixed") {
      amount = parseFloat(appliedDiscount.value) || 0;
    } else {
      amount = Math.round(subtotal * ((parseFloat(appliedDiscount.value) || 0) / 100) * 100) / 100;
    }
    if (appliedDiscount.max_discount != null) {
      amount = Math.min(amount, parseFloat(appliedDiscount.max_discount) || 0);
    }
    const base = Math.max(0, subtotal - discountAmount);
    amount = Math.round(amount * 100) / 100;
    if (amount <= 0 || amount >= base) return 0;
    return amount;
  }, [appliedDiscount, subtotal, discountValid, discountAmount]);

  const totalAmount = useMemo(() =>
    Math.max(0, Math.round((subtotal - discountAmount - discountCodeAmount) * 100) / 100),
    [subtotal, discountAmount, discountCodeAmount]
  );

  const applyDiscount = () => {
    const code = (discountInput || "").trim();
    if (!code) return;
    const match = availableDiscounts.find((d) => String(d.code).toUpperCase() === code.toUpperCase());
    if (!match) {
      setAppliedDiscount(null);
      setDiscountError("That discount code is invalid or expired.");
      return;
    }
    if (match.min_amount != null && subtotal < parseFloat(match.min_amount)) {
      setAppliedDiscount(null);
      setDiscountError(`This discount requires a minimum order of ${renderPrice(match.min_amount)}.`);
      return;
    }
    setAppliedDiscount(match);
    setDiscountError("");
  };

  const toggleSeat = (seatId) => {
    const seat = seats.find((s) => s.id === seatId);
    if (seat?.occupied) return;
    setSelectedSeats((prev) =>
      prev.includes(seatId) ? prev.filter((id) => id !== seatId) : [...prev, seatId]
    );
  };

  const startPayment = async () => {
    if (!user?.id) {
      setPaymentError("Please log in to continue.");
      return;
    }
    if (!selectedShowtimeId || selectedSeats.length === 0) return;

    setCreating(true);
    setPaymentError("");
    setErrorMsg("");
    try {
      const res = await api.post("/bookings", {
        showtime_id: selectedShowtimeId,
        seat_ids: selectedSeats,
        payment_method: paymentMethod,
        ...(promoActive ? { promotion_id: Number(promoId) } : {}),
        ...(appliedDiscount ? { discount_code: appliedDiscount.code } : {}),
      });
      const data = res.data;
      const pay = data.payment;

      if (data.pay_at_counter) {
        setBooking(data);
        setPayment(null);
        setPaymentStatus("pending");
        setPaymentError("");
        setErrorMsg("");
        setStep(2);
        return;
      }

      if (!pay || !pay.qr) {
        setPaymentError("Could not generate Bakong payment code.");
        setStep(2);
        return;
      }

      setBooking(data);
      setPayment(pay);
      setPaymentStatus("pending");
      setPaymentError("");
      setStep(2);
      setShowPaymentModal(true);
    } catch (err) {
      const data = err?.response?.data || {};
      const msg =
        data.message ||
        data.errors?.[0] ||
        "Could not create booking. Please try again.";
      setErrorMsg(msg);
      setPaymentError(msg);

      const bookedIds = data.booked_seat_ids;
      if (Array.isArray(bookedIds) && bookedIds.length) {
        setSelectedSeats((prev) => prev.filter((id) => !bookedIds.includes(id)));
        setStep(1);
        try {
          const seatsRes = await api.get(`/showtimes/${selectedShowtimeId}/seats`);
          setSeats(seatsRes.data?.seats || []);
        } catch {
          // keep the previous seat map if refresh fails
        }
      } else {
        setStep(2);
      }
    } finally {
      setCreating(false);
    }
  };

  const checkPayment = async () => {
    if (!booking?.id) return;
    setChecking(true);
    try {
      const res = await api.get(`/bookings/${booking.id}/payment`);
      const { payment_status, message, verification_error } = res.data;
      setPaymentStatus(payment_status);
      if (payment_status === "confirmed") {
        clearPoll();
        setPaymentError("");
        setSuccess(res.data.booking || booking);
        setShowPaymentModal(false);
        setStep(3);
        return;
      }
      if (verification_error) {
        clearPoll();
        setPaymentError(
          message ||
            "Could not verify payment automatically. Your booking stays pending until a staff member verifies the payment."
        );
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Could not check payment.";
      setPaymentError(msg);
    } finally {
      setChecking(false);
    }
  };

  const refreshPayment = async () => {
    if (!booking?.id) return;
    setRefreshing(true);
    setPaymentError("");
    try {
      const res = await api.post(`/bookings/${booking.id}/payment/refresh`);
      if (res.data?.payment_status === "confirmed") {
        clearPoll();
        setPaymentStatus("confirmed");
        setPaymentError("");
        setSuccess(res.data.booking || booking);
        setShowPaymentModal(false);
        setStep(3);
        return;
      }
      const np = res.data?.payment || {};
      setPayment((prev) =>
        prev
          ? {
              ...prev,
              qr: np.qr,
              md5: np.md5,
              amount: np.amount ?? prev.amount,
              currency: np.currency ?? prev.currency,
              expires_at: np.expires_at,
            }
          : prev
      );
      setPaymentStatus("pending");
    } catch (err) {
      setPaymentError(
        err?.response?.data?.message || "Could not generate a new payment code."
      );
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (step === 2 && paymentStatus === "pending" && booking?.id && !isCashBooking) {
      clearPoll();
      pollRef.current = setInterval(checkPayment, 15000);
      return () => clearPoll();
    }
  }, [step, paymentStatus, booking?.id, isCashBooking]);

  return (
    <div className="bg-[var(--app-page)] text-[var(--app-ink)] font-['Mulish','Kantumruy_Pro',-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif]">
      <main className="max-w-[1020px] w-full mx-auto px-4 sm:px-7 pb-10 sm:pb-14 pt-24 sm:pt-28 md:pt-32 flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <button className="inline-flex items-center gap-2 bg-[var(--app-panel)] border border-[var(--app-edge)] text-[var(--app-ink2)] py-2.5 pl-3 pr-4 rounded-full text-[13px] font-bold cursor-pointer transition-all duration-200 hover:text-white hover:bg-brand hover:border-brand hover:shadow-[0_6px_18px_rgba(229,9,20,0.35)]" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} />
            Back
          </button>
          <nav className="flex items-center gap-1.5 flex-wrap justify-end">
            {steps.map((s, i) => (
              <div key={s} className={`flex items-center gap-2 px-3 py-1.5 rounded-[20px] text-[13px] font-[700] transition-all duration-200 ${i === step ? "text-[var(--app-ink)]" : ""} ${i < step ? "text-[#22c55e]" : ""} ${i >= step ? "text-[var(--app-mute)]" : ""}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${i === step ? "bg-[#e50914] text-white shadow-[0_0_0_4px_rgba(229,9,20,0.2)]" : ""} ${i < step ? "bg-[rgba(34,197,94,0.2)] text-[#22c55e]" : ""} ${i >= step && i > step ? "bg-[var(--app-panel2)]" : ""}`}>{i < step ? "✓" : i + 1}</span>
                <span className="max-md:hidden">{s}</span>
              </div>
            ))}
          </nav>
        </div>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3.5">
            <div>
              <h1 className="text-[26px] font-[800] max-md:text-[20px]">{movieName}</h1>
              <p className="text-[var(--app-mute)] text-sm mt-1">
                {selectedShowtime ? `${selectedShowtime.room?.cinema?.name || ""}${selectedShowtime.room?.name ? " · " + selectedShowtime.room.name : ""} · ${new Date(selectedShowtime.start_time).toLocaleString()}` : "Choose a showtime below"}
              </p>
            </div>
          </div>
          {selectedShowtime && (
            <div className="text-[22px] font-[800] text-[#e50914] group/price">{renderPrice(selectedShowtime.price)} <span className="text-[13px] text-[var(--app-mute)] font-[600]">/ ticket</span></div>
          )}
        </div>

        {promoActive && (
          <div className="flex items-center gap-3 bg-[rgba(34,197,94,0.12)] border border-[rgba(34,197,94,0.35)] text-[#1f9d55] rounded-2xl px-4 py-3.5">
            <span className="w-10 h-10 rounded-xl bg-[#22c55e] text-white flex items-center justify-center shrink-0">
              <BadgePercent size={18} />
            </span>
            <div className="min-w-0">
              <div className="text-sm font-[800]">{activePromo.title}</div>
              <div className="text-[12px] text-[var(--app-ink2)] font-[600]">
                {promoRate}% OFF — applied automatically to your ticket total
              </div>
            </div>
          </div>
        )}

        {promoLocked && (
          <div className="flex items-center gap-3 bg-[rgba(251,191,36,0.12)] border border-[rgba(251,191,36,0.35)] text-[#b45309] rounded-2xl px-4 py-3.5">
            <span className="w-10 h-10 rounded-xl bg-[#f59e0b] text-white flex items-center justify-center shrink-0">
              <Lock size={18} />
            </span>
            <div className="min-w-0">
              <div className="text-sm font-[800]">{activePromo.title}</div>
              <div className="text-[12px] font-[600]">
                Claim this promotion (and meet its requirements) before using it —{" "}
                <Link to="/promotions" className="underline font-[800]">view promotions</Link>.
              </div>
            </div>
          </div>
        )}

        {step === 0 && (
          <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl p-[26px]">
            <div className="flex items-center justify-between gap-3 flex-wrap mb-[18px]">
              <h2 className="text-lg font-[800]">1. Choose a Cinema &amp; Showtime</h2>
              <span className="text-[var(--app-mute)] text-[12px] font-[700]">Tap a place, then pick a room &amp; time</span>
            </div>
            {loadingShowtimes && (
              <div className="flex items-center gap-2.5 text-[var(--app-mute)] text-sm font-[700] py-[18px]"><Loader2 className="animate-spin" size={18} /> Loading showtimes...</div>
            )}
            {showtimeError && <p className="text-[#e50914] text-[13px] font-[700] mt-4"><TriangleAlert size={16} /> {showtimeError}</p>}
            {fallbackShowtimes && !showtimeError && (
              <p className="text-[#fbbf24] text-[13px] font-[600] bg-[rgba(251,191,36,0.08)] border border-[rgba(251,191,36,0.2)] px-3.5 py-2.5 rounded-[10px] mt-3">
                No showtimes found for "{movieName}". Showing all available showtimes instead.
              </p>
            )}
            {!loadingShowtimes && !showtimeError && showtimes.length === 0 && (
              <p className="text-[#e50914] text-[13px] font-[700] mt-4">No showtimes available for this movie.</p>
            )}
            {showtimes.length > 0 && (
              <div className="flex flex-col gap-3">
                {groupedShowtimes.map((cinema) => {
                  const open = cinema.cinemaId === selectedCinemaId;
                  const roomCount = cinema.rooms.length;
                  const timeCount = cinema.rooms.reduce((n, r) => n + r.showtimes.length, 0);
                  return (
                    <div
                      key={cinema.cinemaId}
                      className={`overflow-hidden rounded-2xl border transition-all duration-200 ${open ? "border-brand/50 bg-[rgba(229,9,20,0.04)]" : "border-[var(--app-edge2)] bg-[var(--app-panel2)] hover:border-brand/40"}`}
                    >
                      <button
                        className="w-full flex items-center gap-4 p-4 text-left cursor-pointer"
                        onClick={() => setSelectedCinemaId(open ? null : cinema.cinemaId)}
                      >
                        <span className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${open ? "bg-brand" : "bg-[var(--app-panel2)]"} `}>
                          <Building2 size={20} className={open ? "text-white" : "text-brand"} />
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block font-[800] text-sm">{cinema.cinema?.name || "Location"}</span>
                          <span className="flex items-center gap-1.5 text-[var(--app-mute)] text-[12px] mt-[3px] truncate">
                            <MapPin size={12} className="shrink-0 text-brand" />
                            <span className="truncate">{cinema.cinema?.location || "—"}</span>
                          </span>
                        </span>
                        <span className="hidden sm:flex flex-col items-end gap-0.5 shrink-0">
                          <span className="text-[var(--app-mute)] text-[11px] font-[700]">{roomCount} room{roomCount !== 1 ? "s" : ""} · {timeCount} showtime{timeCount !== 1 ? "s" : ""}</span>
                          <span className="text-brand text-[11px] font-[800]">{open ? "Tap to close" : "Tap to see rooms & times"}</span>
                        </span>
                        <span className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all bg-[var(--app-fill)] border border-[var(--app-edge)] ${open ? "rotate-180" : ""}`}>
                          <ChevronDown size={16} className="text-[var(--app-mute)]" />
                        </span>
                      </button>

                      <div className={`grid transition-all duration-300 ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                        <div className="overflow-hidden">
                          <div className="px-4 pb-4 pt-1 flex flex-col gap-2.5">
                            {cinema.rooms.map((room) => (
                              <div key={room.room?.id ?? room.room?.name} className="border border-[var(--app-edge2)] bg-[var(--app-panel2)] rounded-xl p-3.5">
                                <div className="flex items-center justify-between gap-3 mb-2.5">
                                  <span className="flex items-center gap-2 text-sm font-[800]">
                                    <DoorOpen size={15} className="text-brand" /> {room.room?.name || "Room"}
                                  </span>
                                  <span className="text-[var(--app-mute)] text-[11px] font-[700]">{room.showtimes.length} time{room.showtimes.length !== 1 ? "s" : ""}</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {room.showtimes.map((st) => {
                                    const start = new Date(st.start_time);
                                    return (
                                      <button
                                        key={st.id}
                                        className="flex flex-col items-center gap-0.5 min-w-[92px] bg-[var(--app-panel2)] border border-[var(--app-edge2)] rounded-xl px-3.5 py-2.5 cursor-pointer transition-all duration-200 hover:border-brand hover:bg-[rgba(229,9,20,0.08)] hover:-translate-y-0.5"
                                        onClick={() => {
                                          setSelectedShowtimeId(st.id);
                                          setSelectedCinemaId(null);
                                          setStep(1);
                                        }}
                                      >
                                        <span className="text-[13px] font-[800]">{start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                                        <span className="text-[10px] text-[var(--app-mute)] font-[600]">
                                          {start.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
                                        </span>
                                        <span className="text-[11px] text-brand font-[800]">{renderPrice(st.price)}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-end mt-6">
              <button
                className="bg-[#e50914] text-white shadow-[0_4px_14px_rgba(229,9,20,0.35)] border-none cursor-pointer px-[22px] py-3 text-sm font-[700] rounded-xl transition-all duration-200 hover:bg-[#f40612] hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0"
                disabled={!selectedShowtimeId}
                onClick={() => setStep(1)}
              >
                Select Seats →
              </button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl p-[26px]">
            <h2 className="text-lg font-[800] mb-[18px]">2. Select Your Seats</h2>
            {loadingSeats && (
              <div className="flex items-center gap-2.5 text-[var(--app-mute)] text-sm font-[700] py-[18px]"><Loader2 className="animate-spin" size={18} /> Loading seats...</div>
            )}
            {!loadingSeats && seats.length === 0 && (
              <p className="text-[#e50914] text-[13px] font-[700] mt-4">No seats found for this room.</p>
            )}

            {!loadingSeats && seats.length > 0 && (
              <>
                <div className="text-center bg-[var(--app-panel2)] text-[var(--app-mute)] text-xs font-[700] tracking-[6px] py-2.5 rounded-[10px] mb-[22px] border border-[var(--app-edge2)]">SCREEN</div>
                <div className="flex flex-col gap-1.5 items-center overflow-x-auto pb-2">
                  {seatsByRow.map(({ row, seats: rowSeats }) => (
                    <div className="flex gap-1.5 items-center" key={row}>
                      <span className="w-[22px] text-xs text-[var(--app-mute)] text-center font-[700]">{row}</span>
                      {rowSeats.map((seat) => {
                        const isSel = selectedSeats.includes(seat.id);
                        const isOccupied = seat.occupied === true;
                        return (
                          <button
                            key={seat.id}
                            disabled={isOccupied}
                            className={`w-[30px] h-[26px] rounded-md border text-[10px] flex items-center justify-center transition-all duration-[150ms] ${isOccupied ? "bg-[rgba(229,9,20,0.15)] border-[rgba(229,9,20,0.45)] cursor-not-allowed text-[#e50914] opacity-60" : isSel ? "bg-[#e50914] border-[#e50914] text-white shadow-[0_0_8px_rgba(229,9,20,0.5)]" : seat.seat_type === "vip" ? "border-[#d4a017] bg-[#2a2410] text-[#666] cursor-pointer hover:border-[#d4a017]" : seat.seat_type === "couple" ? "border-[#a855f7] bg-[#2a1238] text-[#666] cursor-pointer hover:border-[#a855f7]" : "border-[var(--app-edge2)] bg-[var(--app-panel2)] text-[var(--app-mute)] cursor-pointer hover:border-[#e50914] hover:bg-[var(--app-edge)]"}`}
                            onClick={() => toggleSeat(seat.id)}
                            title={`${seat.seat_number}${isOccupied ? " (occupied)" : ""}`}
                          >
                            {(seat.seat_number || "").replace(row, "")}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
                <div className="flex gap-5 justify-center mt-[18px] flex-wrap">
                  <span className="flex items-center gap-2 text-[13px] text-[var(--app-mute)] font-[600]"><i className="w-4 h-4 rounded-[5px] inline-block bg-[var(--app-panel2)] border border-[var(--app-edge2)]" /> Available</span>
                  <span className="flex items-center gap-2 text-[13px] text-[var(--app-mute)] font-[600]"><i className="w-4 h-4 rounded-[5px] inline-block bg-[#e50914]" /> Selected</span>
                  <span className="flex items-center gap-2 text-[13px] text-[var(--app-mute)] font-[600]"><i className="w-4 h-4 rounded-[5px] inline-block bg-[rgba(229,9,20,0.15)] border border-[rgba(229,9,20,0.45)]" /> Occupied</span>
                  <span className="flex items-center gap-2 text-[13px] text-[var(--app-mute)] font-[600]"><i className="w-4 h-4 rounded-[5px] inline-block bg-[#2a2410] border border-[#d4a017]" /> VIP</span>
                  <span className="flex items-center gap-2 text-[13px] text-[var(--app-mute)] font-[600]"><i className="w-4 h-4 rounded-[5px] inline-block bg-[#2a1238] border border-[#a855f7]" /> Couple</span>
                </div>
              </>
            )}

            {errorMsg && <p className="text-[#e50914] text-[13px] font-[700] mt-4"><TriangleAlert size={16} /> {errorMsg}</p>}

            <div className="flex items-center justify-between gap-3 mt-6 flex-wrap">
              <button
                className="bg-transparent text-[var(--app-ink2)] border border-[var(--app-edge2)] cursor-pointer px-[18px] py-3 text-sm font-[700] rounded-xl transition-all duration-200 hover:bg-[var(--app-fill)] hover:border-[var(--app-edge2)]"
                onClick={() => setStep(0)}
              >
                ← Back
              </button>
              <button
                className="bg-[#e50914] text-white shadow-[0_4px_14px_rgba(229,9,20,0.35)] border-none cursor-pointer px-[22px] py-3 text-sm font-[700] rounded-xl transition-all duration-200 hover:bg-[#f40612] hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0"
                disabled={selectedSeats.length === 0}
                onClick={() => setStep(2)}
              >
                Continue to Receipt → · {renderPrice(totalAmount)}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-[1.05fr_0.95fr] gap-6 max-md:grid-cols-1">
            {/* Receipt */}
            <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl overflow-hidden">
              <div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-dashed border-[var(--app-edge2)]">
                <span className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/25 text-brand flex items-center justify-center shrink-0">
                  <Receipt size={18} />
                </span>
                <div>
                  <h2 className="text-base font-[800] leading-none">Your Receipt</h2>
                  <p className="text-[12px] text-[var(--app-mute)] font-[600] mt-1">
                    Review your order before payment
                  </p>
                </div>
              </div>

              <div className="px-6 py-5 flex flex-col">
                <div className="pb-4">
                  <div className="text-[11px] font-[800] uppercase tracking-[0.14em] text-[var(--app-mute)]">Movie</div>
                  <div className="text-[20px] font-[800] text-[var(--app-ink)] mt-1 leading-tight">{movieName}</div>
                </div>

                <div className="flex flex-col text-sm">
                  <div className="flex justify-between py-2.5 border-b border-[var(--app-edge)] gap-4">
                    <span className="text-[var(--app-mute)] font-[600]">Cinema</span>
                    <b className="text-[var(--app-ink)] text-right">{selectedShowtime?.room?.cinema?.name || "-"}</b>
                  </div>
                  <div className="flex justify-between py-2.5 border-b border-[var(--app-edge)] gap-4">
                    <span className="text-[var(--app-mute)] font-[600]">Room</span>
                    <b className="text-[var(--app-ink)] text-right">{selectedShowtime?.room?.name || "-"}</b>
                  </div>
                  <div className="flex justify-between py-2.5 border-b border-[var(--app-edge)] gap-4">
                    <span className="text-[var(--app-mute)] font-[600]">Showtime</span>
                    <b className="text-[var(--app-ink)] text-right">{selectedShowtime ? new Date(selectedShowtime.start_time).toLocaleString() : "-"}</b>
                  </div>
                </div>

                <div className="pt-4">
                  <div className="text-[11px] font-[800] uppercase tracking-[0.14em] text-[var(--app-mute)] mb-2">
                    Seats ({selectedSeats.length})
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {seats
                      .filter((s) => selectedSeats.includes(s.id))
                      .map((s) => (
                        <span
                          key={s.id}
                          className="inline-flex items-center gap-1.5 bg-[rgba(229,9,20,0.12)] border border-[rgba(229,9,20,0.3)] text-[#e50914] px-3 py-1.5 rounded-lg text-[13px] font-[800]"
                        >
                          <DoorOpen size={13} /> {formatSeat(s.seat_number)}
                        </span>
                      ))}
                  </div>
</div>
            </div>

              <div className="px-6 pt-5 pb-5 border-b border-dashed border-[var(--app-edge2)]">
                <div className="text-[11px] font-[800] uppercase tracking-[0.14em] text-[var(--app-mute)] mb-2">
                  Discount code
                </div>
                {appliedDiscount ? (
                  <>
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-[rgba(34,197,94,0.35)] bg-[rgba(34,197,94,0.1)] px-3.5 py-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <BadgePercent size={16} className="text-[#22c55e] shrink-0" />
                        <div className="min-w-0">
                          <div className="text-[13px] font-[800] text-[#1f9d55] truncate">
                            {appliedDiscount.code}{appliedDiscount.name ? ` · ${appliedDiscount.name}` : ""}
                          </div>
                          <div className="text-[11px] text-[var(--app-ink2)] font-[600]">
                            {appliedDiscount.type === "fixed"
                              ? `${renderPrice(appliedDiscount.value)} off`
                              : `${appliedDiscount.value}% off`}
                          </div>
                        </div>
                      </div>
                      <button
                        className="bg-transparent border-none cursor-pointer text-[#e50914] text-[12px] font-[800] hover:underline"
                        onClick={() => { setAppliedDiscount(null); setDiscountInput(""); setDiscountError(""); }}
                      >
                        Remove
                      </button>
                    </div>
                    {!discountValid && appliedDiscount.min_amount != null && (
                      <p className="mt-2 text-[#e50914] text-[12px] font-[700]">
                        This discount requires a minimum order of {renderPrice(appliedDiscount.min_amount)} — remove it or add more seats.
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <input
                        className="flex-1 min-w-0 bg-[var(--app-panel2)] border border-[var(--app-edge)] rounded-xl px-3.5 py-2.5 text-[13px] text-[var(--app-ink)] outline-none transition-colors duration-200 focus:border-[#e50914]"
                        placeholder="Enter code (e.g. WELCOME20)"
                        value={discountInput}
                        onChange={(e) => setDiscountInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); applyDiscount(); } }}
                      />
                      <button
                        className="shrink-0 bg-[var(--app-fill)] hover:bg-brand hover:text-white border border-[var(--app-edge2)] text-[var(--app-ink2)] px-4 py-2.5 rounded-xl text-[13px] font-[800] cursor-pointer transition-all duration-200"
                        onClick={applyDiscount}
                      >
                        Apply
                      </button>
                    </div>
                    {discountError && (
                      <p className="mt-2 text-[#e50914] text-[12px] font-[700]">{discountError}</p>
                    )}
                  </>
                )}
              </div>

              <div className="mx-6 border-t-2 border-dashed border-[var(--app-edge2)]" />

              <div className="px-6 py-5 flex flex-col gap-2.5 text-sm bg-[var(--app-panel2)]/60">
                <div className="flex justify-between gap-4">
                  <span className="text-[var(--app-mute)] font-[600]">
                    Tickets × {selectedSeats.length}
                  </span>
                  <b className="text-[var(--app-ink)]">{renderPrice(subtotal)}</b>
                </div>
                {promoActive && (
                  <div className="flex justify-between gap-4">
                    <span className="text-[var(--app-mute)] font-[600] inline-flex items-center gap-1.5">
                      <BadgePercent size={14} className="text-[#22c55e]" />
                      {activePromo.title} ({promoRate}% off)
                    </span>
                    <b className="text-[#22c55e]">-{renderPrice(discountAmount)}</b>
                  </div>
                )}
                {discountCodeAmount > 0 && (
                  <div className="flex justify-between gap-4">
                    <span className="text-[var(--app-mute)] font-[600] inline-flex items-center gap-1.5">
                      <BadgePercent size={14} className="text-[#22c55e]" />
                      {appliedDiscount.code} ({appliedDiscount.type === "fixed" ? "fixed" : `${appliedDiscount.value}%`} off)
                    </span>
                    <b className="text-[#22c55e]">-{renderPrice(discountCodeAmount)}</b>
                  </div>
                )}
                <div className="flex items-center justify-between gap-4 pt-3 mt-1 border-t border-[var(--app-edge)]">
                  <span className="font-[800] text-[var(--app-ink)]">Total</span>
                  <b className="text-[#e50914] text-[24px]">{renderPrice(totalAmount)}</b>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl p-6 flex flex-col">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/25 text-brand flex items-center justify-center shrink-0">
                  <CreditCard size={18} />
                </span>
                <div>
                  <h2 className="text-base font-[800] leading-none">Payment</h2>
                  <p className="text-[12px] text-[var(--app-mute)] font-[600] mt-1">
                    {isBakongBooking
                      ? "Secure checkout with Bakong"
                      : isCashBooking
                      ? "Reserved — pay at the cinema counter"
                      : "Pay online with Bakong or reserve and pay at the counter"}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col items-center justify-center flex-1 text-center gap-3 rounded-2xl border border-dashed border-[var(--app-edge2)] bg-[var(--app-panel2)]/50 px-5 py-8">
                {!booking && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-[440px]">
                      <button
                        type="button"
                        className={`flex flex-col items-start gap-2.5 border-2 cursor-pointer px-4 py-4 rounded-2xl transition-all duration-200 text-left ${
                          paymentMethod === "bakong"
                            ? "border-brand bg-brand/10"
                            : "border-[var(--app-edge2)] hover:border-brand/50"
                        }`}
                        onClick={() => setPaymentMethod("bakong")}
                      >
                        <span className="w-9 h-9 rounded-xl bg-brand/15 border border-brand/30 text-brand flex items-center justify-center">
                          <ScanLine size={17} />
                        </span>
                        <span>
                          <span className="block text-[13px] font-[800] text-[var(--app-ink)]">Pay online — Bakong</span>
                          <span className="block text-[11px] text-[var(--app-mute)] font-[600] mt-0.5 leading-relaxed">
                            Instant QR. Tickets issued automatically once paid.
                          </span>
                        </span>
                      </button>
                      <button
                        type="button"
                        className={`flex flex-col items-start gap-2.5 border-2 cursor-pointer px-4 py-4 rounded-2xl transition-all duration-200 text-left ${
                          paymentMethod === "cash"
                            ? "border-brand bg-brand/10"
                            : "border-[var(--app-edge2)] hover:border-brand/50"
                        }`}
                        onClick={() => setPaymentMethod("cash")}
                      >
                        <span className="w-9 h-9 rounded-xl bg-[rgba(234,179,8,0.15)] border border-[rgba(234,179,8,0.35)] text-[#eab308] flex items-center justify-center">
                          <CreditCard size={17} />
                        </span>
                        <span>
                          <span className="block text-[13px] font-[800] text-[var(--app-ink)]">Pay at counter — Cash</span>
                          <span className="block text-[11px] text-[var(--app-mute)] font-[600] mt-0.5 leading-relaxed">
                            Reserve your seats now and pay in person. Staff confirms your ticket.
                          </span>
                        </span>
                      </button>
                    </div>
                  </>
                )}

                {booking && isBakongBooking && paymentStatus === "pending" && (
                  <>
                    <span className="w-14 h-14 rounded-full bg-brand/10 border border-brand/25 text-brand flex items-center justify-center">
                      <ScanLine size={24} />
                    </span>
                    <div>
                      <div className="text-[15px] font-[800] text-[var(--app-ink)]">QR code ready</div>
                      <p className="text-[12px] text-[var(--app-mute)] font-[600] mt-1 max-w-[230px] leading-relaxed">
                        Reopen the payment window to scan with your Bakong app.
                      </p>
                    </div>
                  </>
                )}

                {booking && isCashBooking && (
                  <>
                    <span className="w-14 h-14 rounded-full bg-[rgba(234,179,8,0.15)] border border-[rgba(234,179,8,0.35)] text-[#eab308] flex items-center justify-center">
                      <CreditCard size={24} />
                    </span>
                    <div>
                      <div className="text-[15px] font-[800] text-[var(--app-ink)]">Seats reserved</div>
                      <p className="text-[12px] text-[var(--app-mute)] font-[600] mt-1 max-w-[280px] leading-relaxed">
                        Show your booking code{" "}
                        <b className="font-mono text-[var(--app-ink)]">{booking.booking_code || `#${booking.id}`}</b>{" "}
                        at the cinema counter and pay before{" "}
                        <b className="text-[var(--app-ink)]">
                          {booking.payment_expires_at
                            ? new Date(booking.payment_expires_at).toLocaleString()
                            : "showtime"}
                        </b>{" "}
                        to receive your tickets.
                      </p>
                    </div>
                  </>
                )}

                {!booking && selectedSeats.length === 0 && (
                  <p className="text-[#e50914] text-[13px] font-[700]">
                    Please select at least one seat first.
                  </p>
                )}
              </div>

              {paymentError && (
                <div className="mt-4 flex items-start gap-2.5 bg-[rgba(229,9,20,0.1)] border border-[rgba(229,9,20,0.3)] text-[#f87171] px-4 py-3 rounded-xl text-[13px] font-[600] leading-relaxed">
                  <TriangleAlert size={17} className="shrink-0 mt-0.5" />
                  <p className="m-0">{paymentError}</p>
                </div>
              )}

              <div className="mt-6 flex flex-col gap-2.5">
                {!booking && (
                  <button
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#e50914] text-white shadow-[0_6px_18px_rgba(229,9,20,0.35)] border-none cursor-pointer px-[22px] py-3.5 text-sm font-[800] rounded-xl transition-all duration-200 hover:bg-[#f40612] hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0"
                    disabled={selectedSeats.length === 0 || creating}
                    onClick={startPayment}
                  >
                    {creating ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />{" "}
                        {paymentMethod === "cash" ? "Reserving seats..." : "Creating payment code..."}
                      </>
                    ) : paymentMethod === "cash" ? (
                      <>
                        <CheckCircle2 size={16} /> Reserve &amp; Pay at Counter · {renderPrice(totalAmount)}
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={16} /> Confirm &amp; Pay · {renderPrice(totalAmount)}
                      </>
                    )}
                  </button>
                )}

                {booking && isBakongBooking && paymentStatus === "pending" && (
                  <button
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#e50914] text-white shadow-[0_6px_18px_rgba(229,9,20,0.35)] border-none cursor-pointer px-[22px] py-3.5 text-sm font-[800] rounded-xl transition-all duration-200 hover:bg-[#f40612] hover:-translate-y-0.5"
                    onClick={() => setShowPaymentModal(true)}
                  >
                    <ScanLine size={16} /> Show Bakong QR Code
                  </button>
                )}

                {booking && isCashBooking && (
                  <button
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#22c55e] text-white border-none cursor-pointer px-[22px] py-3.5 text-sm font-[800] rounded-xl transition-all duration-200 hover:bg-[#16a34a] hover:-translate-y-0.5"
                    onClick={() => navigate("/my-bookings")}
                  >
                    <CheckCircle2 size={16} /> View My Bookings
                  </button>
                )}

                {!isCashBooking && (
                  <button
                    className="w-full bg-transparent text-[var(--app-ink2)] border border-[var(--app-edge2)] cursor-pointer px-[18px] py-3 text-sm font-[700] rounded-xl transition-all duration-200 hover:bg-[var(--app-fill)]"
                    onClick={() => setStep(1)}
                  >
                    ← Back to Seats
                  </button>
                )}
              </div>

              <p className="mt-4 text-[11px] text-[var(--app-mute)] font-[600] text-center leading-relaxed">
                {isCashBooking
                  ? "A staff member confirms your payment at the counter and issues your tickets. Unpaid reservations are released after the deadline."
                  : "Your tickets will be issued automatically once payment is confirmed."}
              </p>
            </div>
          </div>
        )}


        {step === 3 && success && (
          <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl p-[26px]">
            <div className="text-center">
              <span className="inline-flex w-16 h-16 rounded-2xl bg-[rgba(34,197,94,0.14)] border border-[rgba(34,197,94,0.35)] text-[#22c55e] items-center justify-center mb-3">
                <CheckCircle2 size={34} />
              </span>
              <h2 className="text-[26px] font-[800]">Booking Confirmed!</h2>
              <p className="text-[var(--app-mute)] mt-2 text-sm">
                Payment received — {(success.tickets || []).length} ticket
                {(success.tickets || []).length !== 1 ? "s" : ""} issued. Show at the entrance.
              </p>
            </div>

            <div className="max-w-[460px] mx-auto mt-7 bg-[var(--app-panel2)] border border-[var(--app-edge2)] rounded-2xl overflow-hidden flex">
              <div className="flex-1 p-6 text-left">
                <div className="text-[20px] font-[800] mb-2">{movieName}</div>
                <div className="text-[var(--app-mute)] text-[13px] mb-1">
                  {success.showtime?.room?.cinema?.name ? `${success.showtime.room.cinema.name} · ` : ""}
                  {success.showtime?.room?.name || selectedShowtime?.room?.name || ""}
                  {success.showtime?.start_time && ` · ${new Date(success.showtime.start_time).toLocaleString()}`}
                </div>
                <div className="flex gap-2 mt-4 flex-wrap">
                  {(success.booking_seats || []).map((bs) => (
                    <span key={bs.id} className="bg-[rgba(229,9,20,0.14)] border border-[rgba(229,9,20,0.3)] text-[#e50914] px-3 py-1.5 rounded-lg font-[800] text-sm">
                      {bs.seat?.seat_number || bs.seat_id}
                    </span>
                  ))}
                </div>
              </div>
              <div className="border-l-2 border-dashed border-[var(--app-edge2)] flex flex-col justify-center items-center gap-3 px-5 min-w-[130px] bg-[var(--app-panel2)]">
                <div className="font-mono text-base font-[800] text-[#22c55e] tracking-wide">{success.booking_code || `#${success.id}`}</div>
                <div className="text-[22px] font-[800] text-[var(--app-ink)]">{renderPrice(success.total_amount)}</div>
              </div>
            </div>

            {(success.tickets || []).length > 0 && (
              <>
                <h3 className="mt-8 text-center text-[15px] font-[800] text-[var(--app-ink)]">
                  Your tickets ({success.tickets.length}) — scan at the entrance
                </h3>
                <div className="max-w-[720px] mx-auto mt-4 flex flex-col gap-6">
                  {success.tickets.map((tk) => {
                    const bs =
                      (success.booking_seats || []).find(
                        (b) => b.id === tk.booking_seat_id
                      ) || null;
                    return (
                      <div key={tk.id} className="flex flex-col items-center gap-3">
                        <div ref={(el) => { ticketRefs.current[tk.id] = el; }}>
                          <TicketCard
                            movie={movieName}
                            cinema={success.showtime?.room?.cinema?.name}
                            room={success.showtime?.room?.name}
                            startTime={success.showtime?.start_time}
                            bookingCode={success.booking_code}
                            ticketCode={tk.ticket_code}
                            seats={bs ? [bs] : []}
                            amount={Number(success.total_amount || 0) / (success.tickets.length || 1)}
                            currency={displayCurrency}
                          />
                        </div>
                        <button
                          className="inline-flex items-center gap-2 border-none cursor-pointer py-2.5 px-5 text-sm font-[700] rounded-xl transition-all duration-200 bg-[rgba(229,9,20,0.12)] text-[#e50914] hover:bg-[rgba(229,9,20,0.2)]"
                          onClick={() => downloadPdf(ticketRefs.current[tk.id], `${tk.ticket_code || "ticket"}.pdf`)}
                        >
                          <Download size={16} /> Download PDF
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            <div className="flex gap-3 mt-6 justify-center col-span-full max-md:col-span-1">
              <button className="bg-transparent text-[var(--app-ink2)] border border-[var(--app-edge2)] cursor-pointer px-[22px] py-3 text-sm font-[700] rounded-xl transition-all duration-200 hover:bg-[var(--app-fill)] hover:border-[var(--app-edge2)]" onClick={() => navigate("/")}>Back to Home</button>
              <button
                className="bg-[rgba(229,9,20,0.12)] text-[#e50914] border border-[rgba(229,9,20,0.3)] cursor-pointer px-[22px] py-3 text-sm font-[700] rounded-xl transition-all duration-200 hover:bg-[rgba(229,9,20,0.2)]"
                onClick={() => navigate("/my-bookings")}
              >
                View My Bookings
              </button>
              <button
                className="bg-[rgba(229,9,20,0.12)] text-[#e50914] border border-[rgba(229,9,20,0.3)] cursor-pointer px-[22px] py-3 text-sm font-[700] rounded-xl transition-all duration-200 hover:bg-[rgba(229,9,20,0.2)]"
                onClick={() => {
                  setBooking(null);
                  setPayment(null);
                  setSuccess(null);
                  setSelectedSeats([]);
                  setPaymentStatus("pending");
                  setStep(0);
                }}
              >
                Book Another
              </button>
            </div>
          </div>
        )}
      </main>

      {showPaymentModal && payment && (
        <PaymentModal
          open={showPaymentModal}
          payment={payment}
          status={paymentStatus}
          error={paymentError}
          checking={checking}
          refreshing={refreshing}
          bookingCode={booking?.booking_code}
          onCheck={checkPayment}
          onRefresh={refreshPayment}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  );
}
