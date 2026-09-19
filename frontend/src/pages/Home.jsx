import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { usePrefs } from "../context/PrefsContext";
import MovieCard from "../components/MovieCard";
import CinemaCard from "../components/CinemaCard";
import CustomerFeedback from "../components/CustomerFeedback";
import { cinemas as fallbackCinemas } from "../data/cinemaData";
import { normalizeCinema, defaultCinemaImage } from "../utils/cinemaFormat";
import { normalizeMovie, nowShowingOf, comingSoonOf } from "../utils/movieFormat";
import api from "../api/client";
import { Play, X, ZoomIn, Ticket } from "lucide-react";

const galleryImages = [
  { src: "https://www.areacambodia.com/wp-content/uploads/2023/09/Major%E2%80%8B-Cineplex-Siem-Reap-Movie-Theater-in-Siem-Reap-on-Sivutha-Road.jpg", alt: "Cinema Hall Interior", caption: "Premium Cinema Halls" },
  { src: "https://cambodiainvestmentreview.com/wp-content/uploads/2023/10/Capture4.jpg", alt: "Movie Screen", caption: "Immersive Big Screen" },
  { src: "https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=800&h=600&fit=crop", alt: "Cinema Lobby", caption: "Elegant Lobby Area" },
  { src: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&h=600&fit=crop", alt: "Classic Cinema", caption: "Timeless Cinema Vibes" },
  { src: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=1000&fit=crop", alt: "Film Production", caption: "Behind The Scenes" },
  { src: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=600&fit=crop", alt: "Cinema Audience", caption: "Unforgettable Moments" },
];

export default function Home() {
  const navigate = useNavigate();
  const { t } = usePrefs();
  const [activeTab, setActiveTab] = useState("now-showing");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroFading, setHeroFading] = useState(false);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState(null);
  const [dbCinemas, setDbCinemas] = useState([]);
  const [dbMovies, setDbMovies] = useState([]);
  const timerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get("/cinemas")
      .then((res) => {
        if (cancelled) return;
        const list = res.data;
        if (Array.isArray(list) && list.length > 0) setDbCinemas(list);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    api
      .get("/movies")
      .then((res) => {
        if (cancelled) return;
        const list = (Array.isArray(res.data) ? res.data : []).map(normalizeMovie);
        if (list.length > 0) setDbMovies(list);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const toDisplay = (c) => normalizeCinema(c, t);
  const list = dbCinemas.length > 0 ? dbCinemas.map(toDisplay) : fallbackCinemas;
  const slides = list.map((c) => ({
    src: c.image || defaultCinemaImage,
    caption: [c.name, c.area].filter(Boolean).join(" · "),
  }));
  const totalSlides = slides.length;

  const nowList = nowShowingOf(dbMovies);
  const soonList = comingSoonOf(dbMovies);
  const movieList = activeTab === "now-showing" ? nowList : soonList;
  const heroMovies = nowList.length > 0 ? nowList : soonList;

  const goToNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  useEffect(() => {
    timerRef.current = setInterval(goToNext, 3500);
    return () => clearInterval(timerRef.current);
  }, [goToNext]);

  // Hero slideshow auto-advance
  useEffect(() => {
    if (heroMovies.length === 0) return;
    const heroTimer = setInterval(() => {
      setHeroFading(true);
      setTimeout(() => {
        setHeroIndex((prev) => (prev + 1) % heroMovies.length);
        setHeroFading(false);
      }, 500);
    }, 5000);
    return () => clearInterval(heroTimer);
  }, [heroMovies.length]);

  const goToHeroSlide = (idx) => {
    if (idx === heroIndex) return;
    setHeroFading(true);
    setTimeout(() => {
      setHeroIndex(idx);
      setHeroFading(false);
    }, 500);
  };

  const heroMovie = heroMovies[heroIndex];

  return (
    <>
      {/* ===== HERO BANNER - MOVIE SLIDESHOW ===== */}
      {heroMovies.length > 0 && (
      <section className="relative min-h-[85vh] sm:min-h-[88vh] md:min-h-[90vh] lg:min-h-screen flex items-center overflow-hidden bg-[var(--app-page)]">
        {/* Slideshow Backgrounds */}
        {heroMovies.map((movie, idx) => (
          <div
            key={movie.title}
            className={`absolute inset-0 bg-cover bg-center bg-[image:var(--hero-bg)] transition-opacity duration-[1200ms] ease-in-out ${idx === heroIndex ? "opacity-100" : "opacity-0"}`}
            style={{
              "--hero-bg": `url('${movie.poster.replace('/w500/', '/w1920/')}')`,
              animation: idx === heroIndex ? "heroZoom 8s ease-in-out forwards" : "none",
            }}
          />
        ))}

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(5,5,5,0.95),rgba(5,5,5,0.6)_50%,transparent)] z-[1]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,#050505_0%,rgba(5,5,5,0.6)_40%,rgba(0,0,0,0.3)_100%)] z-[1]" />

        {/* Decorative Glows */}
        <div className="absolute top-1/4 left-[10%] sm:left-[15%] w-[160px] h-[160px] sm:w-[320px] sm:h-[320px] md:w-[400px] md:h-[400px] rounded-full bg-[rgba(229,9,20,0.15)] blur-[80px] sm:blur-[100px] md:blur-[120px] pointer-events-none z-[1]" />
        <div className="absolute bottom-1/3 right-[5%] sm:right-[10%] w-[140px] h-[140px] sm:w-[240px] sm:h-[240px] md:w-[300px] md:h-[300px] rounded-full bg-[rgba(237,195,143,0.12)] blur-[60px] sm:blur-[80px] md:blur-[100px] pointer-events-none z-[1]" />

        {/* Content */}
        <div className="relative z-[2] w-full max-w-[1024px] mx-auto px-5 sm:px-6 lg:px-8 pt-16 sm:pt-20 md:pt-28 lg:pt-32 pb-20 sm:pb-24 md:pb-24">
          <h1 className={`text-[26px] min-[400px]:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.08] tracking-tight text-balance mb-3 sm:mb-4 text-white transition-all duration-500 delay-75 ${heroFading ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}`}>{heroMovie.title}</h1>

          <div className={`flex flex-wrap items-center gap-x-2 sm:gap-x-3 md:gap-x-4 gap-y-1.5 sm:gap-y-2 mb-3 sm:mb-4 md:mb-5 transition-all duration-500 delay-150 ${heroFading ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}`}>
            <span className="text-sm sm:text-base md:text-lg text-[#c9c9c9] font-medium">{heroMovie.genre}</span>
            <span className="inline-flex items-center gap-1 bg-brand/20 border border-brand/40 text-brand text-xs sm:text-sm font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg">★ {heroMovie.rating}</span>
            <span className="text-xs sm:text-sm text-[var(--app-mute)]">{heroMovie.date}</span>
          </div>

          <p className={`text-sm sm:text-base md:text-lg text-[var(--app-mute)] max-w-[540px] leading-relaxed mb-6 sm:mb-7 md:mb-9 transition-all duration-500 delay-200 ${heroFading ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}`}>
            {t("home.heroTagline")}
          </p>

          <div className={`flex flex-col sm:flex-row flex-wrap gap-2.5 sm:gap-3 md:gap-4 mb-7 sm:mb-9 md:mb-11 transition-all duration-500 delay-250 ${heroFading ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}`}>
            <button
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto bg-brand hover:bg-brand-hover text-white font-bold text-sm sm:text-[15px] px-6 sm:px-7 md:px-8 py-3.5 rounded-full transition-all duration-200 shadow-[0_8px_24px_rgba(229,9,20,0.4)] hover:-translate-y-0.5 cursor-pointer"
              onClick={() => navigate(`/watch/${encodeURIComponent(heroMovie.title)}`)}
            >
              <Play size={18} fill="white" /> {t("home.watchTrailer")}
            </button>
            <button
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto bg-transparent border border-white/30 hover:bg-white/10 text-white font-bold text-sm sm:text-[15px] px-6 sm:px-7 md:px-8 py-3.5 rounded-full transition-all duration-200 cursor-pointer"
              onClick={() => navigate(`/booking/${encodeURIComponent(heroMovie.title)}`)}
            >
              {t("home.getTickets")}
            </button>
          </div>

          <div className={`flex flex-wrap items-center gap-x-4 sm:gap-x-6 md:gap-x-7 gap-y-3 sm:gap-y-4 transition-all duration-500 delay-250 ${heroFading ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}`}>
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-xl sm:text-2xl md:text-3xl font-black text-white">4K</span>
              <span className="text-[9px] sm:text-[10px] text-[var(--app-mute)] font-semibold uppercase tracking-wider">{t("home.screens")}</span>
            </div>
            <div className="w-px h-6 sm:h-8 bg-white/15" />
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-xl sm:text-2xl md:text-3xl font-black text-white">7.1</span>
              <span className="text-[9px] sm:text-[10px] text-[var(--app-mute)] font-semibold uppercase tracking-wider">Dolby Atmos</span>
            </div>
            <div className="w-px h-6 sm:h-8 hidden sm:block bg-white/15" />
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-xl sm:text-2xl md:text-3xl font-black text-white">100%</span>
              <span className="text-[9px] sm:text-[10px] text-[var(--app-mute)] font-semibold uppercase tracking-wider">{t("home.onlineBooking")}</span>
            </div>
          </div>
        </div>

        {/* Bottom Navigation Dots */}
        <div className="absolute bottom-5 sm:bottom-8 md:bottom-10 left-1/2 -translate-x-1/2 z-[2] flex items-center gap-1.5 sm:gap-2">
          {heroMovies.map((movie, idx) => (
            <button
              key={movie.title}
              className={`rounded-full cursor-pointer transition-all duration-300 relative ${idx === heroIndex ? "w-6 sm:w-8 md:w-10 h-2 sm:h-2.5 bg-brand" : "w-2 h-2 sm:w-2.5 sm:h-2.5 bg-white/25 hover:bg-white/50"}`}
              onClick={() => goToHeroSlide(idx)}
              aria-label={`Go to ${movie.title}`}
            >
              {idx === heroIndex && <span className="absolute inset-0 bg-brand/40 rounded-full animate-ping" />}
            </button>
          ))}
        </div>
      </section>
      )}

      <section className="max-w-[1024px] mx-auto px-5 sm:px-6 lg:px-8 py-14 sm:py-16 md:py-20 scroll-mt-20" id="about">
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-8 sm:gap-10 lg:gap-16 items-center">
          <div>
           <h2 className="text-[24px] sm:text-3xl md:text-[42px] font-black leading-[1.15] mb-4">
              {t("home.aboutTitle")}
            </h2>
            <p className="text-sm sm:text-[15px] leading-relaxed text-[var(--app-mute)] mb-6 sm:mb-7">
              {t("home.aboutText")}
            </p>
            <div className="flex gap-5 sm:gap-6 md:gap-8 flex-wrap">
              <div className="flex flex-col gap-1">
                <span className="text-[26px] sm:text-[30px] md:text-[32px] font-black bg-[linear-gradient(135deg,#e50914,#ff6b6b)] bg-clip-text text-transparent">50+</span>
                <span className="text-xs sm:text-[13px] text-[var(--app-mute)] font-semibold">{t("home.hallsNationwide")}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[26px] sm:text-[30px] md:text-[32px] font-black bg-[linear-gradient(135deg,#e50914,#ff6b6b)] bg-clip-text text-transparent">1M+</span>
                <span className="text-xs sm:text-[13px] text-[var(--app-mute)] font-semibold">{t("home.happyCustomers")}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[26px] sm:text-[30px] md:text-[32px] font-black bg-[linear-gradient(135deg,#e50914,#ff6b6b)] bg-clip-text text-transparent">200+</span>
                <span className="text-xs sm:text-[13px] text-[var(--app-mute)] font-semibold">{t("home.moviesPerYear")}</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="relative">
              <img
                className="w-full h-[220px] sm:h-[280px] md:h-[380px] object-cover rounded-xl sm:rounded-2xl relative z-[2] shadow-[0_24px_50px_rgba(0,0,0,0.6)]"
                src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&h=400&fit=crop"
                alt="Khmer Cinema"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(229,9,20,0.15),transparent_60%)] translate-x-2 translate-y-2 sm:translate-x-3 sm:translate-y-3 md:translate-x-4 md:translate-y-4 z-[1] rounded-xl sm:rounded-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* ===== IMAGE SLIDER ===== */}
      <section className="max-w-[1024px] mx-auto px-5 sm:px-6 lg:px-8 pt-0 pb-14 sm:pb-16 md:pb-20">
        <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold">{t("home.cinemaAction")}</h2>
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

      {/* ===== GALLERY ===== */}
      <section className="max-w-[1024px] mx-auto px-5 sm:px-6 lg:px-8 py-14 sm:py-16 md:py-20 scroll-mt-20" id="gallery">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-[42px] font-black leading-[1.15]">
            {t("home.galleryTitle")}
          </h2>
        </div>
        {/* Mobile: 2-col simple grid */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:hidden">
          {galleryImages.map((img, idx) => (
            <div
              key={idx}
              className="relative rounded-xl overflow-hidden cursor-pointer group aspect-[4/3]"
              onClick={() => setSelectedGalleryImage(img)}
            >
              <img className="w-full h-full object-cover block transition-transform duration-500 group-hover:scale-110" src={img.src} alt={img.alt} loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-10 h-10 rounded-full bg-brand/90 flex items-center justify-center shadow-[0_4px_20px_rgba(229,9,20,0.5)] scale-75 group-hover:scale-100 transition-transform duration-300">
                  <ZoomIn size={18} className="text-white" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-xs font-bold text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.6)]">{img.caption}</p>
              </div>
            </div>
          ))}
        </div>
        {/* Tablet & Desktop: 3-col masonry that fills the space */}
        <div className="hidden md:grid grid-cols-3 gap-4 lg:gap-5" style={{ gridAutoRows: "395px" }}>
          {/* Col 1: two normal images */}
          <div className="grid grid-rows-2 gap-4 lg:gap-5">
            {[galleryImages[0], galleryImages[1]].map((img, i) => (
              <div
                key={i}
                className="relative rounded-2xl overflow-hidden cursor-pointer group"
                onClick={() => setSelectedGalleryImage(img)}
              >
                <img className="w-full h-full object-cover block transition-transform duration-500 group-hover:scale-110" src={img.src} alt={img.alt} loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-12 h-12 rounded-full bg-brand/90 flex items-center justify-center shadow-[0_4px_20px_rgba(229,9,20,0.5)] scale-75 group-hover:scale-100 transition-transform duration-300">
                    <ZoomIn size={20} className="text-white" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-sm font-bold text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.6)]">{img.caption}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Col 2: one tall image spanning full height */}
          <div
            className="relative rounded-2xl overflow-hidden cursor-pointer group"
            style={{ gridRow: "1" }}
            onClick={() => setSelectedGalleryImage(galleryImages[2])}
          >
            <img className="w-full h-full object-cover block transition-transform duration-500 group-hover:scale-110" src={galleryImages[2].src} alt={galleryImages[2].alt} loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-14 h-14 rounded-full bg-brand/90 flex items-center justify-center shadow-[0_4px_20px_rgba(229,9,20,0.5)] scale-75 group-hover:scale-100 transition-transform duration-300">
                <ZoomIn size={24} className="text-white" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <p className="text-base font-bold text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.6)]">{galleryImages[2].caption}</p>
            </div>
          </div>
          {/* Col 3: two normal images */}
          <div className="grid grid-rows-2 gap-4 lg:gap-5">
            {[galleryImages[3], galleryImages[4]].map((img, i) => (
              <div
                key={i}
                className="relative rounded-2xl overflow-hidden cursor-pointer group"
                onClick={() => setSelectedGalleryImage(img)}
              >
                <img className="w-full h-full object-cover block transition-transform duration-500 group-hover:scale-110" src={img.src} alt={img.alt} loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-12 h-12 rounded-full bg-brand/90 flex items-center justify-center shadow-[0_4px_20px_rgba(229,9,20,0.5)] scale-75 group-hover:scale-100 transition-transform duration-300">
                    <ZoomIn size={20} className="text-white" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-sm font-bold text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.6)]">{img.caption}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Lightbox */}
      {selectedGalleryImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-[fadeIn_0.2s_ease]"
          onClick={() => setSelectedGalleryImage(null)}
        >
          <button
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-brand hover:border-brand transition-all cursor-pointer z-10"
            onClick={() => setSelectedGalleryImage(null)}
          >
            <X size={20} />
          </button>
          <img
            className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] animate-[scaleIn_0.25s_ease]"
            src={selectedGalleryImage.src}
            alt={selectedGalleryImage.alt}
            onClick={(e) => e.stopPropagation()}
          />
          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm sm:text-base font-bold text-white bg-black/50 backdrop-blur-sm px-5 py-2.5 rounded-full border border-white/10">
            {selectedGalleryImage.caption}
          </p>
        </div>
      )}

      {/*  NOW SHOWING / COMING SOON */}
      <section className="max-w-[1024px] mx-auto px-5 sm:px-6 lg:px-8 py-14 sm:py-16 md:py-20 scroll-mt-20" id="showtimes">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7 sm:mb-8 md:mb-10">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold">{t("nav.nowShowing")}</h2>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex w-full sm:w-auto bg-[var(--app-panel2)] border border-[var(--app-edge)] rounded-full p-1 gap-1">
              <button
                className={`flex-1 sm:flex-none text-[13px] font-bold px-4 sm:px-5 py-2.5 rounded-full text-[var(--app-mute)] transition-all cursor-pointer ${activeTab === "now-showing" ? "bg-brand text-white shadow-[0_4px_14px_rgba(229,9,20,0.35)]" : ""}`}
                onClick={() => setActiveTab("now-showing")}
              >
                {t("nav.nowShowing")}
              </button>
              <button
                className={`flex-1 sm:flex-none text-[13px] font-bold px-4 sm:px-5 py-2.5 rounded-full text-[var(--app-mute)] transition-all cursor-pointer ${activeTab === "coming-soon" ? "bg-brand text-white shadow-[0_4px_14px_rgba(229,9,20,0.35)]" : ""}`}
                onClick={() => setActiveTab("coming-soon")}
              >
                {t("nav.comingSoon")}
              </button>
            </div>
            <button
              onClick={() => navigate(activeTab === "now-showing" ? "/now-showing" : "/coming-soon")}
              className="inline-flex items-center gap-1 text-brand text-sm font-bold hover:underline cursor-pointer border-none bg-transparent p-0"
            >
              {t("home.viewAllMovies")} →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4  gap-2 sm:gap-3 md:gap-4 lg:gap-5 mx-auto">
          {movieList.slice(0, 4).map((movie) => (
            <MovieCard key={movie.id ?? movie.title} movie={movie} />
          ))}
        </div>
      </section>

      {/* ===== COMING SOON ANCHOR ===== */}
      <span id="coming-soon" />

      {/* ===== CINEMAS ===== */}
      <section className="max-w-[1024px] mx-auto px-5 sm:px-6 lg:px-8 py-14 sm:py-16 md:py-20 scroll-mt-20" id="cinemas">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 mb-7 sm:mb-8 md:mb-10">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold">{t("home.ourCinemas")}</h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <p className="text-xs sm:text-sm text-[var(--app-mute)]">{t("home.cinemasNote")}</p>
            <button
              onClick={() => navigate("/cinemas")}
              className="inline-flex items-center gap-1 text-brand text-sm font-bold hover:underline cursor-pointer border-none bg-transparent p-0"
            >
              {t("home.viewAllCinemas")} →
            </button>
          </div>
        </div>
        {dbCinemas.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            {dbCinemas.slice(0, 3).map((cinema) => (
              <CinemaCard key={cinema.id} cinema={cinema} />
            ))}
          </div>
        )}
      </section>

      {/* ===== WHAT OUR CUSTOMERS SAY + FEEDBACK ===== */}
      <CustomerFeedback movies={dbMovies} />

      {/* ===== PROMOTION POSTER ===== */}
      <section className="max-w-[1024px] mx-auto px-5 sm:px-6 lg:px-8 pb-16 md:pb-20">
        <div className="relative overflow-hidden rounded-3xl border border-[var(--app-edge)] min-h-[320px] sm:min-h-[360px] flex items-stretch">
          <img
            className="absolute inset-0 w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=1400&h=700&fit=crop"
            alt="50% off"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(13,13,13,0.95)_0%,rgba(13,13,13,0.7)_45%,rgba(13,13,13,0.25)_100%)]" />
          <div className="relative z-10 flex flex-col items-start justify-center gap-4 p-8 sm:p-12 md:p-16 max-w-[560px]">
            <span className="inline-flex items-center gap-2 bg-brand text-white text-[11px] font-bold uppercase tracking-[2px] px-3.5 py-1.5 rounded-full">
              {t("home.promoPosterBadge")}
            </span>
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-black leading-none tracking-tight text-white">
              {t("home.promoPosterTitle")}
            </h2>
            <p className="text-sm sm:text-base text-white/80 leading-relaxed">
              {t("home.promoPosterDesc")}
            </p>
            <button
              onClick={() => navigate("/promotions")}
              className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-white text-sm font-bold px-7 py-3.5 rounded-full transition-all shadow-[0_4px_16px_rgba(229,9,20,0.35)] cursor-pointer border-none"
            >
              {t("home.promoPosterCta")} <span aria-hidden>→</span>
            </button>
          </div>
        </div>
      </section>
    </>
  );
}