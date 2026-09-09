import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Building2, DoorOpen, Ticket, TriangleAlert } from "lucide-react";
import "./Booking.css";

const movieCatalog = {
  "the last emperor": { title: "The Last Emperor", genre: "Drama • 2h 18m", rating: "PG-13", price: 5 },
  "city of shadows": { title: "City of Shadows", genre: "Action • 1h 52m", rating: "R", price: 6 },
  "golden dawn": { title: "Golden Dawn", genre: "Romance • 2h 05m", rating: "PG", price: 5 },
  "midnight express": { title: "Midnight Express", genre: "Thriller • 1h 45m", rating: "PG-13", price: 6 },
  "ocean's whisper": { title: "Ocean's Whisper", genre: "Adventure • 2h 30m", rating: "PG", price: 7 },
  "age of wonders": { title: "Age of Wonders", genre: "Fantasy • 2h 20m", rating: "PG-13", price: 6 },
  "crimson tide": { title: "Crimson Tide", genre: "Action • 1h 55m", rating: "R", price: 6 },
  "the far horizon": { title: "The Far Horizon", genre: "Sci-Fi • 2h 12m", rating: "PG-13", price: 7 },
};

const cinemas = [
  { id: 1, name: "Cinema Phnom Penh", location: "Main City Center", halls: ["Hall 1", "Hall 2"] },
  { id: 2, name: "Cinema Riverside", location: "Riverside District", halls: ["IMAX 1", "Hall 3"] },
  { id: 3, name: "Cinema Siem Reap", location: "Heritage Walk", halls: ["Hall 1", "VIP Suite"] },
];

const times = ["10:30", "13:00", "15:45", "18:30", "21:00"];

const ROWS = 8;
const COLS = 12;

const seededOccupied = (seed) => {
  const occupied = new Set();
  for (let i = 0; i < 16; i++) {
    const r = Math.abs(Math.sin(seed * 7 + i * 13) * 10) % ROWS;
    const c = Math.abs(Math.cos(seed * 3 + i * 29) * 10) % COLS;
    occupied.add(`${Math.floor(r)}-${Math.floor(c)}`);
  }
  return occupied;
};

const steps = ["Showtime", "Seats", "Confirm", "Done"];

