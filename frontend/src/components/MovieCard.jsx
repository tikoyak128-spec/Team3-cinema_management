import { useNavigate } from "react-router-dom";
import { usePrefs } from "../context/PrefsContext";
import { Play } from "lucide-react";

export default function MovieCard({ movie, promo }) {
  const navigate = useNavigate();
  const { t } = usePrefs();
  const bookPath = promo
    ? `/booking/${encodeURIComponent(movie.title)}?promo=${promo}`
    : `/booking/${encodeURIComponent(movie.title)}`;
  const detailPath = `/movies/${encodeURIComponent(movie.title)}`;

  return (
    <div className="group flex flex-col bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_28px_rgba(0,0,0,0.45)]">
      <div
        className="relative aspect-[2/3] overflow-hidden cursor-pointer"
        onClick={() => navigate(detailPath)}
      >
        <img
          className="w-full h-full object-cover block transition-transform duration-500 group-hover:scale-105"
          src={movie.poster}
          alt={movie.title}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 bg-black/75 text-white text-[10px] sm:text-[11px] font-extrabold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md border border-white/15">{movie.rating}</span>
      </div>
      <div className="p-2.5 sm:p-3 md:p-4 flex flex-col flex-1">
        <h3
          className="text-xs sm:text-sm md:text-base font-bold mb-0.5 sm:mb-1 leading-tight truncate cursor-pointer hover:text-brand transition-colors"
          onClick={() => navigate(detailPath)}
        >
          {movie.title}
        </h3>
        <p className="text-[11px] sm:text-[12px] md:text-[13px] text-[var(--app-mute)] mb-0.5 sm:mb-1 truncate">{movie.genre}</p>
        <p className="text-[10px] sm:text-[11px] md:text-[12px] text-brand font-semibold mb-2.5 sm:mb-3">{t("nowShowing.release")}: {movie.date}</p>
        <div className="mt-auto flex flex-col sm:flex-row gap-1.5 sm:gap-2">
          <button
            className="flex-1 text-[11px] sm:text-[12px] md:text-[13px] font-bold px-2 py-2 sm:py-2.5 rounded-lg sm:rounded-[10px] bg-brand border border-brand text-white cursor-pointer transition-all whitespace-nowrap hover:bg-brand-hover"
            onClick={() => navigate(`/watch/${encodeURIComponent(movie.title)}`)}
            title={t("nowShowing.watchTrailer")}
          >
            <Play size={12} className="inline mr-0.5 sm:mr-1 align-middle" /> {t("nowShowing.watch")}
          </button>
          <button
            className="flex-1 text-[11px] sm:text-[12px] md:text-[13px] font-bold px-2 py-2 sm:py-2.5 rounded-lg sm:rounded-[10px] border border-[var(--app-edge2)] text-[var(--app-ink2)] hover:text-white cursor-pointer transition-all whitespace-nowrap hover:bg-brand hover:border-brand"
            onClick={() => navigate(bookPath)}
          >
            {t("nowShowing.tickets")}
          </button>
        </div>
      </div>
    </div>
  );
}
