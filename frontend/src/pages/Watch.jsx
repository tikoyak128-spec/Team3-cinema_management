import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Play, Ticket } from "lucide-react";
import { usePrefs } from "../context/PrefsContext";
import api from "../api/client";
import { formatDuration, normalizeMovie } from "../utils/movieFormat";

const FALLBACK_POSTER = "https://placehold.co/300x450/050505/e50914/png?text=Khmer+Cinema";

const normalize = (s) =>
  (s || "").toLowerCase().replace(/'/g, "").replace(/[^a-z0-9]+/g, " ").trim();

function extractYouTubeId(url) {
  if (!url) return null;
  try {
    const decoded = decodeURIComponent(url);
    const m = decoded.match(
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|v=)([A-Za-z0-9_-]{11})/
    );
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

export default function Watch() {
  const navigate = useNavigate();
  const { t } = usePrefs();
  const { movieTitle } = useParams();
  const [dbMovies, setDbMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api
      .get("/movies")
      .then((res) => {
        if (cancelled) return;
        const list = (Array.isArray(res.data) ? res.data : []).map(normalizeMovie);
        setDbMovies(list);
      })
      .catch(() => {
        if (!cancelled) setDbMovies([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const dbMovie = useMemo(
    () => dbMovies.find((m) => normalize(m.title) === normalize(movieTitle)) || null,
    [dbMovies, movieTitle]
  );

  const movie = dbMovie
    ? {
        title: dbMovie.title,
        genre: dbMovie.genre,
        duration: formatDuration(dbMovie.duration),
        rating: dbMovie.rating,
        description: dbMovie.description,
        poster: dbMovie.poster,
        trailer_url: dbMovie.trailer_url,
      }
    : {
        title: decodeURIComponent(movieTitle || "Movie"),
        genre: "",
        duration: "",
        rating: "N/A",
        description: "",
        poster: "",
        trailer_url: "",
      };

  const trailerId = extractYouTubeId(movie.trailer_url);

  const related = useMemo(() => {
    const others = dbMovies.filter((m) => normalize(m.title) !== normalize(movieTitle));
    const sameCategory = (m) => Boolean(m.categoryName) && m.categoryName === dbMovie?.categoryName;
    return [...others.filter(sameCategory), ...others.filter((m) => !sameCategory(m))].slice(0, 4);
  }, [dbMovies, movieTitle, dbMovie]);

  return (
    <div className="bg-[var(--app-page)] text-[var(--app-ink)] font-['Mulish','Kantumruy_Pro',-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif]">
      <main className="max-w-[1020px] w-full mx-auto px-4 sm:px-7 pb-10 sm:pb-14 pt-24 sm:pt-28 md:pt-32 flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <button className="inline-flex items-center gap-2 bg-[var(--app-panel)] border border-[var(--app-edge)] text-[var(--app-ink2)] py-2.5 pl-3 pr-4 rounded-full text-[13px] font-bold cursor-pointer transition-all duration-200 hover:text-white hover:bg-brand hover:border-brand hover:shadow-[0_6px_18px_rgba(229,9,20,0.35)]" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} />
            {t("watch.back")}
          </button>
        </div>
        <div className="bg-black border border-[var(--app-edge)] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
          {trailerId ? (
            <div className="relative w-full aspect-video bg-black">
              <iframe
                key={trailerId}
                className="w-full h-full border-none block bg-black"
                src={`https://www.youtube.com/embed/${trailerId}?autoplay=1&rel=0`}
                title={`${movie.title} Trailer`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              ></iframe>
            </div>
          ) : (
            <div className="relative w-full aspect-video bg-black flex items-center justify-center">
              <div className="text-xs sm:text-sm text-[#888] font-semibold px-6 text-center">Trailer not available.</div>
            </div>
          )}
        </div>

        <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl p-[26px]">
          <div className="flex items-center gap-3.5 mb-4 flex-wrap">
            <div className="min-w-0">
              <h1 className="text-[26px] font-[800] max-md:text-[20px]">{movie.title}</h1>
              {movie.genre && <p className="text-[var(--app-mute)] text-sm mt-1">{movie.genre}</p>}
            </div>
          </div>

          <div className="flex gap-2.5 flex-wrap mb-3.5">
            <span className="bg-[rgba(229,9,20,0.14)] border border-[rgba(229,9,20,0.3)] text-[#e50914] py-1.5 px-3.5 text-[13px] font-extrabold rounded-lg">{movie.rating}</span>
            {movie.duration && (
              <span className="bg-[var(--app-panel2)] border border-[var(--app-edge2)] text-[var(--app-ink2)] py-1.5 px-3.5 text-[13px] font-semibold rounded-[20px]">{movie.duration}</span>
            )}
            <span className="bg-[var(--app-panel2)] text-[#22c55e] border border-[rgba(34,197,94,0.3)] py-1.5 px-3.5 text-[13px] font-semibold rounded-[20px] flex items-center gap-1"><Calendar size={13} /> {t("nav.nowShowing")}</span>
          </div>

          {movie.description && (
            <p className="text-[var(--app-ink2)] text-[15px] leading-[1.6] max-w-[700px]">{movie.description}</p>
          )}

          <div className="flex gap-3 mt-[22px] flex-wrap">
            <button className="border-none cursor-pointer py-[13px] px-6 text-sm font-bold rounded-xl transition-all duration-200 inline-flex items-center gap-2 bg-[#e50914] text-white shadow-[0_4px_14px_rgba(229,9,20,0.35)] hover:bg-[#f40612] hover:-translate-y-0.5" onClick={() => navigate(`/booking/${encodeURIComponent(movie.title)}`)}>
              <Ticket size={16} /> {t("home.getTickets")}
            </button>
          </div>
        </div>

        <section>
        <h2 className="text-xl font-extrabold mb-[18px]">{t("watch.youMightAlsoLike")}</h2>
        {related.length > 0 ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-[18px]">
            {related.map((m) => (
              <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-[14px] p-3 transition-[transform,border-color] duration-200 hover:-translate-y-1 hover:border-[rgba(229,9,20,0.4)] cursor-pointer" key={m.id ?? m.title} onClick={() => navigate(`/watch/${encodeURIComponent(m.title)}`)}>
                <img
                  className="w-full aspect-[2/3] object-cover rounded-lg bg-[var(--app-panel2)] mb-2.5"
                  src={m.poster}
                  alt={m.title}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_POSTER;
                  }}
                />
                <div className="text-sm font-bold">{m.title}</div>
                <div className="text-xs text-[var(--app-mute)] mt-1">{m.genre}</div>
                <button
                  type="button"
                  className="w-full mt-3 inline-flex items-center justify-center gap-2 bg-brand text-white p-[10px] text-[13px] font-bold rounded-xl cursor-pointer transition-all duration-200 shadow-[0_2px_10px_rgba(229,9,20,0.25)] hover:bg-brand-hover hover:shadow-[0_4px_16px_rgba(229,9,20,0.4)] hover:-translate-y-0.5 active:translate-y-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/watch/${encodeURIComponent(m.title)}`);
                  }}
                >
                  <Play size={14} className="fill-current" /> {t("nowShowing.watch")}
                </button>
              </div>
            ))}
          </div>
        ) : (
          !loading && <p className="text-sm text-[var(--app-mute)]">{t("nowShowing.noResults")}</p>
        )}
        </section>
      </main>
    </div>
  );
}
