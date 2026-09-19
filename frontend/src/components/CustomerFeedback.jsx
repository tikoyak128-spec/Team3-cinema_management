import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  ChevronDown,
  MessageSquareQuote,
  Quote,
  Search,
  Send,
  Star,
  X,
} from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { usePrefs } from "../context/PrefsContext";

const fallbackTestimonials = [
  {
    id: "f1",
    user: { name: "Sokha Chan" },
    rating: 5,
    comment: "Amazing movie, great seats and sound quality!",
    movie: { title: "Avatar: Fire and Ash" },
  },
  {
    id: "f2",
    user: { name: "Dara Kim" },
    rating: 5,
    comment: "The visuals were stunning. Highly recommended.",
    movie: { title: "Dune: Part Three" },
  },
  {
    id: "f3",
    user: { name: "Srey Pov" },
    rating: 4,
    comment: "Worth the ticket price. Will come back again.",
    movie: { title: "Gladiator III" },
  },
];

function Stars({ value }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={14}
          className={
            n <= value ? "text-[#eab308] fill-[#eab308]" : "text-[var(--app-mute)]"
          }
        />
      ))}
    </div>
  );
}

function MoviePicker({ movies = [], value, onChange }) {
  const { t } = usePrefs();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef(null);
  const inputRef = useRef(null);

  const selected = movies.find((m) => String(m.id) === String(value)) || null;

  const filtered = query.trim()
    ? movies.filter((m) =>
        String(m.title).toLowerCase().includes(query.trim().toLowerCase())
      )
    : movies;

  useEffect(() => {
    if (!open) return;
    const onDocMouseDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [open]);

  return (
    <div ref={rootRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="w-full inline-flex items-center gap-3 bg-[var(--app-fill)] border border-[var(--app-edge2)] hover:border-brand rounded-xl px-3 py-2.5 text-left transition-colors cursor-pointer"
      >
        {selected ? (
          <>
            <img
              src={selected.poster}
              alt=""
              className="w-8 h-11 rounded-md object-cover shrink-0"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <span className="flex-1 min-w-0">
              <span className="block text-[14px] font-bold text-[var(--app-ink)] truncate">
                {selected.title}
              </span>
              <span className="block text-[12px] text-[var(--app-mute)] truncate">
                {selected.genre}
                {selected.date ? ` · ${selected.date}` : ""}
              </span>
            </span>
          </>
        ) : (
          <span className="flex-1 text-[14px] text-[var(--app-mute)]">
            {t("home.feedbackChoose")}
          </span>
        )}
        <ChevronDown
          size={16}
          className={`shrink-0 text-[var(--app-mute)] transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        tabIndex={-1}
        inert={!open}
        className={`absolute z-40 mt-2 w-full rounded-xl border border-[var(--app-edge)] bg-[var(--app-panel)] shadow-[0_18px_44px_rgba(0,0,0,0.5)] overflow-hidden origin-top transition-all duration-150 ease-out ${
          open
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 -translate-y-1.5 scale-[0.97] pointer-events-none"
        }`}
      >
        <div className="p-2 border-b border-[var(--app-edge)]">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--app-mute)]"
            />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === "Enter") e.preventDefault();
              }}
              placeholder={t("home.feedbackSearchPlaceholder")}
              className="w-full bg-[var(--app-fill)] border border-[var(--app-edge2)] rounded-lg pl-9 pr-3 py-2 text-[13px] text-[var(--app-ink)] outline-none focus:border-brand"
            />
          </div>
        </div>

        <div className="max-h-56 overflow-y-auto p-1.5">
          {filtered.length === 0 ? (
            <p className="text-[13px] text-[var(--app-mute)] text-center py-5">
              {t("home.feedbackNoMovies")}
            </p>
          ) : (
            filtered.map((m) => {
              const isSelected = String(m.id) === String(value);
              return (
                <button
                  key={m.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(m.id);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 text-left px-2.5 py-2 rounded-lg transition-colors cursor-pointer ${
                    isSelected ? "bg-brand/15" : "hover:bg-[var(--app-fill)]"
                  }`}
                >
                  <img
                    src={m.poster}
                    alt=""
                    className="w-7 h-10 rounded object-cover shrink-0"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <span className="flex-1 min-w-0">
                    <span
                      className={`block text-[13px] font-bold truncate ${
                        isSelected ? "text-brand" : "text-[var(--app-ink)]"
                      }`}
                    >
                      {m.title}
                    </span>
                    <span className="block text-[11px] text-[var(--app-mute)] truncate">
                      {m.genre}
                      {m.date ? ` · ${m.date}` : ""}
                    </span>
                  </span>
                  {isSelected && <Check size={15} className="shrink-0 text-brand" />}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default function CustomerFeedback({ movies = [] }) {
  const navigate = useNavigate();
  const { t } = usePrefs();
  const { user } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [open, setOpen] = useState(false);
  const [movieId, setMovieId] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");

  const loadReviews = () => {
    api
      .get("/reviews")
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setReviews((prev) => (list.length >= prev.length ? list : prev));
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const testimonials =
    reviews.length > 0 ? reviews.slice(0, 3) : fallbackTestimonials;

  const openDialog = () => {
    setFormError("");
    setSuccess("");
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
    setMovieId("");
    setRating(0);
    setComment("");
    setFormError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!movieId) {
      setFormError(t("home.feedbackSelectMovie"));
      return;
    }
    if (!rating) {
      setFormError(t("movieDetail.yourRating"));
      return;
    }
    setSubmitting(true);
    setFormError("");
    setSuccess("");
    try {
      const { data } = await api.post("/reviews", {
        movie_id: movieId,
        rating,
        comment,
      });
      setReviews((prev) => [data, ...prev]);
      setSuccess(t("home.feedbackSuccess"));
      setTimeout(() => {
        closeDialog();
        loadReviews();
      }, 1400);
    } catch (err) {
      if (err?.response?.status === 422) {
        const existing = reviews.find(
          (r) =>
            String(r.movie_id) === String(movieId) &&
            r.user_id === user?.id
        );
        if (existing && movies.find((m) => String(m.id) === String(movieId))) {
          const movie = movies.find((m) => String(m.id) === String(movieId));
          setFormError("");
          closeDialog();
          navigate(`/movies/${encodeURIComponent(movie.title)}`);
          return;
        }
      }
      setFormError(
        err?.response?.data?.message ||
          t("movieDetail.reviewFailed")
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* ===== WHAT OUR CUSTOMERS SAY ===== */}
      <section
        className="max-w-[1024px] mx-auto px-5 sm:px-6 lg:px-8 py-14 sm:py-16 md:py-20 scroll-mt-20"
        id="feedback"
      >
        <div className="text-center mb-10 sm:mb-12">
          <span className="inline-flex items-center gap-2 bg-brand/10 text-brand text-[11px] font-bold uppercase tracking-[2px] px-3.5 py-1.5 rounded-full mb-4">
            <MessageSquareQuote size={14} /> {t("home.testimonialsBadge")}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-[42px] font-black leading-[1.15]">
            {t("home.testimonialsTitle")}
          </h2>
          <p className="text-sm sm:text-[15px] text-[var(--app-mute)] mt-3 max-w-[420px] mx-auto">
            {t("home.testimonialsNote")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {testimonials.map((r) => (
            <div
              key={r.id ?? r.title}
              className="relative bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl p-6 flex flex-col gap-4"
            >
              <Quote
                size={28}
                className="text-brand/30 absolute top-5 right-5 -scale-x-100"
              />
              <Stars value={r.rating} />
              <p className="text-[14px] leading-relaxed text-[var(--app-ink2)] min-h-[80px]">
                “{r.comment || t("movieDetail.noComment")}”
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-[var(--app-edge)] mt-auto">
                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-[rgba(229,9,20,0.12)] flex items-center justify-center font-bold text-brand">
                  {r.user?.avatar ? (
                    <img src={r.user.avatar} alt={r.user.name} className="w-full h-full object-cover" />
                  ) : (
                    (r.user?.name || "?").charAt(0).toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-[14px] text-[var(--app-ink)] truncate">
                    {r.user?.name || t("home.customer")}
                  </p>
                  {r.movie?.title && (
                    <p className="text-[12px] text-[var(--app-mute)] truncate">
                      {t("home.watched")} {r.movie.title}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-[var(--app-panel2)] border border-[var(--app-edge)] rounded-3xl p-7 sm:p-9 flex flex-col sm:flex-row items-center gap-5 justify-between">
          <div className="text-center sm:text-left">
            <h3 className="text-lg sm:text-xl font-extrabold text-[var(--app-ink)]">
              {t("home.shareFeedback")}
            </h3>
            <p className="text-[13px] sm:text-sm text-[var(--app-mute)] mt-1">
              {t("home.shareFeedbackNote")}
            </p>
          </div>
          <button
            onClick={openDialog}
            className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-white font-bold text-sm px-6 py-3.5 rounded-full transition-all shadow-[0_4px_16px_rgba(229,9,20,0.35)] cursor-pointer border-none shrink-0"
          >
            <Send size={15} /> {t("home.shareFeedbackCta")}
          </button>
        </div>
      </section>

      {/* ===== FEEDBACK DIALOG ===== */}
      {open && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease]"
          onClick={closeDialog}
        >
          <div
            className="relative w-full max-w-[480px] bg-[var(--app-panel2)] border border-[var(--app-edge)] rounded-2xl p-6 sm:p-7 shadow-[0_24px_70px_rgba(0,0,0,0.7)] animate-[scaleIn_0.25s_ease]"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={t("home.shareFeedbackCta")}
          >
            <button
              onClick={closeDialog}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/5 border border-[var(--app-edge2)] flex items-center justify-center text-[var(--app-mute)] hover:text-brand hover:border-brand transition-all cursor-pointer"
              aria-label="Close"
            >
              <X size={17} />
            </button>

            <h3 className="text-lg font-extrabold text-[var(--app-ink)] mb-5 pr-8">
              {t("home.shareFeedbackTitle")}
            </h3>

            {!user ? (
              <div className="text-center py-6">
                <p className="text-[14px] text-[var(--app-mute)] mb-5">
                  {t("home.feedbackSignIn")}
                </p>
                <button
                  onClick={() => {
                    closeDialog();
                    navigate("/login");
                  }}
                  className="bg-brand text-white font-bold text-[14px] px-6 py-3 rounded-xl hover:bg-brand-hover transition-all cursor-pointer"
                >
                  {t("nav.signIn")}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-[var(--app-mute)] mb-2">
                    {t("home.feedbackSelectMovie")}
                  </label>
                  <MoviePicker
                    movies={movies}
                    value={movieId}
                    onChange={(id) => {
                      setMovieId(id);
                      setFormError("");
                    }}
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[var(--app-mute)] mb-2">
                    {t("movieDetail.yourRating")}
                  </label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => {
                          setRating(n);
                          setFormError("");
                        }}
                        className="cursor-pointer transition-transform hover:scale-110"
                        aria-label={`${n} stars`}
                      >
                        <Star
                          size={26}
                          className={
                            n <= rating
                              ? "text-[#eab308] fill-[#eab308]"
                              : "text-[var(--app-mute)]"
                          }
                        />
                      </button>
                    ))}
                  </div>
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
                {success && (
                  <p className="text-[13px] font-bold text-[#22c55e]">{success}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 bg-brand text-white font-bold text-[14px] px-6 py-3 rounded-xl hover:bg-brand-hover disabled:opacity-60 transition-all cursor-pointer"
                >
                  <Send size={15} />
                  {submitting ? t("movieDetail.submitting") : t("movieDetail.submitReview")}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}