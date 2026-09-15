import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, Link, useSearchParams } from "react-router-dom";
import { DoorOpen, Loader2, Ticket, TriangleAlert, ScanLine, MapPin, Building2, ChevronDown, BadgePercent } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const steps = ["Showtime", "Seats", "Pay", "Done"];

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
  const [expired, setExpired] = useState(false);
  const [activePromo, setActivePromo] = useState(null);
  const pollRef = useRef(null);

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

  const clearPoll = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

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

  const roomId = selectedShowtime?.room?.id ?? null;

  useEffect(() => {
    if (!roomId) {
      setSeats([]);
      setSelectedSeats([]);
      return;
    }
    let cancelled = false;
    setLoadingSeats(true);
    api
      .get("/seats")
      .then((res) => {
        if (cancelled) return;
        const all = res.data || [];
        setSeats(all.filter((s) => s.cinema_room_id === roomId));
      })
      .catch(() => {
        if (!cancelled) setErrorMsg("Failed to load seats for this room.");
      })
      .finally(() => {
        if (!cancelled) setLoadingSeats(false);
      });
    return () => {
      cancelled = true;
    };
  }, [roomId]);

  const seatsByRow = useMemo(() => {
    const map = {};
    seats.forEach((s) => {
      const row = (s.seat_number || "").replace(/[0-9]/g, "") || "?";
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

  const discountAmount = useMemo(() => {
    if (!promoRate) return 0;
    return Math.round(subtotal * (promoRate / 100) * 100) / 100;
  }, [promoRate, subtotal]);

  const totalAmount = useMemo(() => Math.round((subtotal - discountAmount) * 100) / 100, [subtotal, discountAmount]);

  const currency = selectedShowtime ? currencySymbol("USD") : "$";
  const displayCurrency = selectedShowtime?.payment_currency || "USD";

  const toggleSeat = (seatId) => {
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
        user_id: user.id,
        showtime_id: selectedShowtimeId,
        seat_ids: selectedSeats,
        ...(activePromo && promoRate > 0 ? { promotion_id: Number(promoId) } : {}),
      });
      const data = res.data;
      const pay = data.payment;

      if (!pay || !pay.qr) {
        setPaymentError("Could not generate Bakong payment code.");
        setStep(2);
        return;
      }

      setBooking(data);
      setPayment(pay);
      setPaymentStatus("pending");
      setStep(2);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.[0] ||
        "Could not create booking. Check your Bakong account configuration.";
      setErrorMsg(msg);
      setPaymentError(msg);
      setStep(2);
    } finally {
      setCreating(false);
    }
  };

  const checkPayment = async () => {
    if (!booking?.id) return;
    try {
      const res = await api.get(`/bookings/${booking.id}/payment`);
      const status = res.data.payment_status;
      setPaymentStatus(status);
      if (status === "confirmed") {
        clearPoll();
        setSuccess(res.data.booking || booking);
        setStep(3);
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Could not check payment.";
      setPaymentError(msg);
    }
  };

  useEffect(() => {
    if (step === 2 && paymentStatus === "pending" && booking?.id) {
      clearPoll();
      pollRef.current = setInterval(checkPayment, 3000);
      return () => clearPoll();
    }
  }, [step, paymentStatus, booking?.id]);

  useEffect(() => {
    if (payment?.expires_at && paymentStatus === "pending") {
      const expiry = new Date(payment.expires_at).getTime();
      if (expiry - Date.now() <= 0) setExpired(true);
      const t = setTimeout(() => setExpired(true), Math.max(expiry - Date.now(), 0));
      return () => clearTimeout(t);
    }
  }, [payment, paymentStatus]);

  const maxSteps = steps.length - 1;

  const goNext = () => {
    if (step === 0 && !selectedShowtimeId) return;
    if (step === 1 && selectedSeats.length === 0) return;
    setStep((s) => Math.min(s + 1, maxSteps));
  };

  const renderPrice = (amount) => `${currencySymbol(displayCurrency)}${Number(amount || 0).toFixed(2)}`;

  return (
    <div className="bg-[var(--app-page)] text-[var(--app-ink)] min-h-screen flex flex-col font-['Mulish','Kantumruy_Pro',-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif]">
      <header className="sticky top-0 z-[100] bg-[var(--app-header)] backdrop-blur-[12px] border-b border-[var(--app-edge)] flex items-center justify-between px-7 h-[68px] gap-4 max-md:px-4">
        <Link to="/" className="flex items-center gap-2.5 no-underline shrink-0">
          <span className="text-[26px]"></span>
          <span className="text-lg font-[800] tracking-[2px] text-[var(--app-ink)] group/b">KHMER <b className="text-[#e50914]">CINEMA</b></span>
        </Link>
        <nav className="flex items-center gap-1.5 flex-1 justify-center max-md:hidden">
          {steps.map((s, i) => (
            <div key={s} className={`flex items-center gap-2 px-3 py-1.5 rounded-[20px] text-[13px] font-[700] transition-all duration-200 ${i === step ? "text-[var(--app-ink)]" : ""} ${i < step ? "text-[#22c55e]" : ""} ${i >= step ? "text-[var(--app-mute)]" : ""}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${i === step ? "bg-[#e50914] text-white shadow-[0_0_0_4px_rgba(229,9,20,0.2)]" : ""} ${i < step ? "bg-[rgba(34,197,94,0.2)] text-[#22c55e]" : ""} ${i >= step && i > step ? "bg-[var(--app-panel2)]" : ""}`}>{i < step ? "✓" : i + 1}</span>
              <span>{s}</span>
            </div>
          ))}
        </nav>
        <button className="bg-transparent border border-[var(--app-edge2)] text-[var(--app-ink2)] px-3.5 py-2 text-[13px] font-[700] cursor-pointer shrink-0 transition-all duration-200 rounded-[10px] hover:text-[var(--app-ink)] hover:border-[var(--app-edge2)]" onClick={() => navigate(-1)}>← Back</button>
      </header>

      <main className="flex-1 max-w-[1020px] w-full mx-auto p-7 flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3.5">
            <span className="bg-[rgba(229,9,20,0.14)] text-[#e50914] border border-[rgba(229,9,20,0.3)] px-3 py-2 text-sm font-[800] rounded-[10px] shrink-0">Movies</span>
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

        {activePromo && promoRate > 0 && (
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
                        const isOccupied = seat.status === "occupied";
                        return (
                          <button
                            key={seat.id}
                            className={`w-[30px] h-[26px] rounded-md border text-[10px] flex items-center justify-center transition-all duration-[150ms] ${isOccupied ? "bg-[var(--app-edge2)] border-[var(--app-edge2)] cursor-not-allowed text-[var(--app-ink2)] hover:bg-[var(--app-edge2)] hover:border-[var(--app-edge2)]" : isSel ? "bg-[#e50914] border-[#e50914] text-white shadow-[0_0_8px_rgba(229,9,20,0.5)]" : seat.seat_type === "vip" ? "border-[#d4a017] bg-[#2a2410] text-[#666] cursor-pointer hover:border-[#d4a017]" : seat.seat_type === "couple" ? "border-[#a855f7] bg-[#2a1238] text-[#666] cursor-pointer hover:border-[#a855f7]" : "border-[var(--app-edge2)] bg-[var(--app-panel2)] text-[var(--app-mute)] cursor-pointer hover:border-[#e50914] hover:bg-[var(--app-edge)]"}`}
                            onClick={() => toggleSeat(seat.id)}
                            title={seat.seat_number}
                          >
                            {seat.seat_number.replace(row, "")}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
                <div className="flex gap-5 justify-center mt-[18px] flex-wrap">
                  <span className="flex items-center gap-2 text-[13px] text-[var(--app-mute)] font-[600]"><i className="w-4 h-4 rounded-[5px] inline-block bg-[var(--app-panel2)] border border-[var(--app-edge2)]" /> Available</span>
                  <span className="flex items-center gap-2 text-[13px] text-[var(--app-mute)] font-[600]"><i className="w-4 h-4 rounded-[5px] inline-block bg-[#e50914]" /> Selected</span>
                  <span className="flex items-center gap-2 text-[13px] text-[var(--app-mute)] font-[600]"><i className="w-4 h-4 rounded-[5px] inline-block bg-[#2a2410] border border-[#d4a017]" /> VIP</span>
                  <span className="flex items-center gap-2 text-[13px] text-[var(--app-mute)] font-[600]"><i className="w-4 h-4 rounded-[5px] inline-block bg-[#2a1238] border border-[#a855f7]" /> Couple</span>
                </div>
              </>
            )}

            {errorMsg && <p className="text-[#e50914] text-[13px] font-[700] mt-4"><TriangleAlert size={16} /> {errorMsg}</p>}
          </div>
        )}

        {step === 2 && (
          <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl p-[26px] grid grid-cols-2 gap-7 max-md:grid-cols-1">
            <div>
              <h2 className="text-lg font-[800] mb-[18px]">3. Confirm</h2>
              <div className="flex flex-col">
                <div className="flex justify-between py-3 border-b border-[var(--app-edge)] text-sm gap-4"><span className="text-[var(--app-mute)]">Movie</span><b className="text-[var(--app-ink)] text-right">{movieName}</b></div>
                <div className="flex justify-between py-3 border-b border-[var(--app-edge)] text-sm gap-4">
                  <span className="text-[var(--app-mute)]">Showtime</span>
                  <b className="text-[var(--app-ink)] text-right">{selectedShowtime ? new Date(selectedShowtime.start_time).toLocaleString() : "-"}</b>
                </div>
                <div className="flex justify-between py-3 border-b border-[var(--app-edge)] text-sm gap-4"><span className="text-[var(--app-mute)]">Room</span><b className="text-[var(--app-ink)] text-right">{selectedShowtime?.room?.name || "-"}</b></div>
                <div className="flex justify-between py-3 border-b border-[var(--app-edge)] text-sm gap-4">
                  <span className="text-[var(--app-mute)]">Seats</span>
                  <b className="text-[var(--app-ink)] text-right">
                    {selectedShowtime && seats.filter((s) => selectedSeats.includes(s.id))
                      .map((s) => formatSeat(s.seat_number)).join(", ")}
                  </b>
                </div>
                <div className="flex justify-between py-3 border-b border-[var(--app-edge)] text-sm gap-4"><span className="text-[var(--app-mute)]">Tickets</span><b className="text-[var(--app-ink)] text-right">{selectedSeats.length}</b></div>
                {activePromo && promoRate > 0 && (
                  <div className="flex justify-between py-3 border-b border-[var(--app-edge)] text-sm gap-4">
                    <span className="text-[var(--app-mute)] flex items-center gap-1.5">
                      <Ticket size={14} className="text-[#22c55e]" />
                      {activePromo.title}
                      <span className="text-[#22c55e] font-[800]">({promoRate}% off)</span>
                    </span>
                    <b className="text-[#22c55e] text-right">-{renderPrice(discountAmount)}</b>
                  </div>
                )}
                <div className="flex justify-between pt-4 text-sm gap-4"><span className="font-[700] text-[var(--app-ink)]">Total</span><b className="text-[#e50914] text-[22px] text-right">{renderPrice(totalAmount)}</b></div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-[800] mb-[18px]">Pay with Bakong</h2>

              {selectedSeats.length > 0 && creating && (
                <div className="flex items-center gap-2.5 text-[var(--app-mute)] text-sm font-[700] py-[18px]"><Loader2 className="animate-spin" size={18} /> Creating booking & payment code...</div>
              )}

              {booking && payment && (
                <div className="flex flex-col gap-3.5 mt-1.5">
                  {paymentStatus === "pending" && !expired && (
                    <div className="bg-white rounded-[14px] p-5 flex flex-col items-center gap-3.5 max-[600px]:p-3.5">
                      <div className="flex items-center gap-2 text-[#111] text-[13px] font-[800]"><ScanLine size={16} /> Scan with Bakong App</div>
                      <QRCodeSVG value={payment.qr} size={220} level="M" />
                      <div className="text-[#111] text-[20px] font-[800] flex flex-col items-center gap-0.5">
                        {renderPrice(payment.amount || totalAmount)}
                        <span className="text-[#666] text-xs font-[600]">Merchant: Khmer Cinema</span>
                      </div>
                    </div>
                  )}

                  {expired && (
                    <div className="flex items-start gap-2.5 bg-[rgba(229,9,20,0.1)] border border-[rgba(229,9,20,0.3)] text-[#f87171] px-3.5 py-3 rounded-[10px] text-[13px] font-[600] leading-relaxed">
                      <TriangleAlert size={18} />
                      <p className="m-0">This QR code expired. Please go back and generate a new one.</p>
                    </div>
                  )}

                  {paymentError && (
                    <div className="flex items-start gap-2.5 bg-[rgba(229,9,20,0.1)] border border-[rgba(229,9,20,0.3)] text-[#f87171] px-3.5 py-3 rounded-[10px] text-[13px] font-[600] leading-relaxed">
                      <TriangleAlert size={18} />
                      <p className="m-0">{paymentError}</p>
                    </div>
                  )}

                  {paymentStatus === "pending" && !expired && (
                    <div className="flex items-start gap-2.5 bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.25)] text-[#6ee7a8] px-3.5 py-3 rounded-[10px] text-[13px] font-[600] leading-relaxed">
                      <Loader2 className="animate-spin" size={16} />
                      <p className="m-0">Waiting for payment confirmation... Open the Bakong app and scan the QR code.</p>
                    </div>
                  )}
                </div>
              )}

              {!booking && selectedSeats.length === 0 && (
                <p className="text-[#e50914] text-[13px] font-[700] mt-4">Please select at least one seat first.</p>
              )}
          </div>
          </div>
        )}

        {step === 3 && success && (
          <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl p-[26px] text-center py-10">
            <div className="text-[64px] mb-2.5"><Ticket size={40} /></div>
            <h2 className="text-[26px] font-[800]">Booking Confirmed!</h2>
            <p className="text-[var(--app-mute)] mt-2 text-sm">Payment received. Show these tickets at the entrance.</p>

            <div className="max-w-[420px] mx-auto mt-7 bg-[var(--app-panel2)] border border-[var(--app-edge2)] rounded-2xl overflow-hidden flex">
              <div className="flex-1 p-6 text-left">
                <div className="text-[20px] font-[800] mb-2">{movieName}</div>
                <div className="text-[var(--app-mute)] text-[13px] mb-1">
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
              <div className="border-l-2 border-dashed border-[var(--app-edge2)] flex flex-col justify-center items-center gap-3 px-5 min-w-[120px] bg-[var(--app-panel2)]">
                <div className="font-mono text-base font-[800] text-[#22c55e] tracking-wide">{success.booking_code || `#${success.id}`}</div>
                <div className="text-[22px] font-[800] text-[var(--app-ink)]">{renderPrice(success.total_amount)}</div>
              </div>
            </div>

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
                  setExpired(false);
                  setStep(0);
                }}
              >
                Book Another
              </button>
            </div>
          </div>
        )}
      </main>

      {step >= 0 && step <= 2 && (
        <div className="sticky bottom-0 z-[90] bg-[var(--app-bar)] backdrop-blur-[12px] border-t border-[var(--app-edge)] px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[10px] uppercase tracking-[2px] text-[var(--app-mute)] font-[700]">
              Step {step + 1} of 3 · {steps[step]}
            </span>
            {step === 0 ? (
              <span className="text-sm font-[800] truncate">
                {selectedShowtime
                  ? `${selectedShowtime.room?.name || "Room"} · ${new Date(selectedShowtime.start_time).toLocaleDateString()} ${new Date(selectedShowtime.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                  : "Pick a showtime to continue"}
              </span>
            ) : (
              <span className="text-sm font-[800] truncate">
                {selectedSeats.length} ticket{selectedSeats.length !== 1 ? "s" : ""} · {movieName}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {step === 2 && booking ? (
              <>
                <span className="text-[19px] font-[800] text-[#e50914]">{renderPrice(payment?.amount || totalAmount)}</span>
                <button
                  className="bg-[rgba(229,9,20,0.12)] text-[#e50914] border border-[rgba(229,9,20,0.35)] cursor-pointer px-[22px] py-3 text-sm font-[700] rounded-xl transition-all duration-200 hover:bg-[rgba(229,9,20,0.2)]"
                  onClick={checkPayment}
                >
                  Check Payment
                </button>
              </>
            ) : (
              <>
                {step > 0 && (
                  <button
                    className="bg-transparent text-[var(--app-ink2)] border border-[var(--app-edge2)] cursor-pointer px-[18px] py-3 text-sm font-[700] rounded-xl transition-all duration-200 hover:bg-[var(--app-fill)] hover:border-[var(--app-edge2)]"
                    onClick={() => setStep(step - 1)}
                  >
                    ← Back
                  </button>
                )}
                <span className="text-[19px] font-[800] text-[#e50914] hidden sm:block">
                  {step === 0 ? (selectedShowtime ? renderPrice(selectedShowtime.price) : "$0.00") : renderPrice(totalAmount)}
                </span>
                <button
                  className="bg-[#e50914] text-white shadow-[0_4px_14px_rgba(229,9,20,0.35)] border-none cursor-pointer px-[22px] py-3 text-sm font-[700] rounded-xl transition-all duration-200 hover:bg-[#f40612] hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0"
                  disabled={step === 0 ? !selectedShowtimeId : step === 1 ? selectedSeats.length === 0 : creating}
                  onClick={step === 0 ? () => setStep(1) : step === 1 ? () => setStep(2) : startPayment}
                >
                  {step === 0 ? "Select Seats →" : step === 1 ? "Continue to Pay →" : creating ? "Creating..." : `Confirm & Pay · ${renderPrice(totalAmount)}`}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
