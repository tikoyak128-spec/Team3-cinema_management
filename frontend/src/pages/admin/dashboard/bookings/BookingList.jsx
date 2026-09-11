import { useEffect, useState } from "react";
import { Armchair, CircleUser, MapPin, Search, Ticket } from "lucide-react";
import api from "../../../../api/client";
import "../admin.css";

const fmtDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value).slice(0, 10);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const statusMap = {
  confirmed: { label: "Confirmed", badge: "kc-badge-green" },
  pending: { label: "Pending", badge: "kc-badge-yellow" },
  cancelled: { label: "Cancelled", badge: "kc-badge-red" },
};

export default function BookingList() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { data } = await api.get("/bookings");
        if (!cancelled) setBookings(data);
      } catch (err) {
        if (!cancelled) setError(err?.response?.data?.message || "Failed to load bookings.");
      }
      if (!cancelled) setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = bookings.filter((b) => {
    const q = search.toLowerCase();
    return (
      (b.user?.name || "").toLowerCase().includes(q) ||
      (b.showtime?.movie?.title || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="kc-page">
      <div className="kc-head">
        <div>
          <h1>Bookings</h1>
          <p className="kc-subtitle">View and manage all customer reservations.</p>
        </div>
        <div className="kc-actions">
          <span className="kc-subtitle">
            Total: <b style={{ color: "#f5f5f5" }}>{bookings.length}</b>
          </span>
        </div>
      </div>

      {error && (
        <div className="kc-error-banner" style={styles.banner}>
          {error}
          <button onClick={() => setError("")} style={styles.bannerClose}>×</button>
        </div>
      )}

      <div className="kc-toolbar">
        <div className="kc-search">
          <span><Search size={16} /></span>
          <input placeholder="Search by customer or movie..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="kc-card">
        {loading ? (
          <div className="kc-empty" style={{ padding: "40px" }}>
            <p>Loading bookings...</p>
          </div>
        ) : (
          <div className="kc-table-wrap">
            <table className="kc-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Movie</th>
                  <th>Cinema</th>
                  <th>Seats</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => {
                  const st = statusMap[b.status] || { label: b.status, badge: "kc-badge-gray" };
                  const seats = (b.bookingSeats || []).map((bs) => bs.seat?.seat_number).filter(Boolean);
                  return (
                    <tr key={b.id}>
                      <td>
                        <div className="kc-cell-user">
                          <div className="kc-avatar"><CircleUser size={18} /></div>
                          <div>
                            <div className="kc-cell-main">{b.user?.name || "—"}</div>
                            <div className="kc-cell-sub">{b.user?.email || ""}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="kc-cell-main">{b.showtime?.movie?.title || "—"}</span></td>
                      <td><MapPin size={13} /> {b.showtime?.room?.cinema?.name || "—"}</td>
                      <td>
                        <div className="kc-detail">
                          {seats.length ? (
                            seats.map((s) => (
                              <span key={s} className="kc-chip"><Armchair size={13} /> {s}</span>
                            ))
                          ) : (
                            <span className="kc-cell-sub">—</span>
                          )}
                        </div>
                      </td>
                      <td><span className="kc-cell-main">${Number(b.total_amount).toFixed(2)}</span></td>
                      <td>{fmtDate(b.created_at)}</td>
                      <td><span className={`kc-badge ${st.badge}`}>{st.label}</span></td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7}>
                      <div className="kc-empty">
                        <div className="kc-empty-icon"><Ticket size={32} /></div>
                        <p>No bookings found.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  banner: {
    backgroundColor: "rgba(229,9,20,0.12)",
    border: "1px solid rgba(229,9,20,0.4)",
    color: "#ff6b6b",
    fontSize: "13px",
    padding: "10px 14px",
    borderRadius: "10px",
    marginBottom: "16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bannerClose: {
    background: "none",
    border: "none",
    color: "#ff6b6b",
    fontSize: "18px",
    cursor: "pointer",
    lineHeight: "1",
  },
}