export default function Booking() {
  const navigate = useNavigate();
  const { movieTitle } = useParams();
  const movie =
    movieCatalog[movieTitle?.toLowerCase().replace(/%20/g, " ")] || {
      title: decodeURIComponent(movieTitle || "Unknown Movie"),
      genre: "Feature Film",
      rating: "PG",
      price: 5,
    };

  const price = movie.price ?? 5;
  const [step, setStep] = useState(0);
  const [cinemaId, setCinemaId] = useState(cinemas[0].id);
  const [movieDate, setMovieDate] = useState("Today");
  const [time, setTime] = useState(times[2]);
  const [hall, setHall] = useState(null);
  const [selected, setSelected] = useState([]);
  const [credit, setCredit] = useState({ name: "", number: "", expiry: "", cvv: "" });
  const [issued, setIssued] = useState(null);
  const [bedMsg, setBedMsg] = useState(false);

  const cinema = cinemas.find((c) => c.id === cinemaId);
  const occupied = hall ? seededOccupied(hall.replace(/\D/g, "") * 1 + time.charCodeAt(1)) : new Set();

  const total = selected.length * price;
  const maxSteps = steps.length - 1;

  const toggleSeat = (r, c) => {
    const key = `${r}-${c}`;
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const goNext = () => {
    if (step === 1 && selected.length === 0) {
      setBedMsg(true);
      return;
    }
    setBedMsg(false);
    setStep((s) => Math.min(s + 1, maxSteps));
  };

  const confirm = () => {
    setIssued({
      code: "BK-" + Math.floor(1000 + Math.random() * 9000),
      seats: [...selected],
    });
    setStep(3);
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
            <span className="bk-movie-rating">{movie.rating}</span>
            <div>
              <h1 className="bk-movie-title">{movie.title}</h1>
              <p className="bk-movie-meta">{movie.genre}</p>
            </div>
          </div>
          <div className="bk-price">${price.toFixed(2)} <span>/ ticket</span></div>
        </div>

        {/* STEP 0: Showtime */}
        {step === 0 && (
          <div className="bk-section">
            <h2 className="bk-section-title">1. Choose Your Showtime</h2>

            <label className="bk-label">Date</label>
            <div className="bk-date-row">
              {["Today", "Tomorrow", "Wed 02", "Thu 03"].map((d) => (
                <button
                  key={d}
                  className={`bk-date ${movieDate === d ? "active" : ""}`}
                  onClick={() => setMovieDate(d)}
                >
                  {d}
                </button>
              ))}
            </div>

            <label className="bk-label">Cinema</label>
            <div className="bk-cinema-grid">
              {cinemas.map((c) => (
                <button
                  key={c.id}
                  className={`bk-cinema ${cinemaId === c.id ? "active" : ""}`}
                  onClick={() => setCinemaId(c.id)}
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
              {cinema.halls.map((h) => (
                <button
                  key={h}
                  className={`bk-date ${hall === h ? "active" : ""}`}
                  onClick={() => setHall(h)}
                >
                  <DoorOpen size={14} /> {h}
                </button>
              ))}
            </div>

            <label className="bk-label">Time</label>
            <div className="bk-time-grid">
              {times.map((t) => (
                <button
                  key={t}
                  className={`bk-time ${time === t ? "active" : ""}`}
                  onClick={() => setTime(t)}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="bk-nav">
              <button className="bk-btn bk-btn-primary" disabled={!hall} onClick={goNext}>
                Select Seats →
              </button>
            </div>
          </div>
        )}

        {/* STEP 1: Seats */}
        {step === 1 && (
          <div className="bk-section">
            <h2 className="bk-section-title">2. Select Your Seats</h2>

            <div className="bk-screen">SCREEN</div>

            <div className="bk-seatmap">
              {Array.from({ length: ROWS }).map((_, r) => (
                <div className="bk-seatrow" key={r}>
                  <span className="bk-rowlabel">{String.fromCharCode(65 + r)}</span>
                  {Array.from({ length: COLS }).map((_, c) => {
                    const key = `${r}-${c}`;
                    const isOcc = occupied.has(key);
                    const isSel = selected.includes(key);
                    return (
                      <button
                        key={c}
                        disabled={isOcc}
                        className={`bk-seat ${isOcc ? "occupied" : ""} ${isSel ? "selected" : ""}`}
                        onClick={() => toggleSeat(r, c)}
                      >
                        {isOcc ? "✕" : ""}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

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

              <div className="bk-order">
                <div className="bk-order-row"><span>Movie</span><b>{movie.title}</b></div>
                <div className="bk-order-row"><span>Cinema</span><b>{cinema.name} · {hall}</b></div>
                <div className="bk-order-row"><span>Showtime</span><b>{movieDate} · {time}</b></div>
                <div className="bk-order-row">
                  <span>Seats</span>
                  <b>{selected.map((s) => `${String.fromCharCode(65 + +s.split("-")[0])}${+s.split("-")[1] + 1}`).join(", ")}</b>
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
              <button className="bk-btn bk-btn-primary" onClick={confirm}>Confirm Booking · ${total.toFixed(2)}</button>
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
                <div className="bk-ticket-movie">{movie.title}</div>
                <div className="bk-ticket-meta">{cinema.name} · {hall}</div>
                <div className="bk-ticket-meta">{movieDate} · {time}</div>
                <div className="bk-ticket-seats">
                  {selected.map((s) => {
                    const seatLabel = `${String.fromCharCode(65 + +s.split("-")[0])}${+s.split("-")[1] + 1}`;
                    return <span key={s} className="bk-ticket-seat">{seatLabel}</span>;
                  })}
                </div>
              </div>
              <div className="bk-ticket-rail">
                <div className="bk-ticket-code">{issued.code}</div>
                <div className="bk-ticket-total">${total.toFixed(2)}</div>
              </div>
            </div>

            <div className="bk-nav full">
              <button className="bk-btn bk-btn-ghost" onClick={() => navigate("/")}>Back to Home</button>
              <button className="bk-btn bk-btn-secondary" onClick={() => { setSelected([]); setStep(0); }}>Book Another</button>
            </div>
          </div>
        )}
      </main>

      {/* Live summary bar */}
      {step > 0 && step < 3 && selected.length > 0 && (
        <div className="bk-summarybar">
          <div>
            <b>{selected.length}</b> ticket{selected.length !== 1 ? "s" : ""} · {movie.title}
          </div>
          <div className="bk-summary-right">
            <span className="bk-summary-total">${total.toFixed(2)}</span>
            <button className="bk-btn bk-btn-primary" onClick={step === 2 ? confirm : goNext}>
              {step === 2 ? "Confirm" : "Continue"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
