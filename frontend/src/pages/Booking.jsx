import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Building2, DoorOpen, Ticket, TriangleAlert } from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import "./Booking.css";

const steps = ["Showtime", "Seats", "Confirm", "Done"];

const parseSeat = (code) => {
  const m = /^([A-Z]+)(\d+)$/.exec(code || "");
  if (!m) return null;
  return { row: m[1], col: Number(m[2]) };
};

const dateLabel = (dateStr) => {
  const [y, m, d] = dateStr.split("-").map(Number);
  const today = new Date();
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const dt = new Date(y, m - 1, d);
  const diffDays = Math.round((dt - t) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  return dt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "2-digit" });
};

export default function Booking() {
  const navigate = useNavigate();
  const { movieTitle } = useParams();
  const { user } = useAuth();

  const movieKey = decodeURIComponent(movieTitle || "").trim().toLowerCase();

  const [showtimes, setShowtimes] = useState([]);
  const [seats, setSeats] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [ready, setReady] = useState(false);
  const [step, setStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedCinemaId, setSelectedCinemaId] = useState("");
  const [selectedHall, setSelectedHall] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selected, setSelected] = useState([]);
  const [credit, setCredit] = useState({ name: "", number: "", expiry: "", cvv: "" });
  const [issued, setIssued] = useState(null);
  const [bedMsg, setBedMsg] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [sh, st, bk] = await Promise.all([
          api.get("/showtimes"),
          api.get("/seats"),
          api.get("/bookings"),
        ]);
        if (cancelled) return;
        setShowtimes(sh.data);
        setSeats(st.data);
        setBookings(bk.data);
      } catch (err) {
        if (!cancelled) setError(err?.response?.data?.message || "Failed to load booking data.");
      } finally {
        if (!cancelled) setReady(true);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const showtimesForMovie = showtimes.filter(
    (s) => (s.movie?.title || "").toLowerCase() === movieKey
  );

  const movie = showtimesForMovie[0]?.movie || null;

  const dates = [...new Set(showtimesForMovie.map((s) => s.start_time.slice(0, 10)))].sort();

  const cinemas = [];
  for (const s of showtimesForMovie) {
    const cin = s.room?.cinema;
    if (cin && !cinemas.some((c) => c.id === cin.id)) cinemas.push(cin);
  }

  const curDate = dates.includes(selectedDate) ? selectedDate : (dates[0] || "");
  const curCinemaId = cinemas.some((c) => c.id === Number(selectedCinemaId))
    ? selectedCinemaId
    : String(cinemas[0]?.id || "");

  const dateShowtimes = showtimesForMovie.filter((s) => s.start_time.slice(0, 10) === curDate);
  const cinemaShowtimes = dateShowtimes.filter((s) => s.room?.cinema_id === Number(curCinemaId));
  const halls = [];
  for (const s of cinemaShowtimes) {
    if (s.room && !halls.some((h) => h.id === s.room.id)) halls.push(s.room);
  }
  const curHall = halls.some((h) => h.id === Number(selectedHall))
    ? selectedHall
    : String(halls[0]?.id || "");
  const hallShowtimes = cinemaShowtimes.filter((s) => s.room_id === Number(curHall));
  const times = [...new Set(hallShowtimes.map((s) => s.start_time.slice(11, 16)))].sort();
  const curTime = times.includes(selectedTime) ? selectedTime : (times[0] || "");
  const showtime = hallShowtimes.find((s) => s.start_time.slice(11, 16) === curTime);

  const price = showtime ? Number(showtime.price) : 0;
  const total = selected.length * price;

  const pickDate = (d) => {
    setSelectedDate(d);
    setSelectedHall("");
    setSelectedTime("");
  };

  const pickCinema = (id) => {
    setSelectedCinemaId(id);
    setSelectedHall("");
    setSelectedTime("");
  };

  const pickHall = (id) => {
    setSelectedHall(id);
    setSelectedTime("");
  };

  const roomSeats = seats.filter((s) => s.room_id === showtime?.room_id);

  const rowLetters = [];
  roomSeats.forEach((s) => {
    const p = parseSeat(s.seat_number);
    if (p && !rowLetters.includes(p.row)) rowLetters.push(p.row);
  });
  rowLetters.sort();

  const maxCol = roomSeats.reduce((mx, s) => {
    const p = parseSeat(s.seat_number);
    return p ? Math.max(mx, p.col) : mx;
  }, 0);

  const occupiedIds = showtime
    ? bookings
        .filter((b) => b.showtime_id === showtime.id && b.status !== "cancelled")
        .flatMap((b) =>
          (b.bookingSeats || [])
            .filter((bs) => bs.status !== "cancelled")
            .map((bs) => bs.seat_id)
        )
    : [];

  const seatLabel = (id) => seats.find((s) => s.id === id)?.seat_number || String(id);

  const toggleSeat = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((k) => k !== id) : [...prev, id]
    );
  };

  const goNext = () => {
    if (step === 1 && selected.length === 0) {
      setBedMsg(true);
      return;
    }
    setBedMsg(false);
    setError("");
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const confirm = async () => {
    if (!showtime || !user || selected.length === 0) return;
    setSubmitting(true);
    setError("");
    try {
      const { data } = await api.post("/bookings", {
        user_id: Number(user.id),
        showtime_id: showtime.id,
        seat_ids: selected,
      });
      const code =
        data.tickets?.[0]?.ticket_code ||
        data.bookingSeats?.[0]?.ticket_code ||
        `BK-${data.id}`;
      setIssued({ code, booking: data });
      setStep(3);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to create booking. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bk-page">
      {/* Top Bar */}
      <header className="bk-header">
        <Link to="/" className="bk-logo">
          <span className="bk-logo-icon"></span>
          <span className="bk-logo-text">KHMER <b>CINEMA</b></span>
        </Link>
        <nav className="bk-steps">
          {steps.map((s, i) => (
            <div key={s} className={`bk-step ${i === step ? "active" : ""} ${i < step ? "done" : ""}`}>
              <span className="bk-step-num">{i < step ? "✓" : i + 1}</span>
              <span className="bk-step-label">{s}</span>
            </div>
          ))}
        </nav>
        <button className="bk-back" onClick={() => navigate(-1)}>← Back</button>
      </header>

      <main className="bk-main">
        {/* Movie Summary */}
        <div className="bk-moviebar">
          <div className="bk-movie-info">
            <span className="bk-movie-rating">PG</span>
            <div>
              <h1 className="bk-movie-title">{movie?.title || decodeURIComponent(movieTitle || "Unknown Movie")}</h1>
              <p className="bk-movie-meta">{movie ? `${movie.duration} min · Feature Film` : "Feature Film"}</p>
            </div>
          </div>
          <div className="bk-price">${price.toFixed(2)} <span>/ ticket</span></div>
        </div>

        {!ready && (
          <div className="bk-section">
            <p className="bk-movie-meta">Loading showtimes...</p>
          </div>
        )}

        {ready && showtimesForMovie.length === 0 && (
          <div className="bk-section">
            <h2 className="bk-section-title">No upcoming showtimes</h2>
            <p className="bk-movie-meta">No screening scheduled for this movie yet.</p>
            <div className="bk-nav">
              <button className="bk-btn bk-btn-ghost" onClick={() => navigate("/")}>← Back to Home</button>
            </div>
          </div>
        )}

        {/* STEP 0: Showtime */}
        {ready && showtimesForMovie.length > 0 && step === 0 && (
          <div className="bk-section">
            <h2 className="bk-section-title">1. Choose Your Showtime</h2>

            {error && <p className="bk-error"><TriangleAlert size={16} /> {error}</p>}

            <label className="bk-label">Date</label>
            <div className="bk-date-row">
              {dates.map((d) => (
                <button
                  key={d}
                  className={`bk-date ${curDate === d ? "active" : ""}`}
                  onClick={() => pickDate(d)}
                >
                  {dateLabel(d)}
                </button>
              ))}
            </div>

            <label className="bk-label">Cinema</label>
            <div className="bk-cinema-grid">
              {cinemas.map((c) => (
                <button
                  key={c.id}
                  className={`bk-cinema ${curCinemaId === String(c.id) ? "active" : ""}`}
                  onClick={() => pickCinema(String(c.id))}
                >
                  <span className="bk-cinema-icon"><Building2 size={20} /></span>
                  <div>
                    <div className="bk-cinema-name">{c.name}</div>
                    <div className="bk-cinema-loc">{c.location}</div>
                  </div>
                </button>
              ))}
            </div>

            <label className="bk-label">Hall</label>
            <div className="bk-hall-row">
              {halls.map((h) => (
                <button
                  key={h.id}
                  className={`bk-date ${curHall === String(h.id) ? "active" : ""}`}
                  onClick={() => pickHall(String(h.id))}
                >
                  <DoorOpen size={14} /> {h.name}
                </button>
              ))}
            </div>

            <label className="bk-label">Time</label>
            <div className="bk-time-grid">
              {times.map((t) => (
                <button
                  key={t}
                  className={`bk-time ${curTime === t ? "active" : ""}`}
                  onClick={() => setSelectedTime(t)}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="bk-nav">
              <button className="bk-btn bk-btn-primary" disabled={!showtime} onClick={goNext}>
                Select Seats →
              </button>
            </div>
          </div>
        )}

        {/* STEP 1: Seats */}
        {step === 1 && (
          <div className="bk-section">
            <h2 className="bk-section-title">2. Select Your Seats</h2>
            {error && <p className="bk-error"><TriangleAlert size={16} /> {error}</p>}

            <div className="bk-screen">SCREEN</div>

            {roomSeats.length === 0 ? (
              <p className="bk-movie-meta">No seats configured for this room yet.</p>
            ) : (
              <div className="bk-seatmap">
                {rowLetters.map((row) => (
                  <div className="bk-seatrow" key={row}>
                    <span className="bk-rowlabel">{row}</span>
                    {Array.from({ length: maxCol }).map((_, i) => {
                      const col = i + 1;
                      const seat = roomSeats.find((s) => {
                        const p = parseSeat(s.seat_number);
                        return p && p.row === row && p.col === col;
                      });
                      if (!seat) {
                        return <span key={col} className="bk-seat" style={{ visibility: "hidden" }} />;
                      }
                      const isOcc = occupiedIds.includes(seat.id);
                      const isSel = selected.includes(seat.id);
                      return (
                        <button
                          key={seat.id}
                          disabled={isOcc}
                          className={`bk-seat ${isOcc ? "occupied" : ""} ${isSel ? "selected" : ""}`}
                          onClick={() => toggleSeat(seat.id)}
                        >
                          {isOcc ? "✕" : seatLabel(seat.id)}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}

            <div className="bk-legend">
              <span><i className="dot free" /> Available</span>
              <span><i className="dot selected" /> Selected</span>
              <span><i className="dot occupied" /> Taken</span>
            </div>

            {bedMsg && (
              <p className="bk-error"><TriangleAlert size={16} /> Please select at least one seat.</p>
            )}

            <div className="bk-nav">
              <button className="bk-btn bk-btn-ghost" onClick={() => setStep(0)}>← Back</button>
              <button className="bk-btn bk-btn-primary" onClick={goNext}>
                Review ({selected.length} seat{selected.length !== 1 ? "s" : ""}) →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Confirm + Payment */}
        {step === 2 && (
          <div className="bk-section bk-two-col">
            <div>
              <h2 className="bk-section-title">3. Confirm &amp; Pay</h2>

              {error && <p className="bk-error"><TriangleAlert size={16} /> {error}</p>}

              <div className="bk-order">
                <div className="bk-order-row"><span>Movie</span><b>{movie?.title}</b></div>
                <div className="bk-order-row"><span>Cinema</span><b>{showtime?.room?.cinema?.name} · {showtime?.room?.name}</b></div>
                <div className="bk-order-row"><span>Showtime</span><b>{dateLabel(curDate)} · {curTime}</b></div>
                <div className="bk-order-row">
                  <span>Seats</span>
                  <b>{selected.map(seatLabel).join(", ")}</b>
                </div>
                <div className="bk-order-row"><span>Tickets</span><b>{selected.length}</b></div>
                <div className="bk-order-row total"><span>Total</span><b>${total.toFixed(2)}</b></div>
              </div>
            </div>

            <div>
              <h2 className="bk-section-title">Payment Details</h2>
              <div className="bk-form">
                <label className="bk-label">Cardholder Name</label>
                <input className="bk-input" placeholder="Name on card" value={credit.name} onChange={(e) => setCredit({ ...credit, name: e.target.value })} />
                <label className="bk-label">Card Number</label>
                <input className="bk-input" placeholder="1234 5678 9012 3456" value={credit.number} onChange={(e) => setCredit({ ...credit, number: e.target.value })} />
                <div className="bk-form-row">
                  <div>
                    <label className="bk-label">Expiry</label>
                    <input className="bk-input" placeholder="MM/YY" value={credit.expiry} onChange={(e) => setCredit({ ...credit, expiry: e.target.value })} />
                  </div>
                  <div>
                    <label className="bk-label">CVV</label>
                    <input className="bk-input" placeholder="123" value={credit.cvv} onChange={(e) => setCredit({ ...credit, cvv: e.target.value })} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bk-nav full">
              <button className="bk-btn bk-btn-ghost" onClick={() => setStep(1)}>← Back</button>
              <button className="bk-btn bk-btn-primary" disabled={submitting} onClick={confirm}>
                {submitting ? "Booking..." : `Confirm Booking · $${total.toFixed(2)}`}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Confirmation */}
        {step === 3 && issued && (
          <div className="bk-section bk-done">
            <div className="bk-done-icon"><Ticket size={40} /></div>
            <h2 className="bk-done-title">Booking Confirmed!</h2>
            <p className="bk-done-sub">Your ticket has been issued. Show this code at the entrance.</p>

            <div className="bk-ticket">
              <div className="bk-ticket-main">
                <div className="bk-ticket-movie">{movie?.title}</div>
                <div className="bk-ticket-meta">{showtime?.room?.cinema?.name} · {showtime?.room?.name}</div>
                <div className="bk-ticket-meta">{dateLabel(curDate)} · {curTime}</div>
                <div className="bk-ticket-seats">
                  {selected.map((id) => (
                    <span key={id} className="bk-ticket-seat">{seatLabel(id)}</span>
                  ))}
                </div>
              </div>
              <div className="bk-ticket-rail">
                <div className="bk-ticket-code">{issued.code}</div>
                <div className="bk-ticket-total">${Number(issued.booking?.total_amount || total).toFixed(2)}</div>
              </div>
            </div>

            <div className="bk-nav full">
              <button className="bk-btn bk-btn-ghost" onClick={() => navigate("/")}>Back to Home</button>
              <button className="bk-btn bk-btn-secondary" onClick={() => { setSelected([]); setIssued(null); setStep(0); }}>Book Another</button>
            </div>
          </div>
        )}
      </main>

      {/* Live summary bar */}
      {step > 0 && step < 3 && selected.length > 0 && (
        <div className="bk-summarybar">
          <div>
            <b>{selected.length}</b> ticket{selected.length !== 1 ? "s" : ""} · {movie?.title}
          </div>
          <div className="bk-summary-right">
            <span className="bk-summary-total">${total.toFixed(2)}</span>
            <button className="bk-btn bk-btn-primary" disabled={submitting} onClick={step === 2 ? confirm : goNext}>
              {submitting ? "Booking..." : step === 2 ? "Confirm" : "Continue"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}