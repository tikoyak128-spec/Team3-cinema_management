import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import HeroBanner from "../components/HeroBanner";
import CinemaCard from "../components/CinemaCard";
import { normalizeCinema, defaultCinemaImage } from "../utils/cinemaFormat";
import { cinemas as fallbackCinemas } from "../data/cinemaData";
import api from "../api/client";
import { usePrefs } from "../context/PrefsContext";
import {
  Phone,
  Clock,
  Armchair,
  Sparkles,
  Wifi,
  Coffee,
  Baby,
  Car,
  Navigation,
  Ticket,
  Building2,
  CalendarCheck,
  Users,
  MapPin,
} from "lucide-react";

const amenities = [
  { icon: Armchair, labelKey: "amenityRecliner" },
  { icon: Sparkles, labelKey: "amenityLaser" },
  { icon: Wifi, labelKey: "amenityWifi" },
  { icon: Coffee, labelKey: "amenityCafe" },
  { icon: Baby, labelKey: "amenityFamily" },
  { icon: Car, labelKey: "amenityParking" },
];

function FeaturedCinema({ cinema }) {
  const { t } = usePrefs();
  return (
    <div className="group overflow-hidden rounded-3xl border border-[var(--app-edge)] bg-[linear-gradient(135deg,var(--app-panel),var(--app-panel2))] transition-all hover:border-brand/40 hover:shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
      <div className="grid grid-cols-1 md:grid-cols-[1.15fr_1fr]">
        <div className="relative min-h-[260px] md:min-h-[340px] overflow-hidden">
          <img
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[700ms] group-hover:scale-105"
            src={cinema.image}
            alt={cinema.name}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[rgba(13,13,13,0.9)] max-md:bg-[linear-gradient(0deg,rgba(13,13,13,0.9)_0%,transparent_60%)]" />
          <span className="absolute top-4 left-4 bg-brand text-white text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-[0_4px_14px_rgba(229,9,20,0.4)]">
            {t("cinemas.flagship")}
          </span>
        </div>

        <div className="relative p-6 sm:p-8 flex flex-col justify-center gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {cinema.area && (
              <span className="text-[11px] font-bold text-brand uppercase tracking-wider bg-brand/10 border border-brand/25 px-2.5 py-1 rounded-full">
                {cinema.area}
              </span>
            )}
            <span className="text-[11px] font-bold text-[var(--app-mute)] uppercase tracking-wider bg-[var(--app-fill)] border border-[var(--app-edge)] px-2.5 py-1 rounded-full">
              {cinema.screen}
            </span>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-black mb-2">{cinema.name}</h2>
            {cinema.tagline && <p className="text-brand font-bold text-sm">{cinema.tagline}</p>}
          </div>

          <div className="flex flex-col gap-2 text-[13px] text-[var(--app-ink2)]">
            <p className="flex items-center gap-2"><MapPin size={15} className="text-brand shrink-0" /> {cinema.location}</p>
            <p className="flex items-center gap-2"><Clock size={15} className="text-brand shrink-0" /> {cinema.hours || "—"} · {cinema.seats}</p>
            {cinema.phone && <p className="flex items-center gap-2"><Phone size={15} className="text-brand shrink-0" /> {cinema.phone}</p>}
          </div>

          {cinema.features.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {cinema.features.map((f) => (
                <span key={f} className="text-[11px] font-bold text-[var(--app-ink2)] bg-[var(--app-fill)] border border-[var(--app-edge)] px-2.5 py-1 rounded-lg">
                  {f}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 flex-wrap pt-1">
            <Link
              to="/now-showing"
              className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-white text-sm font-bold px-6 py-3 rounded-full transition-all shadow-[0_4px_16px_rgba(229,9,20,0.35)] no-underline"
            >
              <Ticket size={15} /> {t("cinemas.bookTickets")}
            </Link>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(cinema.name + " Cambodia")}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-[var(--app-fill)] hover:bg-[var(--app-fill2)] border border-[var(--app-edge)] text-[var(--app-ink)] text-sm font-bold px-6 py-3 rounded-full transition-all no-underline"
            >
              <Navigation size={15} /> {t("cinemas.getDirections")}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Cinemas() {
  const { t } = usePrefs();
  const [rawCinemas, setRawCinemas] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get("/cinemas")
      .then((res) => {
        if (cancelled) return;
        const list = res.data;
        if (Array.isArray(list) && list.length > 0) {
          setRawCinemas(list);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const toDisplay = (c) => normalizeCinema(c, t);

  const list = rawCinemas.length > 0 ? rawCinemas.map(toDisplay) : fallbackCinemas;

  const totalHalls = list.reduce((sum, c) => sum + (typeof c.screen_count === "number" ? c.screen_count : parseInt(c.screen, 10) || 0), 0);
  const totalSeats = list.reduce((sum, c) => sum + (typeof c.seats_count === "number" ? c.seats_count : parseInt(c.seats, 10) || 0), 0);

  const stats = [
    { icon: Building2, value: String(list.length), labelKey: "cinemas.statLocations" },
    { icon: CalendarCheck, value: `${totalHalls}+`, labelKey: "cinemas.statHalls" },
    { icon: Users, value: `${totalSeats.toLocaleString()}+`, labelKey: "cinemas.statSeats" },
    { icon: Ticket, value: "24/7", labelKey: "home.onlineBooking" },
  ];

  const slides = list.map((c) => ({
    src: c.image || defaultCinemaImage,
    caption: [c.name, c.area].filter(Boolean).join(" · "),
  }));

  const totalSlides = slides.length;

  const goToNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  useEffect(() => {
    timerRef.current = setInterval(goToNext, 3500);
    return () => clearInterval(timerRef.current);
  }, [goToNext]);

  const featured = list[0];
  const rest = list.slice(1);

  return (
    <>
      <HeroBanner
        badge={t("cinemas.heroBadge")}
        title={t("nav.cinemas")}
        desc={t("cinemas.heroDesc")}
      />

      {/* Stats strip */}
      <section className="max-w-[1280px] mx-auto px-5 sm:px-6 lg:px-8 pt-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.labelKey}
              className="flex items-center gap-4 bg-[linear-gradient(135deg,var(--app-panel),var(--app-panel2))] border border-[var(--app-edge)] rounded-2xl p-5 transition-all hover:-translate-y-0.5 hover:border-brand/40"
            >
              <div className="w-12 h-12 rounded-xl bg-brand/15 flex items-center justify-center shrink-0">
                <stat.icon size={22} className="text-brand" />
              </div>
              <div>
                <div className="text-2xl font-black leading-none">{stat.value}</div>
                <div className="text-xs text-[var(--app-mute)] font-semibold mt-1">{t(stat.labelKey)}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Image slider */}
      <section className="max-w-[1280px] mx-auto px-5 sm:px-6 lg:px-8 pt-12">
        <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold">{t("home.cinemaAction")}</h2>
          </div>
          <p className="text-sm text-[var(--app-mute)] max-w-[360px]">
            {t("cinemas.sliderNote")}
          </p>
        </div>

        <div className="relative w-full overflow-hidden rounded-[20px] aspect-video md:aspect-[21/8] shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
          <div
            className="flex h-full translate-x-[var(--slide-x)] transition-transform duration-[700ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
            style={{ "--slide-x": `-${currentSlide * 100}%` }}
          >
            {slides.map((slide, idx) => (
              <div className="relative flex-[0_0_100%] h-full" key={idx}>
                <img className="w-full h-full object-cover block" src={slide.src} alt={slide.caption} loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 p-5 sm:p-7 z-[2] flex items-center gap-3">
                  <span className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-brand text-white shadow-[0_4px_14px_rgba(229,9,20,0.45)]">
                    <Ticket size={18} />
                  </span>
                  <p className="text-base sm:text-xl font-extrabold text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.6)]">{slide.caption}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="absolute bottom-4 right-6 z-[3] flex gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                className={`w-2.5 h-2.5 rounded-full bg-white/40 cursor-pointer transition-all ${idx === currentSlide ? "bg-brand scale-125" : ""}`}
                onClick={() => setCurrentSlide(idx)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Locations */}
      <section className="max-w-[1280px] mx-auto px-5 sm:px-6 lg:px-8 py-16 md:py-20" id="cinemas">
        <div className="flex items-end justify-between mb-9 flex-wrap gap-4">
          <div>
            <h2 className="text-[28px] md:text-[38px] font-black leading-tight">{t("cinemas.nearYou")}</h2>
          </div>
          <p className="text-sm text-[var(--app-mute)] max-w-[360px]">
            {t("cinemas.locationsNote")}
          </p>
        </div>

        {featured && (
          <div className="flex flex-col gap-6">
            <FeaturedCinema cinema={featured} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map((cinema) => (
                <CinemaCard key={cinema.id || cinema.name} cinema={cinema} />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Amenities */}
      <section className="bg-[var(--app-deep)] border-y border-[var(--app-edge)]">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-6 lg:px-8 py-14 md:py-16">
          <div className="text-center mb-10">
            <h2 className="text-[26px] md:text-[34px] font-black mb-3">{t("cinemas.comfortTitle")}</h2>
            <p className="text-[15px] text-[var(--app-mute)] max-w-[520px] mx-auto">
              {t("cinemas.comfortText")}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {amenities.map((a) => (
              <div
                key={a.labelKey}
                className="flex flex-col items-center gap-3 bg-[linear-gradient(135deg,var(--app-panel),var(--app-panel2))] border border-[var(--app-edge)] rounded-2xl p-6 text-center transition-all hover:-translate-y-1 hover:border-brand/40 group"
              >
                <div className="w-12 h-12 rounded-xl bg-brand/15 flex items-center justify-center transition-all group-hover:bg-brand">
                  <a.icon size={21} className="text-brand group-hover:text-white transition-colors" />
                </div>
                <span className="text-[12px] font-bold text-[var(--app-ink2)] leading-snug">{t(a.labelKey)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-[1280px] mx-auto px-5 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="relative overflow-hidden rounded-3xl border border-[var(--app-edge)] bg-[linear-gradient(135deg,var(--app-panel),var(--app-panel2))] p-10 sm:p-16 text-center">
          <div className="absolute -top-28 -left-28 w-80 h-80 rounded-full bg-[rgba(229,9,20,0.15)] blur-[90px]" />
          <div className="absolute -bottom-28 -right-28 w-80 h-80 rounded-full bg-[rgba(139,92,246,0.1)] blur-[90px]" />
          <div className="relative z-10 flex flex-col items-center gap-5">
            <h2 className="text-[28px] md:text-[40px] font-black leading-tight">
              {t("cinemas.ctaTitle")}
            </h2>
            <p className="text-[15px] text-[var(--app-mute)] max-w-[480px]">
              {t("cinemas.ctaText")}
            </p>
            <Link
              to="/now-showing"
              className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-white text-sm font-bold px-8 py-3.5 rounded-full transition-all shadow-[0_4px_16px_rgba(229,9,20,0.35)] no-underline"
            >
              <Ticket size={15} /> {t("cinemas.browseNowShowing")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}