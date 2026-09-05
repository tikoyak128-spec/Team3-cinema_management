import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  navLinks,
  slideImages,
  nowShowing,
  comingSoon,
  promotions,
  cinemas,
} from "../data/cinemaData";
import styles from "../styles/homeStyles";
import { ArrowRight, Clapperboard, MapPin, Play } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Home() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("now-showing");
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef(null);
  const timerRef = useRef(null);

  const totalSlides = slideImages.length;

  const goToNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const goToPrev = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  useEffect(() => {
    timerRef.current = setInterval(goToNext, 3500);
    return () => clearInterval(timerRef.current);
  }, [goToNext]);

  const handleSliderEnter = () => clearInterval(timerRef.current);
  const handleSliderLeave = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(goToNext, 3500);
  };

  const movieList = activeTab === "now-showing" ? nowShowing : comingSoon;

  return (
    <div className="home-page">
      <style>{styles}</style>

      {/* ===== HEADER / NAVBAR ===== */}
      <Navbar />

      {/* ===== HERO BANNER ===== */}
      <section className="home-hero">
        <div className="home-hero-bg" />
        <div className="home-hero-overlay" />
        <div className="home-hero-content">
          <span className="home-hero-badge">Now Playing</span>
          <h1 className="home-hero-title">Experience Cinema<br />Like Never Before</h1>
          <p className="home-hero-subtitle">
            Book your tickets online and enjoy the latest blockbusters in the
            heart of Phnom Penh.
          </p>
          <div className="home-hero-actions">
            <button
              className="home-btn home-btn-primary"
              onClick={() => navigate("/showtimes")}
            >
              Book Tickets
            </button>
            <button
              className="home-btn home-btn-ghost"
              onClick={() => navigate("/coming-soon")}
            >
              Coming Soon
            </button>
          </div>
        </div>
      </section>

      {/* ===== ABOUT SECTION ===== */}
      <section className="home-section home-about" id="about">
        <div className="home-about-inner">
          <div className="home-about-text">
            <span className="home-about-badge">About Us</span>
            <h2 className="home-about-title">
              Cambodia's Premier<br />Cinema Experience
            </h2>
            <p className="home-about-desc">
              Since 2015, Khmer Cinema has been the leading cinema chain in Cambodia,
              delivering world-class entertainment to audiences across the nation. With
              cutting-edge technology, comfortable seating, and an unmatched selection
              of local and international films, we bring stories to life on the big screen.
            </p>
            <div className="home-about-stats">
              <div className="home-about-stat">
                <span className="home-about-stat-num">50+</span>
                <span className="home-about-stat-label">Halls Nationwide</span>
              </div>
              <div className="home-about-stat">
                <span className="home-about-stat-num">1M+</span>
                <span className="home-about-stat-label">Happy Customers</span>
              </div>
              <div className="home-about-stat">
                <span className="home-about-stat-num">200+</span>
                <span className="home-about-stat-label">Movies Per Year</span>
              </div>
            </div>
          </div>
          <div className="home-about-visual">
            <div className="home-about-img-wrap">
              <img
                className="home-about-img"
                src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&h=400&fit=crop"
                alt="Khmer Cinema"
              />
              <div className="home-about-img-accent" />
            </div>
          </div>
        </div>
      </section>

      {/* ===== IMAGE SLIDER ===== */}
      <section className="home-section home-slider-section">
        <div className="home-section-head">
          <h2 className="home-section-title">Our Cinemas in Action</h2>
        </div>
        <div className="home-slider" ref={sliderRef} onMouseEnter={handleSliderEnter} onMouseLeave={handleSliderLeave}>
          <div
            className="home-slider-track"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {slideImages.map((slide, idx) => (
              <div className="home-slider-slide" key={idx}>
                <img className="home-slider-img" src={slide.src} alt={slide.alt} />
                <div className="home-slider-overlay" />
                <div className="home-slider-caption">
                  <p>{slide.caption}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="home-slider-btn prev" onClick={goToPrev}>‹</button>
          <button className="home-slider-btn next" onClick={goToNext}>›</button>
          <div className="home-slider-dots">
            {slideImages.map((_, idx) => (
              <button
                key={idx}
                className={`home-slider-dot ${idx === currentSlide ? "active" : ""}`}
                onClick={() => setCurrentSlide(idx)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ===== NOW SHOWING / COMING SOON ===== */}
      <section className="home-section" id="showtimes">
        <div className="home-section-head">
          <h2 className="home-section-title">Now Showing</h2>
          <div className="home-tabs">
            <button
              className={`home-tab ${activeTab === "now-showing" ? "active" : ""}`}
              onClick={() => setActiveTab("now-showing")}
            >
              Now Showing
            </button>
            <button
              className={`home-tab ${activeTab === "coming-soon" ? "active" : ""}`}
              onClick={() => setActiveTab("coming-soon")}
            >
              Coming Soon
            </button>
          </div>
        </div>

        <div className="home-movie-grid">
          {movieList.map((movie) => (
            <div className="home-movie-card" key={movie.title}>
              <div className="home-movie-poster-wrap">
                <img
                  className="home-movie-poster"
                  src={movie.poster}
                  alt={movie.title}
                  loading="lazy"
                />
                <span className="home-movie-rating">{movie.rating}</span>
              </div>
              <div className="home-movie-info">
                <h3 className="home-movie-title">{movie.title}</h3>
                <p className="home-movie-genre">{movie.genre}</p>
                <p className="home-movie-date">Release: {movie.date}</p>
                <div className="home-movie-actions">
                  <button
                    className="home-movie-btn play"
                    onClick={() => navigate(`/watch/${encodeURIComponent(movie.title)}`)}
                    title="Watch trailer"
                  >
                    <Play size={14} /> Watch
                  </button>
                  <button
                    className="home-movie-btn"
                    onClick={() => navigate(`/booking/${encodeURIComponent(movie.title)}`)}
                  >
                    Get Tickets
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== COMING SOON ANCHOR ===== */}
      <span id="coming-soon" />

      {/* ===== CINEMAS ===== */}
      <section className="home-section home-cinemas" id="cinemas">
        <div className="home-section-head">
          <h2 className="home-section-title">Our Cinemas</h2>
          <p className="home-section-subtitle">
            Conveniently located throughout Cambodia, near you.
          </p>
        </div>
        <div className="home-cinema-grid">
          {cinemas.map((cinema) => (
            <div className="home-cinema-card" key={cinema.name}>
              <img className="home-cinema-img" src={cinema.image} alt={cinema.name} />
              <div className="home-cinema-overlay" />
              <span className="home-cinema-tag">{cinema.area}</span>
              <div className="home-cinema-content">
                <h3 className="home-cinema-name">{cinema.name}</h3>
                <p className="home-cinema-location">
                  <MapPin size={14} /> {cinema.location}
                </p>
                <p className="home-cinema-seats">{cinema.seats}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== PROMOTIONS ===== */}
      <section className="home-section" id="promotions">
        <div className="home-section-head">
          <h2 className="home-section-title">What's New?</h2>
        </div>
        <div className="home-promo-grid">
          {promotions.map((promo) => (
            <div className="home-promo-card" key={promo.title}>
              {promo.isImage ? (
                <img className="home-promo-icon-img" src={promo.icon} alt={promo.title} />
              ) : (
                <div className="home-promo-icon">
                  <FontAwesomeIcon icon={promo.icon} />
                </div>
              )}
              <span className="home-promo-tag">{promo.tag}</span>
              <h3 className="home-promo-title">{promo.title}</h3>
              <p className="home-promo-text">{promo.text}</p>
              <a href="#" className="home-promo-link">
                Learn More <ArrowRight size={14} />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="home-footer">
        <div className="home-footer-inner">
          <div className="home-footer-brand">
            <div className="home-logo">
              <span className="home-logo-icon"><Clapperboard size={26} /></span>
              <span className="home-logo-text">KHMER <b>CINEMA</b></span>
            </div>
            <p className="home-footer-desc">
              Your premier cinema destination in Cambodia. Book, watch, and enjoy.
            </p>
          </div>
          <div className="home-footer-col">
            <h4 className="home-footer-heading">Quick Links</h4>
            {navLinks.map((link) => (
              <Link key={link.label} className="home-footer-link" to={link.to}>
                {link.label}
              </Link>
            ))}
          </div>
          <div className="home-footer-col">
            <h4 className="home-footer-heading">Account</h4>
            <Link className="home-footer-link" to="/login">
              Sign In
            </Link>
            <Link className="home-footer-link" to="/register">
              Create Account
            </Link>
          </div>
          <div className="home-footer-col">
            <h4 className="home-footer-heading">Contact</h4>
            <p className="home-footer-meta">info@khmercinema.com</p>
            <p className="home-footer-meta">+855 23 000 000</p>
            <p className="home-footer-meta">Phnom Penh, Cambodia</p>
          </div>
        </div>
        <div className="home-footer-bottom">
          © 2026 Khmer Cinema. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
