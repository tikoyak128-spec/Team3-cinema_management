import { useEffect, useMemo, useRef, useState } from "react";
import {
  Armchair,
  Banknote,
  Building2,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Clapperboard,
  DoorOpen,
  Loader2,
  MapPin,
  ScanLine,
  ShoppingCart,
  Ticket,
  TriangleAlert,
  User,
  Wallet,
  X,
} from "lucide-react";
import api from "../api/client";
import { usePrefs } from "../context/PrefsContext";
import PaymentModal from "../components/PaymentModal";

const segColors = (t) =>
  t === "vip"
    ? "bg-[rgba(234,179,8,0.14)] border border-[rgba(234,179,8,0.5)] text-[#eab308]"
    : t === "couple"
    ? "bg-[rgba(192,132,252,0.14)] border border-[rgba(192,132,252,0.5)] text-[#c084fc]"
    : "bg-[var(--app-panel2)] border border-[var(--app-edge2)] text-[var(--app-ink2)]";

const fmtDate = (s) => {
  if (!s) return "—";
  const d = new Date(s.replace(" ", "T"));
  return isNaN(d) ? s : d.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
};

const fmtDuration = (m) => {
  if (!m) return "";
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h}h ${mm}m`;
};

export default function SellTicket() {
  const { t } = usePrefs();
  const steps = [t("staff.place"), t("staff.movie"), t("staff.room"), t("staff.showtime"), t("staff.seats")];
  const [cinemas, setCinemas] = useState([]);
  const [movies, setMovies] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [loadingCinemas, setLoadingCinemas] = useState(true);
  const [loadingShowtimes, setLoadingShowtimes] = useState(true);
  const [error, setError] = useState("");
  const [cinemaId, setCinemaId] = useState("");
  const [movieId, setMovieId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [showtimeId, setShowtimeId] = useState("");
  const [seatsData, setSeatsData] = useState(null);
  const [seatsLoading, setSeatsLoading] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState(new Set());
  const [form, setForm] = useState({ customer_name: "", customer_email: "", customer_phone: "" });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [pendingBooking, setPendingBooking] = useState(null);
  const [pendingPayment, setPendingPayment] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [checking, setChecking] = useState(false);
  const pollRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    api.get("/cinemas")
      .then(({ data }) => { if (!cancelled) setCinemas(data); })
      .catch((err) => { if (!cancelled) setError(err?.response?.data?.message || "Failed to load cinemas."); })
      .finally(() => { if (!cancelled) setLoadingCinemas(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    api.get("/movies")
      .then(({ data }) => { if (!cancelled) setMovies(data); })
      .catch((err) => { if (!cancelled) setError(err?.response?.data?.message || "Failed to load movies."); })
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    api.get("/staff/showtimes")
      .then(({ data }) => { if (!cancelled) setShowtimes(data); })
      .catch((err) => { if (!cancelled) setError(err?.response?.data?.message || "Failed to load showtimes."); })
      .finally(() => { if (!cancelled) setLoadingShowtimes(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!pendingBooking?.id) return;
    pollRef.current = setInterval(() => {
      checkPendingPayment();
    }, 15000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingBooking?.id]);

  const cityShowtimes = useMemo(
    () => showtimes.filter((s) => s.room?.cinema?.id === Number(cinemaId)),
    [showtimes, cinemaId]
  );

  const moviesForCinema = useMemo(() => {
    const seen = new Set();
    cityShowtimes.forEach((s) => seen.add(s.movie_id));
    return movies.filter((m) => seen.has(m.id));
  }, [movies, cityShowtimes]);

  const movieShowtimes = useMemo(
    () => cityShowtimes
      .filter((s) => s.movie_id === Number(movieId))
      .sort((a, b) => (a.start_time || "").localeCompare(b.start_time || "")),
    [cityShowtimes, movieId]
  );

  const roomsForMovie = useMemo(() => {
    const map = new Map();
    movieShowtimes.forEach((s) => {
      const room = s.room;
      if (!room) return;
      const key = room.id;
      if (!map.has(key)) map.set(key, { ...room, showtimeCount: 0 });
      map.get(key).showtimeCount += 1;
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [movieShowtimes]);

  const showtimesForRoom = useMemo(
    () => movieShowtimes.filter((s) => s.room?.id === Number(roomId)),
    [movieShowtimes, roomId]
  );

  const selectedShowtime = useMemo(
    () => showtimes.find((s) => s.id === Number(showtimeId)) || null,
    [showtimes, showtimeId]
  );

  useEffect(() => {
    if (!showtimeId) { setSeatsData(null); setSelectedSeats(new Set()); return; }
    let cancelled = false;
    setSeatsLoading(true);
    setError("");
    api.get(`/staff/showtimes/${showtimeId}/seats`)
      .then(({ data }) => { if (!cancelled) { setSeatsData(data); setSelectedSeats(new Set()); } })
      .catch((err) => { if (!cancelled) setError(err?.response?.data?.message || "Failed to load seats."); })
      .finally(() => { if (!cancelled) setSeatsLoading(false); });
    return () => { cancelled = true; };
  }, [showtimeId]);

  const rows = useMemo(() => {
    if (!seatsData) return [];
    const map = {};
    for (const s of seatsData.seats) {
      const r = s.row || "Main";
      if (!map[r]) map[r] = [];
      map[r].push(s);
    }
    return Object.entries(map).map(([row, seats]) => ({ row, seats }));
  }, [seatsData]);

  const toggleSeat = (id) => {
    setSelectedSeats((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectCinema = (id) => {
    setCinemaId(id);
    setMovieId("");
    setRoomId("");
    setShowtimeId("");
    setSeatsData(null);
    setSelectedSeats(new Set());
  };

  const selectMovie = (id) => {
    setMovieId(id);
    setRoomId("");
    setShowtimeId("");
    setSeatsData(null);
    setSelectedSeats(new Set());
  };

  const selectRoom = (id) => {
    setRoomId(id);
    setShowtimeId("");
    setSeatsData(null);
    setSelectedSeats(new Set());
  };

  const selectShowtime = (id) => {
    setShowtimeId(id);
    setSelectedSeats(new Set());
  };

  const total = (Number(selectedShowtime?.price) || 0) * selectedSeats.size;
  const step = cinemaId ? (movieId ? (roomId ? (showtimeId ? 4 : 3) : 2) : 1) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const { data } = await api.post("/staff/bookings", {
        showtime_id: Number(showtimeId),
        seat_ids: [...selectedSeats],
        customer_name: form.customer_name || undefined,
        customer_email: form.customer_email || undefined,
        customer_phone: form.customer_phone || undefined,
        payment_method: paymentMethod,
      });
      if (data.payment?.qr) {
        setPendingBooking(data);
        setPendingPayment(data.payment);
        setPaymentStatus("pending");
        setPaymentError("");
        setShowPaymentModal(true);
        return;
      }
      setResult(data);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to sell ticket.";
      const ids = err?.response?.data?.booked_seat_ids;
      if (Array.isArray(ids) && ids.length) setError(`${msg} (seats: ${ids.join(", ")})`);
      else setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const checkPendingPayment = async () => {
    if (!pendingBooking?.id) return;
    setChecking(true);
    try {
      const { data } = await api.get(`/bookings/${pendingBooking.id}/payment`);
      setPaymentStatus(data.payment_status);
      if (data.payment_status === "confirmed") {
        if (pollRef.current) clearInterval(pollRef.current);
        setPendingBooking(null);
        setPendingPayment(null);
        setPaymentError("");
        setShowPaymentModal(false);
        setResult(data.booking);
        return;
      }
      if (data.verification_error) {
        if (pollRef.current) clearInterval(pollRef.current);
        setPaymentError(data.message || "Could not verify payment automatically.");
      }
    } catch (err) {
      setPaymentError(err?.response?.data?.message || "Could not check payment.");
    } finally {
      setChecking(false);
    }
  };

  const confirmPendingPayment = async () => {
    if (!pendingBooking?.id) return;
    setSubmitting(true);
    setPaymentError("");
    try {
      const { data } = await api.post(`/staff/bookings/${pendingBooking.id}/confirm-payment`);
      if (data.payment_status === "confirmed") {
        if (pollRef.current) clearInterval(pollRef.current);
        setPendingBooking(null);
        setPendingPayment(null);
        setPaymentError("");
        setShowPaymentModal(false);
        setResult(data.booking);
      }
    } catch (err) {
      setPaymentError(err?.response?.data?.message || "Could not confirm payment.");
    } finally {
      setSubmitting(false);
    }
  };

  const cancelPending = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    setPendingBooking(null);
    setPendingPayment(null);
    setPaymentStatus("");
    setPaymentError("");
    setShowPaymentModal(false);
  };

  const reset = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    setResult(null);
    setPendingBooking(null);
    setPendingPayment(null);
    setPaymentStatus("");
    setPaymentError("");
    setShowPaymentModal(false);
    setCinemaId("");
    setMovieId("");
    setRoomId("");
    setShowtimeId("");
    setSeatsData(null);
    setSelectedSeats(new Set());
    setForm({ customer_name: "", customer_email: "", customer_phone: "" });
  };

  const seatBtn = (s) => {
    const selected = selectedSeats.has(s.id);
    let cls = "h-[38px] min-w-[38px] px-1.5 rounded-[9px] text-[12px] font-bold flex items-center justify-center transition-all duration-150 select-none cursor-pointer ";
    if (s.occupied) cls += "bg-[rgba(229,9,20,0.15)] border border-[rgba(229,9,20,0.45)] text-[#e50914] opacity-70 cursor-not-allowed";
    else if (selected) cls += "bg-[#e50914] border border-[#e50914] text-white shadow-[0_3px_10px_rgba(229,9,20,0.4)] scale-105";
    else cls += ` ${segColors(s.seat_type)} hover:border-brand hover:text-brand hover:-translate-y-0.5`;
    return (
      <button type="button" key={s.id} disabled={s.occupied} onClick={() => toggleSeat(s.id)} className={cls} title={`${s.seat_number}${s.occupied ? ` (${t("staff.seatLegendOccupied")})` : ""}`}>
        {s.seat_number}
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-6 text-[var(--app-ink)]">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-[26px] font-extrabold">{t("staff.sellTicket")}</h1>
          <p className="text-sm text-[var(--app-mute)] mt-1">{t("staff.sellSubtitle")}</p>
        </div>
      </div>

      {error && (
        <div className="bg-[rgba(229,9,20,0.12)] border border-[rgba(229,9,20,0.4)] text-[#ff6b6b] text-[13px] p-[10px_14px] rounded-[10px] flex justify-between items-center">
          {error}
          <button onClick={() => setError("")} className="bg-transparent border-none text-[#ff6b6b] text-[18px] cursor-pointer leading-none">×</button>
        </div>
      )}

      {result ? (
        <div className="bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.3)] rounded-2xl p-6">
          <div className="[text-align:center] py-[26px]">
            <div className="text-[54px] mb-[10px] text-[#22c55e]"><CheckCircle2 size={54} /></div>
            <div className="text-[22px] font-extrabold text-[#22c55e]">{t("staff.saleComplete")}</div>
            <p className="text-[var(--app-mute)] mt-[8px]">
              {t("staff.booking")} <b className="text-[var(--app-ink)]">{result.booking_code}</b> · {result.showtime?.movie?.title}
            </p>
          </div>

          <div className="bg-[var(--app-panel2)] border border-[var(--app-edge)] rounded-[14px] p-[22px]">
            <div className="flex justify-between items-center py-3 border-b border-[var(--app-edge)] last:border-b-0"><span className="text-[13px] text-[var(--app-mute)] font-semibold">{t("staff.movie")}</span><span className="text-[15px] font-bold text-right">{result.showtime?.movie?.title}</span></div>
            <div className="flex justify-between items-center py-3 border-b border-[var(--app-edge)] last:border-b-0"><span className="text-[13px] text-[var(--app-mute)] font-semibold">{t("staff.cinema")}</span><span className="text-[15px] font-bold text-right">{result.showtime?.room?.cinema?.name} · {result.showtime?.room?.name}</span></div>
            <div className="flex justify-between items-center py-3 border-b border-[var(--app-edge)] last:border-b-0"><span className="text-[13px] text-[var(--app-mute)] font-semibold">{t("staff.showtime")}</span><span className="text-[15px] font-bold text-right">{fmtDate(result.showtime?.start_time)}</span></div>
            <div className="flex justify-between items-center py-3 border-b border-[var(--app-edge)] last:border-b-0"><span className="text-[13px] text-[var(--app-mute)] font-semibold">{t("staff.seats")}</span><span className="text-[15px] font-bold text-right">{result.booking_seats?.map((b) => b.seat?.seat_number).join(", ")}</span></div>
            <div className="flex justify-between items-center py-3 border-b border-[var(--app-edge)] last:border-b-0"><span className="text-[13px] text-[var(--app-mute)] font-semibold">{t("staff.total")}</span><span className="text-[18px] font-bold text-[#e50914] text-right">${Number(result.total_amount).toFixed(2)}</span></div>
            <div className="flex justify-between items-center py-3 last:border-b-0"><span className="text-[13px] text-[var(--app-mute)] font-semibold">{t("staff.tickets")}</span><span className="text-right flex-wrap justify-end flex gap-2">{result.tickets?.map((tk) => <span key={tk.id} className="inline-flex items-center gap-1 bg-[var(--app-panel2)] border border-[var(--app-edge2)] text-[var(--app-ink2)] py-1 px-2.5 rounded-[8px] text-[12px] font-mono font-semibold"><Ticket size={12} /> {tk.ticket_code}</span>)}</span></div>
          </div>

          <div className="mt-[18px] flex justify-center">
            <button onClick={reset} className="inline-flex items-center gap-2 border-none cursor-pointer py-[11px] px-5 text-sm font-bold rounded-xl transition-all duration-200 bg-[#e50914] text-white shadow-[0_4px_14px_rgba(229,9,20,0.35)] hover:bg-[#f40612] hover:-translate-y-0.5">{t("staff.sellAnother")}</button>
          </div>
        </div>
      ) : pendingBooking && pendingPayment ? (
        <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl p-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="w-12 h-12 rounded-2xl bg-brand/10 border border-brand/25 text-brand flex items-center justify-center shrink-0">
                <ScanLine size={22} />
              </span>
              <div>
                <h2 className="text-lg font-extrabold">{t("staff.payWithBakong")}</h2>
                <p className="text-[13px] text-[var(--app-mute)] mt-0.5">
                  {t("staff.booking")} <b className="text-[var(--app-ink)]">{pendingBooking.booking_code}</b> · <b className="text-[#e50914]">${Number(pendingPayment.amount).toFixed(2)}</b>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <button onClick={() => setShowPaymentModal(true)} className="inline-flex items-center gap-2 border-none cursor-pointer py-[11px] px-5 text-sm font-bold rounded-xl transition-all duration-200 bg-[#e50914] text-white shadow-[0_4px_14px_rgba(229,9,20,0.35)] hover:bg-[#f40612] hover:-translate-y-0.5">
                <ScanLine size={16} /> {t("staff.scanWithBakong")}
              </button>
              <button onClick={cancelPending} className="inline-flex items-center gap-2 cursor-pointer py-[11px] px-5 text-sm font-bold rounded-xl transition-all duration-200 bg-[var(--app-fill)] border border-[var(--app-edge2)] text-[var(--app-mute)] hover:border-brand/40 hover:text-brand">
                <X size={16} /> {t("staff.cancelPayment")}
              </button>
            </div>
          </div>

          {paymentStatus === "pending" && (
            <div className="mt-4 flex items-center gap-2.5 bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.25)] text-[#6ee7a8] px-3.5 py-3 rounded-[10px] text-[13px] font-[600] leading-relaxed">
              <Loader2 className="animate-spin shrink-0" size={16} />
              <span>{t("staff.waitingPayment")}</span>
            </div>
          )}

          {paymentError && (
            <div className="mt-4 flex items-start gap-2.5 bg-[rgba(229,9,20,0.1)] border border-[rgba(229,9,20,0.3)] text-[#f87171] px-3.5 py-3 rounded-[10px] text-[13px] font-[600] leading-relaxed">
              <TriangleAlert size={16} className="shrink-0 mt-0.5" />
              <span>{paymentError}</span>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Step indicator */}
          <div className="flex items-center gap-2 flex-wrap">
            {steps.map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-[13px] font-bold transition-all duration-200 ${i <= step ? "bg-[#e50914] text-white border-[#e50914] shadow-[0_4px_14px_rgba(229,9,20,0.35)]" : "bg-[var(--app-panel)] text-[var(--app-mute)] border border-[var(--app-edge)]"}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${i <= step ? "bg-white/25" : "bg-[var(--app-fill)]"}`}>{i + 1}</span>&nbsp;{label}
                </div>
                {i < steps.length - 1 && <span className="text-[var(--app-mute)]">→</span>}
              </div>
            ))}
          </div>

          {/* Step 1: Place */}
          <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl p-6">
            <h2 className="text-lg font-extrabold mb-[18px] flex items-center gap-2"><MapPin size={18} /> {t("staff.choosePlace")}</h2>
            {loadingCinemas ? (
              <p className="text-[var(--app-mute)] py-4">{t("common.loading")}</p>
            ) : cinemas.length === 0 ? (
              <p className="text-[var(--app-mute)] py-4">{t("staff.noCinemas")}</p>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
                {cinemas.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => selectCinema(c.id)}
                    className={`text-left flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${cinemaId === String(c.id) ? "border-[#e50914] bg-[rgba(229,9,20,0.06)] shadow-[0_4px_18px_rgba(229,9,20,0.2)]" : "bg-[var(--app-panel2)] border-[var(--app-edge)] hover:border-[rgba(229,9,20,0.4)]"}`}
                  >
                    {c.image ? (
                      <img src={c.image} alt={c.name} className="h-[64px] w-[64px] rounded-xl object-cover shrink-0" />
                    ) : (
                      <div className="h-[64px] w-[64px] rounded-xl bg-[var(--app-fill)] flex items-center justify-center text-[var(--app-mute)] shrink-0"><Building2 size={26} /></div>
                    )}
                    <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                      <span className="font-extrabold text-[14px] text-[var(--app-ink)] leading-snug">{c.name}</span>
                      <span className="flex items-center gap-1 text-[12px] text-[var(--app-mute)]"><MapPin size={12} className="shrink-0" /> {c.location || "N/A"}</span>
                      <span className="text-[11px] text-[var(--app-mute)]">{c.area}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Step 2: Movie */}
          {cinemaId && (
            <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl p-6">
              <h2 className="text-lg font-extrabold mb-[18px] flex items-center gap-2"><Clapperboard size={18} /> {t("staff.selectMovie")}</h2>
              {loadingShowtimes ? (
                <p className="text-[var(--app-mute)] py-4">{t("common.loading")}</p>
              ) : moviesForCinema.length === 0 ? (
                <p className="text-[var(--app-mute)] py-4">{t("staff.noMoviesAtCinema")}</p>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4">
                  {moviesForCinema.map((m) => {
                    const count = movieShowtimes.length;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => selectMovie(m.id)}
                        className={`text-left flex flex-col overflow-hidden bg-[var(--app-panel2)] border-2 rounded-2xl transition-all duration-200 cursor-pointer ${movieId === String(m.id) ? "border-[#e50914] shadow-[0_4px_18px_rgba(229,9,20,0.25)] -translate-y-0.5" : "border-[var(--app-edge)] hover:border-[rgba(229,9,20,0.4)]"}`}
                      >
                        {m.poster ? (
                          <img src={m.poster} alt={m.title} className="w-full h-[186px] object-cover" />
                        ) : (
                          <div className="w-full h-[186px] bg-[var(--app-fill)] flex items-center justify-center text-[var(--app-mute)]"><Clapperboard size={28} /></div>
                        )}
                        <div className="p-3 flex flex-col gap-1 min-w-0">
                          <span className="font-bold text-[13px] leading-snug line-clamp-2 text-[var(--app-ink)]">{m.title}</span>
                          <span className="text-[11px] text-[var(--app-mute)]">{fmtDuration(m.duration)} · {count > 0 ? t("staff.showtimeCount", { count }) : t("staff.noShowtimes")}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Room */}
          {movieId && (
            <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl p-6">
              <h2 className="text-lg font-extrabold mb-[18px] flex items-center gap-2"><DoorOpen size={18} /> {t("staff.chooseRoom")}</h2>
              {roomsForMovie.length === 0 ? (
                <p className="text-[var(--app-mute)] py-4">{t("staff.noShowtimesForMovie")}</p>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
                  {roomsForMovie.map((room) => (
                    <button
                      key={room.id}
                      type="button"
                      onClick={() => selectRoom(room.id)}
                      className={`text-left flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${roomId === String(room.id) ? "border-[#e50914] bg-[rgba(229,9,20,0.06)] shadow-[0_4px_18px_rgba(229,9,20,0.2)]" : "bg-[var(--app-panel2)] border-[var(--app-edge)] hover:border-[rgba(229,9,20,0.4)]"}`}
                    >
                      <span className="w-11 h-11 shrink-0 rounded-xl bg-[rgba(229,9,20,0.12)] flex items-center justify-center text-brand"><DoorOpen size={20} /></span>
                      <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                        <span className="font-extrabold text-[14px] text-[var(--app-ink)]">{room.name}</span>
                        <span className="text-[12px] text-[var(--app-mute)]">{t("staff.showtimeCount", { count: room.showtimeCount })}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Showtime */}
          {roomId && (
            <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl p-6">
              <h2 className="text-lg font-extrabold mb-[18px] flex items-center gap-2"><CalendarClock size={18} /> {t("staff.chooseWhen", { room: showtimesForRoom[0]?.room?.name || "" })}</h2>
              {showtimesForRoom.length === 0 ? (
                <p className="text-[var(--app-mute)] py-4">{t("staff.noShowtimesInRoom")}</p>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
                  {showtimesForRoom.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => selectShowtime(s.id)}
                      className={`text-left flex flex-col gap-2 p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${showtimeId === String(s.id) ? "border-[#e50914] bg-[rgba(229,9,20,0.06)] shadow-[0_4px_18px_rgba(229,9,20,0.2)]" : "bg-[var(--app-panel2)] border-[var(--app-edge)] hover:border-[rgba(229,9,20,0.4)]"}`}
                    >
                      <div className="flex items-center gap-1.5 text-[15px] font-extrabold text-[var(--app-ink)]"><CalendarClock size={15} className="shrink-0" /> {fmtDate(s.start_time)}</div>
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] text-[var(--app-mute)]">{t("staff.to")} {fmtDate(s.end_time)}</span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#e50914] text-white text-[13px] font-bold">${s.price}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 5: Seats */}
          {showtimeId && selectedShowtime && (
            <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl p-6">
              <h2 className="text-lg font-extrabold mb-[18px] flex items-center gap-2"><Armchair size={18} /> {t("staff.selectSeats", { room: selectedShowtime.room?.name || "" })}</h2>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-4 text-[13px] text-[var(--app-mute)]">
                <span className="inline-flex items-center gap-1.5 font-bold text-[var(--app-ink)]"><Building2 size={14} /> {selectedShowtime.room?.cinema?.name}</span>
                <span className="inline-flex items-center gap-1.5"><Clapperboard size={14} /> {selectedShowtime.movie?.title}</span>
                <span className="inline-flex items-center gap-1.5"><CalendarClock size={14} /> {fmtDate(selectedShowtime.start_time)}</span>
                <span className="inline-flex items-center gap-1.5"><CircleDollarSign size={14} /> {t("staff.pricePerSeat", { price: `$${selectedShowtime.price}` })}</span>
              </div>

              {seatsLoading ? (
                <p className="text-[var(--app-mute)] py-6">{t("common.loading")}</p>
              ) : seatsData ? (
                <>
                  <div className="mb-5 flex flex-wrap gap-3 text-[12px] text-[var(--app-mute)]">
                    <span className="inline-flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-[4px] border border-[rgba(229,9,20,0.45)] bg-[rgba(229,9,20,0.15)] inline-block" /> {t("staff.seatLegendOccupied")}</span>
                    <span className="inline-flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-[4px] bg-[#e50914] inline-block" /> {t("staff.seatLegendSelected")}</span>
                    <span className="inline-flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-[4px] bg-[var(--app-panel2)] border border-[rgba(234,179,8,0.5)] inline-block" /> {t("staff.seatLegendVip")}</span>
                    <span className="inline-flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-[4px] bg-[var(--app-panel2)] border border-[rgba(192,132,252,0.5)] inline-block" /> {t("staff.seatLegendCouple")}</span>
                    <span className="inline-flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-[4px] bg-[var(--app-panel2)] border border-[var(--app-edge2)] inline-block" /> {t("staff.seatLegendAvailable")}</span>
                  </div>
                  <div className="flex flex-col gap-2.5 items-center">
                    <div className="w-full max-w-[460px] h-[10px] rounded-[30px] bg-gradient-to-b from-[var(--app-edge2)] to-transparent mb-2" />
                    {rows.map(({ row, seats }) => (
                      <div key={row} className="flex items-center gap-2.5 w-full max-w-[460px]">
                        <span className="w-[26px] text-[12px] font-bold text-[var(--app-mute)] shrink-0">{row}</span>
                        <div className="flex flex-wrap gap-2 flex-1 justify-center">{seats.map(seatBtn)}</div>
                      </div>
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          )}

          {/* Customer + Confirm */}
          {showtimeId && seatsData && (
            <form onSubmit={handleSubmit} className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl p-6">
              <h2 className="text-lg font-extrabold mb-4 flex items-center gap-2"><User size={18} /> {t("staff.customerDetails")}</h2>
              <div className="grid sm:grid-cols-3 gap-4 mb-5">
                <div className="bg-[var(--app-deep)] border-2 border-[var(--app-edge)] rounded-xl py-3 px-4">
                  <input className="bg-transparent border-none outline-none w-full text-[14px] font-semibold text-[var(--app-ink)] placeholder:text-[var(--app-mute)]" placeholder={t("staff.customerName")} value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} />
                </div>
                <div className="bg-[var(--app-deep)] border-2 border-[var(--app-edge)] rounded-xl py-3 px-4">
                  <input className="bg-transparent border-none outline-none w-full text-[14px] font-semibold text-[var(--app-ink)] placeholder:text-[var(--app-mute)]" placeholder={t("staff.customerEmail")} value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} />
                </div>
                <div className="bg-[var(--app-deep)] border-2 border-[var(--app-edge)] rounded-xl py-3 px-4">
                  <input className="bg-transparent border-none outline-none w-full text-[14px] font-semibold text-[var(--app-ink)] placeholder:text-[var(--app-mute)]" placeholder={t("staff.customerPhone")} value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} />
                </div>
              </div>

              <div className="mb-5">
                <h3 className="text-sm font-extrabold mb-3 flex items-center gap-2"><Wallet size={15} /> {t("staff.paymentMethod")}</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cash")}
                    className={`flex items-center gap-2.5 rounded-xl border-2 px-4 py-3 text-sm font-bold transition-all duration-200 cursor-pointer ${paymentMethod === "cash" ? "border-[#e50914] bg-[rgba(229,9,20,0.06)] text-[var(--app-ink)]" : "bg-[var(--app-panel2)] border-[var(--app-edge)] text-[var(--app-mute)] hover:border-[rgba(229,9,20,0.4)]"}`}
                  >
                    <Banknote size={17} className="shrink-0" /> {t("staff.cash")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("bakong")}
                    className={`flex items-center gap-2.5 rounded-xl border-2 px-4 py-3 text-sm font-bold transition-all duration-200 cursor-pointer ${paymentMethod === "bakong" ? "border-[#e50914] bg-[rgba(229,9,20,0.06)] text-[var(--app-ink)]" : "bg-[var(--app-panel2)] border-[var(--app-edge)] text-[var(--app-mute)] hover:border-[rgba(229,9,20,0.4)]"}`}
                  >
                    <ScanLine size={17} className="shrink-0 text-[#2f7cf6]" /> {t("staff.payWithBakong")}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between flex-wrap gap-3 rounded-xl bg-[var(--app-panel2)] border border-[var(--app-edge)] px-5 py-4">
                <div className="text-[13px] text-[var(--app-mute)]">
                  <span className="inline-flex items-center gap-1.5 font-bold text-[var(--app-ink)]"><Armchair size={14} /> {selectedSeats.size === 1 ? t("staff.seatSelectedOne", { count: selectedSeats.size }) : t("staff.seatSelectedMany", { count: selectedSeats.size })}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-[13px] text-[var(--app-mute)]">{t("staff.total")} <b className="text-[20px] text-[#e50914]">${total.toFixed(2)}</b></div>
                  <button type="submit" disabled={selectedSeats.size === 0 || submitting} className="inline-flex items-center gap-2 border-none cursor-pointer py-[11px] px-5 text-sm font-bold rounded-xl transition-all duration-200 bg-[#e50914] text-white shadow-[0_4px_14px_rgba(229,9,20,0.35)] hover:bg-[#f40612] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0">
                    <ShoppingCart size={16} /> {submitting ? t("staff.selling") : t("staff.sellFor", { total: `$${total.toFixed(2)}` })}
                  </button>
                </div>
              </div>
            </form>
          )}
        </>
      )}

      <PaymentModal
        open={showPaymentModal}
        payment={pendingPayment}
        status={paymentStatus || "pending"}
        error={paymentError}
        checking={checking}
        confirming={submitting}
        bookingCode={pendingBooking?.booking_code}
        onCheck={checkPendingPayment}
        onConfirm={confirmPendingPayment}
        confirmLabel="Confirm payment received"
        onClose={() => setShowPaymentModal(false)}
      />
    </div>
  );
}