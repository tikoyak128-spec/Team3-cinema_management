import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../../api/client";
import "../admin.css";

const pad = (n) => String(n).padStart(2, "0");

const emptyForm = {
  movie_id: "",
  cinema_id: "",
  room_id: "",
  date: "",
  time: "",
  price: "",
  status: "Active",
};

export default function ShowtimeForm({ isEdit = false }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .get("/movies")
      .then(({ data }) => {
        if (!cancelled) setMovies(data);
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load movies.");
      });
    api
      .get("/cinemas")
      .then(({ data }) => {
        if (!cancelled) setCinemas(data);
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load cinemas.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isEdit || !id) return;
    let cancelled = false;
    api
      .get(`/showtimes/${id}`)
      .then(({ data }) => {
        if (cancelled) return;
        const d = new Date(data.start_time);
        setForm({
          movie_id: data.movie_id,
          cinema_id: data.room?.cinema?.id ?? "",
          room_id: data.room_id,
          date: Number.isNaN(d.getTime())
            ? ""
            : `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
          time: Number.isNaN(d.getTime()) ? "" : `${pad(d.getHours())}:${pad(d.getMinutes())}`,
          price: data.price,
          status: "Active",
        });
      })
      .catch((err) => {
        if (!cancelled) setError(err?.response?.data?.message || "Failed to load showtime.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isEdit, id]);

  const selectedCinema = cinemas.find((c) => c.id === Number(form.cinema_id));
  const rooms = selectedCinema?.rooms || [];
  const selectedMovie = movies.find((m) => m.id === Number(form.movie_id));

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleCinemaChange = (e) =>
    setForm({ ...form, cinema_id: e.target.value, room_id: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const start_time = `${form.date} ${form.time}:00`;
    const duration = Number(selectedMovie?.duration) || 0;
    const end = new Date(start_time);
    end.setMinutes(end.getMinutes() + duration);
    const end_time = `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())} ${pad(end.getHours())}:${pad(end.getMinutes())}:${pad(end.getSeconds())}`;

    const payload = {
      movie_id: Number(form.movie_id),
      room_id: Number(form.room_id),
      start_time,
      end_time,
      price: Number(form.price),
    };

    try {
      if (isEdit) {
        await api.put(`/showtimes/${id}`, payload);
      } else {
        await api.post("/showtimes", payload);
      }
      navigate("/admin/showtimes");
    } catch (err) {
      const errors = err?.response?.data?.errors;
      setError(
        errors?.movie_id?.[0] ||
          errors?.room_id?.[0] ||
          errors?.start_time?.[0] ||
          errors?.end_time?.[0] ||
          errors?.price?.[0] ||
          err?.response?.data?.message ||
          `Failed to ${isEdit ? "update" : "create"} showtime.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="kc-page">
        <div className="kc-empty"><p>Loading showtime...</p></div>
      </div>
    );
  }

  return (
    <div className="kc-page">
      <div className="kc-head">
        <div>
          <h1>{isEdit ? "Edit Showtime" : "Add Showtime"}</h1>
          <p className="kc-subtitle">{isEdit ? "Update this screening schedule." : "Schedule a new movie screening."}</p>
        </div>
      </div>

      {error && <div className="kc-error-banner" style={styles.banner}>{error}</div>}

      <form className="kc-form-card" onSubmit={handleSubmit}>
        <div className="kc-form-grid">
          <div className="kc-field full">
            <label className="kc-label">Movie <span>*</span></label>
            <select className="kc-select-lg" value={form.movie_id} onChange={set("movie_id")} required>
              <option value="">Select a movie</option>
              {movies.map((m) => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </select>
          </div>

          <div className="kc-field">
            <label className="kc-label">Cinema <span>*</span></label>
            <select className="kc-select-lg" value={form.cinema_id} onChange={handleCinemaChange} required>
              <option value="">Select a cinema</option>
              {cinemas.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="kc-field">
            <label className="kc-label">Room <span>*</span></label>
            <select className="kc-select-lg" value={form.room_id} onChange={set("room_id")} required>
              <option value="">Select a room</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div className="kc-field">
            <label className="kc-label">Date <span>*</span></label>
            <input className="kc-input" type="date" value={form.date} onChange={set("date")} required />
          </div>

          <div className="kc-field">
            <label className="kc-label">Start Time <span>*</span></label>
            <input className="kc-input" type="time" value={form.time} onChange={set("time")} required />
          </div>

          <div className="kc-field">
            <label className="kc-label">Ticket Price <span>*</span></label>
            <input className="kc-input" type="number" step="0.50" min="0" placeholder="5.00" value={form.price} onChange={set("price")} required />
          </div>

          <div className="kc-field">
            <label className="kc-label">Status</label>
            <select className="kc-select-lg" value={form.status} onChange={set("status")}>
              <option>Active</option>
              <option>Sold Out</option>
              <option>Cancelled</option>
            </select>
          </div>

          <div className="kc-form-actions">
            <button type="submit" className="kc-btn kc-btn-primary" disabled={submitting}>
              {submitting ? (isEdit ? "Saving..." : "Adding...") : (isEdit ? "Save Changes" : "Add Showtime")}
            </button>
            <button type="button" className="kc-btn kc-btn-ghost" onClick={() => navigate("/admin/showtimes")}>Cancel</button>
          </div>
        </div>
      </form>
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
  },
}