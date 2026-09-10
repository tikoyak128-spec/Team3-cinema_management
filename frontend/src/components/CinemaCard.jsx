import { Link } from "react-router-dom";
import { MapPin, Clock, Ticket } from "lucide-react";
import { usePrefs } from "../context/PrefsContext";
import { normalizeCinema } from "../utils/cinemaFormat";

export default function CinemaCard({ cinema }) {
  const { t } = usePrefs();
  const c = normalizeCinema(cinema, t);

  return (
    <div className="relative h-[320px] rounded-2xl overflow-hidden group bg-[var(--app-panel)] transition-all hover:-translate-y-1.5 hover:shadow-[0_24px_50px_rgba(0,0,0,0.55)] hover:ring-1 hover:ring-brand/40">
      <img
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[600ms] group-hover:scale-110"
        src={c.image}
        alt={c.name}
        loading="lazy"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02)_0%,rgba(0,0,0,0.15)_40%,rgba(0,0,0,0.92)_100%)] group-hover:bg-[linear-gradient(180deg,rgba(229,9,20,0.04)_0%,rgba(0,0,0,0.2)_40%,rgba(0,0,0,0.95)_100%)] transition-all duration-500" />

      <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
        <span className="bg-[linear-gradient(135deg,#e50914,#ff4d5a)] text-white text-[11px] font-bold tracking-wide px-3 py-1.5 rounded-full shadow-[0_4px_14px_rgba(229,9,20,0.4)]">
          {c.area}
        </span>
      </div>
      <div className="absolute right-3.5 top-3.5 bg-black/55 backdrop-blur-[6px] text-white text-[11px] font-bold px-3 py-1.5 rounded-full border border-white/10">
        {c.screen}
      </div>

      <div className="absolute left-4 right-4 bottom-4 flex flex-col gap-2.5 text-white">
        <div>
          <h3 className="text-xl font-extrabold mb-1 [text-shadow:0_2px_10px_rgba(0,0,0,0.6)]">{c.name}</h3>
          <p className="flex items-center gap-1.5 text-[13px] text-white/80">
            <MapPin size={13} className="text-brand shrink-0" /> {c.location}
          </p>
        </div>
        {c.features.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {c.features.map((f) => (
              <span key={f} className="text-[10px] font-bold text-white/85 bg-white/10 backdrop-blur-[4px] border border-white/15 px-2 py-1 rounded-md">
                {f}
              </span>
            ))}
          </div>
        )}
        <div className="pt-1 flex items-center justify-between">
          {c.hours ? (
            <span className="flex items-center gap-1.5 text-[12px] text-white/70">
              <Clock size={12} className="text-brand" /> {c.hours}
            </span>
          ) : (
            <span />
          )}
          <Link
            to="/now-showing"
            className="inline-flex items-center gap-1.5 bg-brand hover:bg-brand-hover text-white text-[12px] font-bold px-3.5 py-2 rounded-full transition-all shadow-[0_4px_14px_rgba(229,9,20,0.35)] no-underline"
          >
            <Ticket size={13} /> {t("nav.book")}
          </Link>
        </div>
      </div>
    </div>
  );
}