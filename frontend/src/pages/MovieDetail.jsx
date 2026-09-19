import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Pencil,
  Play,
  Send,
  Star,
  Ticket,
  Trash2,
} from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { usePrefs } from "../context/PrefsContext";
import { formatDuration } from "../utils/movieFormat";

function formatDate(value) {
  if (!value || String(value).length < 10) return "—";
  return new Date(`${String(value).slice(0, 10)}T00:00:00`).toLocaleDateString(
    undefined,
    { day: "2-digit", month: "short", year: "numeric" }
  );
}

function StarRating({ value, onChange, readOnly = false }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          onClick={() => onChange && onChange(n)}
          className={`cursor-pointer disabled:cursor-default transition-transform ${
            !readOnly ? "hover:scale-110" : ""
          }`}
        >
          <Star
            size={readOnly ? 15 : 22}
            className={
              n <= value ? "text-[#eab308] fill-[#eab308]" : "text-[var(--app-mute)]"
            }
          />
        </button>
      ))}
    </div>
  );
}

export default function MovieDetail() {
  const { title } = useParams();
  const navigate = useNavigate();
  const { t } = usePrefs();
  const { user } = useAuth();

  const movieTitle = decodeURIComponent(title || "");
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/movies");
        if (cancelled) return;
        const list = Array.isArray(data) ? data : [];
        const found =
          list.find((m) => String(m.title) === movieTitle) ||
          list.find((m) => String(m.id) === String(title));
        if (!found) {
          setNotFound(true);
          return;
        }
        setMovie(found);
        const res = await api.get("/reviews", { params: { movie_id: found.id } });
        if (!cancelled) setReviews(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        if (!cancelled)
          setError(err?.response?.data?.message || t("movieDetail.reviewFailed"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movieTitle, title]);

  const myReview = user
    ? reviews.find((r) => r.user_id === user.id) || null
    : null;

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviews.length).toFixed(1)
      : "—";

  const resetForm = () => {
    setEditing(false);
    setFormError("");
    setRating(myReview?.rating || 0);
    setComment(myReview?.comment || "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      setFormError(t("movieDetail.yourRating"));
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      if (editing && myReview) {
        const { data } = await api.put(`/reviews/${myReview.id}`, { rating, comment });
        setReviews((prev) => prev.map((r) => (r.id === data.id ? data : r)));
      } else {
        const { data } = await api.post("/reviews", {
          movie_id: movie.id,
          rating,
          comment,
        });
        setReviews((prev) => [data, ...prev]);
      }
      setEditing(false);
    } catch (err) {
      setFormError(err?.response?.data?.message || t("movieDetail.reviewFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("movieDetail.deleteConfirm"))) return;
    try {
      await api.delete(`/reviews/${id}`);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      setRating(0);
      setComment("");
    } catch (err) {
      setFormError(err?.response?.data?.message || t("movieDetail.reviewDeleteFailed"));
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1080px] mx-auto px-5 sm:px-6 lg:px-8 pt-32 pb-20">
        <p className="text-[var(--app-mute)]">{t("common.loading")}</p>
      </div>
    );
  }

  if (notFound || !movie) {
    return (
      <div className="max-w-[1080px] mx-auto px-5 sm:px-6 lg:px-8 pt-32 pb-20">
        <p className="text-[var(--app-mute)]">{error || t("nowShowing.noResults")}</p>
        <button
          onClick={() => navigate("/now-showing")}
          className="mt-4 inline-flex items-center gap-2 text-brand font-bold"
        >
          <ArrowLeft size={16} /> {t("movieDetail.backToMovies")}
        </button>
      </div>
    );
  }

  const categoryName = movie.category?.name || "";
  const bookPath = `/booking/${encodeURIComponent(movie.title)}`;

  return (
    <div className="max-w-[1080px] mx-auto px-5 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-[13px] font-bold text-[var(--app-mute)] hover:text-brand transition-colors mb-6 cursor-pointer"
      >
        <ArrowLeft size={16} /> {t("movieDetail.backToMovies")}
      </button>

      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8 bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl overflow-hidden p-5 sm:p-7">
        <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-[var(--app-fill)]">
          <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
          <span className="absolute top-3 left-3 bg-black/75 text-white text-[12px] font-extrabold px-2.5 py-1 rounded-md border border-white/15">
            {movie.rating != null && String(movie.rating) !== "0" ? String(movie.rating) : "N/A"}
          </span>
        </div>

        <div className="flex flex-col gap-4 min-w-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--app-ink)] leading-tight">
              {movie.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-[var(--app-mute)] mt-3">
              {categoryName && (
                <span className="inline-flex items-center gap-1.5">{categoryName}</span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Clock size={14} className="text-brand" /> {formatDuration(movie.duration) || "—"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar size={14} className="text-brand" /> {formatDate(movie.release_date)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Star size={14} className="text-[#eab308] fill-[#eab308]" />
                {avgRating} ({t("movieDetail.reviewsCount", { count: reviews.length })})
              </span>
            </div>
          </div>

          <div>
            <h2 className="text-[13px] font-bold uppercase tracking-widest text-[var(--app-mute)] mb-2">
              {t("movieDetail.description")}
            </h2>
            <p className="text-[14px] leading-relaxed text-[var(--app-ink2)] whitespace-pre-line">
              {movie.description || t("movieDetail.noDescription")}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 mt-auto pt-2">
            <button
              onClick={() => navigate(`/watch/${encodeURIComponent(movie.title)}`)}
              className="inline-flex items-center gap-2 font-bold text-[14px] px-5 py-2.5 rounded-xl border border-[var(--app-edge2)] text-[var(--app-ink2)] hover:bg-brand hover:border-brand hover:text-white transition-all cursor-pointer"
            >
              <Play size={15} /> {t("movieDetail.watchTrailer")}
            </button>
            <button
              onClick={() => navigate(bookPath)}
              className="inline-flex items-center gap-2 font-bold text-[14px] px-5 py-2.5 rounded-xl bg-brand text-white hover:bg-brand-hover transition-all cursor-pointer"
            >
              <Ticket size={15} /> {t("movieDetail.getTickets")}
            </button>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-extrabold text-[var(--app-ink)]">
              {t("movieDetail.reviewsTitle")}
            </h2>
            <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[var(--app-mute)]">
              <Star size={14} className="text-[#eab308] fill-[#eab308]" /> {avgRating}
            </span>
          </div>

          {reviews.length === 0 ? (
            <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl py-12 px-5 text-center text-[var(--app-mute)]">
              {t("movieDetail.noReviewsYet")}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {reviews.map((r) => (
                <div
                  key={r.id}
                  className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-[rgba(229,9,20,0.12)] flex items-center justify-center font-bold text-brand shrink-0">
                        {(r.user?.name || "?").charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[14px] text-[var(--app-ink)] truncate">
                          {r.user?.name || "User"}
                        </p>
                        <StarRating value={r.rating} readOnly />
                      </div>
                    </div>
                    {user && r.user_id === user.id && (
                      <div className="flex gap-2 shrink-0">
                        <button
                          title={t("movieDetail.editReview")}
                          onClick={() => {
                            setEditing(true);
                            setRating(r.rating);
                            setComment(r.comment || "");
                            setFormError("");
                          }}
                          className="w-8 h-8 rounded-lg border border-[var(--app-edge2)] text-[var(--app-mute)] hover:text-brand flex items-center justify-center cursor-pointer"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          title={t("movieDetail.deleteReview")}
                          onClick={() => handleDelete(r.id)}
                          className="w-8 h-8 rounded-lg border border-[var(--app-edge2)] text-[var(--app-mute)] hover:text-[#e50914] flex items-center justify-center cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                  {r.comment && (
                    <p className="text-[14px] leading-relaxed text-[var(--app-ink2)] mt-3">
                      {r.comment}
                    </p>
                  )}
                  <p className="text-[12px] text-[var(--app-mute)] mt-2">
                    {new Date(r.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Review form */}
        <div>
          <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl p-5 sticky top-24">
            {!user ? (
              <div className="text-center py-4">
                <p className="text-[14px] text-[var(--app-mute)] mb-4">
                  {t("movieDetail.signInToReview")}
                </p>
                <button
                  onClick={() => navigate("/login")}
                  className="bg-brand text-white font-bold text-[14px] px-5 py-2.5 rounded-xl hover:bg-brand-hover transition-all cursor-pointer"
                >
                  {t("nav.signIn")}
                </button>
              </div>
            ) : myReview && !editing ? (
              <div className="text-center">
                <p className="text-[14px] font-bold text-[var(--app-ink)] mb-4">
                  {t("movieDetail.reviewSubmitted")}
                </p>
                <button
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center gap-2 font-bold text-[14px] px-5 py-2.5 rounded-xl border border-[var(--app-edge2)] text-[var(--app-ink2)] hover:bg-brand hover:border-brand hover:text-white transition-all cursor-pointer"
                >
                  <Pencil size={15} /> {t("movieDetail.editReview")}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <h3 className="text-[15px] font-extrabold text-[var(--app-ink)]">
                  {editing ? t("movieDetail.editReview") : t("movieDetail.writeReview")}
                </h3>

                <div>
                  <label className="block text-[13px] font-semibold text-[var(--app-mute)] mb-2">
                    {t("movieDetail.yourRating")}
                  </label>
                  <StarRating value={rating} onChange={setRating} />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[var(--app-mute)] mb-2">
                    {t("movieDetail.yourComment")}
                  </label>
                  <textarea
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={t("movieDetail.commentPlaceholder")}
                    className="w-full bg-[var(--app-fill)] border border-[var(--app-edge2)] rounded-xl px-4 py-3 text-[14px] text-[var(--app-ink)] outline-none focus:border-brand resize-none"
                  />
                </div>

                {formError && (
                  <p className="text-[13px] text-[#ff6b6b]">{formError}</p>
                )}

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-brand text-white font-bold text-[14px] px-5 py-2.5 rounded-xl hover:bg-brand-hover disabled:opacity-60 transition-all cursor-pointer"
                  >
                    <Send size={15} />
                    {submitting ? t("movieDetail.submitting") : t("movieDetail.submitReview")}
                  </button>
                  {editing && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="font-bold text-[14px] px-4 py-2.5 rounded-xl border border-[var(--app-edge2)] text-[var(--app-ink2)] hover:bg-[var(--app-fill)] transition-all cursor-pointer"
                    >
                      {t("common.cancel")}
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
