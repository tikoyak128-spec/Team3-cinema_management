const styles = `
  /* ===== PAGE ===== */
  .home-page {
    font-family: 'Mulish', 'Kantumruy Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: #050505;
    color: #ffffff;
    min-height: 100vh;
    overflow-x: clip;
  }

  .home-page * { box-sizing: border-box; }

  /* ===== HEADER ===== */
  .home-header {
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(5, 5, 5, 0.85);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .home-header-inner {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 24px;
    height: 68px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
  }

  .home-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    flex-shrink: 0;
  }

  .home-logo-icon {
    font-size: 26px;
    display: flex;
    align-items: center;
  }

  .home-logo-icon img {
    width: 64px;
    height: 64px;
    object-fit: contain;
  }

  .home-logo-text {
    font-size: 18px;
    font-weight: 800;
    letter-spacing: 2px;
    white-space: nowrap;
  }

  .home-logo-text b {
    color: #e50914;
  }

  .home-nav {
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 1;
    justify-content: center;
  }

  .home-nav-link {
    background: none;
    border: none;
    color: #cfcfcf;
    font-size: 14px;
    font-weight: 600;
    padding: 8px 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: color 0.2s, background 0.2s;
    white-space: nowrap;
    text-decoration: none;
  }

  .home-nav-link:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.06);
  }

  .home-signin-btn {
    background: #e50914;
    color: #ffffff;
    border: none;
    padding: 10px 22px;
    font-size: 14px;
    font-weight: 700;
    border-radius: 24px;
    cursor: pointer;
    transition: background 0.2s, transform 0.2s;
    box-shadow: 0 4px 14px rgba(229, 9, 20, 0.4);
  }

  .home-signin-btn:hover {
    background: #f40612;
    transform: translateY(-1px);
  }

  .home-header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .home-user-chip {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .home-user-avatar {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: linear-gradient(135deg, #4285f4, #34a853 50%, #fbbc05 100%);
    color: #fff;
    font-size: 15px;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .home-user-name {
    font-size: 13px;
    font-weight: 700;
    color: #e0e0e0;
    max-width: 140px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* ===== SECTION PAGE BANNER ===== */
  .home-page-banner {
    position: relative;
    min-height: 38vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background:
      radial-gradient(ellipse at 20% 30%, rgba(229, 9, 20, 0.35), transparent 60%),
      radial-gradient(ellipse at 80% 20%, rgba(120, 20, 200, 0.25), transparent 55%);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    padding: 0 24px;
    text-align: center;
  }

  .home-page-banner-title {
    font-size: clamp(34px, 6vw, 56px);
    font-weight: 900;
    letter-spacing: 1px;
    text-transform: capitalize;
  }

  /* ===== HERO ===== */
  .home-hero {
    position: relative;
    min-height: 82vh;
    display: flex;
    align-items: center;
    overflow: hidden;
  }

  .home-hero-bg {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse at 20% 30%, rgba(229, 9, 20, 0.35), transparent 60%),
      radial-gradient(ellipse at 80% 20%, rgba(120, 20, 200, 0.25), transparent 55%);
  }

  .home-hero-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, rgba(5, 5, 5, 0.4), #050505 95%);
  }

  .home-hero-content {
    position: relative;
    z-index: 2;
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 48px;
    width: 100%;
  }

  .home-hero-badge {
    display: inline-block;
    background: rgba(229, 9, 20, 0.9);
    color: #ffffff;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    padding: 6px 14px;
    border-radius: 20px;
    margin-bottom: 20px;
  }

  .home-hero-title {
    font-size: clamp(34px, 6vw, 64px);
    font-weight: 900;
    line-height: 1.1;
    letter-spacing: 0.5px;
    margin-bottom: 18px;
  }

  .home-hero-subtitle {
    font-size: 17px;
    color: #c9c9c9;
    max-width: 480px;
    line-height: 1.6;
    margin-bottom: 30px;
  }

  .home-hero-actions {
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
  }

  .home-btn {
    padding: 14px 30px;
    font-size: 15px;
    font-weight: 700;
    border-radius: 30px;
    border: none;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .home-btn-primary {
    background: #e50914;
    color: #ffffff;
    box-shadow: 0 8px 24px rgba(229, 9, 20, 0.4);
  }

  .home-btn-primary:hover {
    transform: translateY(-2px);
  }

  .home-btn-ghost {
    background: transparent;
    color: #ffffff;
    border: 1px solid rgba(255, 255, 255, 0.35);
  }

  .home-btn-ghost:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  /* ===== SECTIONS ===== */
  .home-section {
    max-width: 1280px;
    margin: 0 auto;
    padding: 64px 24px;
  }

  .home-section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 30px;
    flex-wrap: wrap;
    gap: 16px;
  }

  .home-section-title {
    font-size: 28px;
    font-weight: 800;
  }

  .home-section-subtitle {
    font-size: 14px;
    color: #a0a0a0;
  }

  .home-tabs {
    display: flex;
    background: #121212;
    border: 1px solid #232323;
    border-radius: 30px;
    padding: 4px;
    gap: 4px;
  }

  .home-tab {
    background: none;
    border: none;
    color: #a0a0a0;
    padding: 9px 22px;
    font-size: 13px;
    font-weight: 700;
    border-radius: 24px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .home-tab.active {
    background: #e50914;
    color: #ffffff;
  }

  /* ===== MOVIE GRID ===== */
  .home-movie-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 24px;
  }

  .home-movie-card {
    background: #111111;
    border: 1px solid #1f1f1f;
    border-radius: 16px;
    overflow: hidden;
    transition: transform 0.25s, border-color 0.25s, box-shadow 0.25s;
  }

  .home-movie-card:hover {
    transform: translateY(-6px);
    border-color: rgba(229, 9, 20, 0.4);
    box-shadow: 0 16px 30px rgba(0, 0, 0, 0.5);
  }

  .home-movie-poster-wrap {
    position: relative;
    aspect-ratio: 2 / 3;
    overflow: hidden;
  }

  .home-movie-poster {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .home-movie-rating {
    position: absolute;
    top: 10px;
    left: 10px;
    background: rgba(0, 0, 0, 0.75);
    color: #ffffff;
    font-size: 11px;
    font-weight: 800;
    padding: 4px 8px;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.15);
  }

  .home-movie-info {
    padding: 16px;
  }

  .home-movie-title {
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 4px;
    line-height: 1.3;
  }

  .home-movie-genre {
    font-size: 13px;
    color: #a0a0a0;
    margin-bottom: 4px;
  }

  .home-movie-date {
    font-size: 12px;
    color: #e50914;
    font-weight: 600;
    margin-bottom: 14px;
  }

  .home-movie-actions {
    display: flex;
    gap: 8px;
  }

  .home-movie-btn {
    flex: 1;
    background: transparent;
    border: 1px solid #333333;
    color: #ffffff;
    padding: 10px;
    font-size: 13px;
    font-weight: 700;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .home-movie-btn:hover {
    background: #e50914;
    border-color: #e50914;
  }

  .home-movie-btn.play {
    background: #e50914;
    border-color: #e50914;
    color: #fff;
  }

  .home-movie-btn.play:hover {
    background: #f40612;
  }

  /* ===== ABOUT ===== */
  .home-about-inner {
    display: grid;
    grid-template-columns: 1.2fr 1fr;
    gap: 48px;
    align-items: center;
  }

  .home-about-badge {
    display: inline-block;
    background: rgba(229, 9, 20, 0.15);
    color: #e50914;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    padding: 6px 14px;
    border-radius: 20px;
    margin-bottom: 16px;
  }

  .home-about-title {
    font-size: clamp(28px, 4vw, 42px);
    font-weight: 900;
    line-height: 1.15;
    margin-bottom: 18px;
  }

  .home-about-desc {
    font-size: 15px;
    color: #a0a0a0;
    line-height: 1.7;
    margin-bottom: 28px;
  }

  .home-about-stats {
    display: flex;
    gap: 32px;
    flex-wrap: wrap;
  }

  .home-about-stat {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .home-about-stat-num {
    font-size: 32px;
    font-weight: 900;
    background: linear-gradient(135deg, #e50914, #ff6b6b);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .home-about-stat-label {
    font-size: 13px;
    color: #a0a0a0;
    font-weight: 600;
  }

  .home-about-visual {
    position: relative;
  }

  .home-about-img-wrap {
    position: relative;
    perspective: 1000px;
  }

  .home-about-img {
    width: 100%;
    height: 380px;
    object-fit: cover;
    border-radius: 20px;
    position: relative;
    z-index: 2;
    box-shadow: 0 24px 50px rgba(0, 0, 0, 0.6);
  }

  .home-about-img-accent {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(229, 9, 20, 0.15), transparent 60%);
    transform: translate(16px, 16px);
    z-index: 1;
  }

  /* ===== SLIDER ===== */
  .home-slider-section {
    padding-top: 0;
  }

  .home-slider {
    position: relative;
    width: 100%;
    overflow: hidden;
    border-radius: 20px;
    aspect-ratio: 21 / 8;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
  }

  .home-slider-track {
    display: flex;
    height: 100%;
    transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .home-slider-slide {
    position: relative;
    flex: 0 0 100%;
    height: 100%;
  }

  .home-slider-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .home-slider-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.75), transparent 60%);
  }

  .home-slider-caption {
    position: absolute;
    bottom: 0;
    left: 0;
    padding: 20px 28px;
    z-index: 2;
  }

  .home-slider-caption p {
    font-size: 20px;
    font-weight: 800;
    color: #ffffff;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.6);
    margin: 0;
  }

  .home-slider-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 3;
    background: rgba(0, 0, 0, 0.5);
    color: #ffffff;
    border: 1px solid rgba(255, 255, 255, 0.2);
    width: 44px;
    height: 44px;
    border-radius: 50%;
    font-size: 24px;
    line-height: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s, transform 0.2s;
    -webkit-backdrop-filter: blur(4px);
    backdrop-filter: blur(4px);
  }

  .home-slider-btn:hover {
    background: #e50914;
    border-color: #e50914;
    transform: translateY(-50%) scale(1.06);
  }

  .home-slider-btn.prev { left: 18px; }
  .home-slider-btn.next { right: 18px; }

  .home-slider-dots {
    position: absolute;
    bottom: 16px;
    right: 24px;
    z-index: 3;
    display: flex;
    gap: 8px;
  }

  .home-slider-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.4);
    border: none;
    cursor: pointer;
    padding: 0;
    transition: background 0.2s, transform 0.2s;
  }

  .home-slider-dot.active {
    background: #e50914;
    transform: scale(1.2);
  }

  /* ===== CINEMAS ===== */
  .home-cinema-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 24px;
  }

  .home-cinema-card {
    position: relative;
    height: 240px;
    border-radius: 18px;
    overflow: hidden;
    cursor: pointer;
    isolation: isolate;
    transition: transform 0.25s, box-shadow 0.25s;
  }

  .home-cinema-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 18px 40px rgba(0, 0, 0, 0.5);
  }

  .home-cinema-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: -2;
    transition: transform 0.45s ease;
  }

  .home-cinema-card:hover .home-cinema-img {
    transform: scale(1.06);
  }

  .home-cinema-overlay {
    position: absolute;
    inset: 0;
    z-index: -1;
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.05) 0%,
      rgba(0, 0, 0, 0.12) 45%,
      rgba(0, 0, 0, 0.88) 100%
    );
  }

  .home-cinema-tag {
    position: absolute;
    top: 14px;
    left: 14px;
    background: linear-gradient(135deg, #e50914, #ff4d5a);
    color: #fff;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.04em;
    padding: 6px 12px;
    border-radius: 999px;
    box-shadow: 0 4px 14px rgba(229, 9, 20, 0.4);
  }

  .home-cinema-content {
    position: absolute;
    left: 18px;
    right: 18px;
    bottom: 16px;
  }

  .home-cinema-name {
    font-size: 20px;
    font-weight: 800;
    margin-bottom: 4px;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.6);
  }

  .home-cinema-location {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    color: #e8e8e8;
    margin-bottom: 4px;
  }

  .home-cinema-seats {
    font-size: 13px;
    color: #e50914;
    font-weight: 700;
  }

  /* ===== PROMOTIONS ===== */
  .home-promo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 24px;
  }

  .home-promo-card {
    background: linear-gradient(135deg, #141414, #101010);
    border: 1px solid #1f1f1f;
    border-radius: 16px;
    padding: 28px;
    display: flex;
    flex-direction: column;
    transition: transform 0.25s, border-color 0.25s;
  }

  .home-promo-card:hover {
    transform: translateY(-4px);
    border-color: rgba(229, 9, 20, 0.4);
  }

  .home-promo-icon {
    font-size: 34px;
    margin-bottom: 16px;
  }

  .home-promo-icon-img {
    width: 48px;
    height: 48px;
    object-fit: contain;
    margin-bottom: 12px;
  }

  .home-promo-tag {
    align-self: flex-start;
    background: rgba(229, 9, 20, 0.15);
    color: #e50914;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    padding: 4px 10px;
    border-radius: 12px;
    margin-bottom: 12px;
  }

  .home-promo-title {
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 8px;
  }

  .home-promo-text {
    font-size: 14px;
    color: #a0a0a0;
    line-height: 1.5;
    margin-bottom: 16px;
  }

  .home-promo-link {
    color: #e50914;
    font-size: 14px;
    font-weight: 700;
    text-decoration: none;
    margin-top: auto;
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }

  .home-promo-link:hover {
    text-decoration: underline;
  }

  /* ===== FOOTER ===== */
  .home-footer {
    background: #0a0a0a;
    border-top: 1px solid #1a1a1a;
    margin-top: 40px;
  }

  .home-footer-inner {
    max-width: 1280px;
    margin: 0 auto;
    padding: 48px 24px;
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 40px;
  }

  .home-footer-brand {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .home-footer-desc {
    font-size: 14px;
    color: #a0a0a0;
    line-height: 1.6;
    max-width: 300px;
  }

  .home-footer-col {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .home-footer-heading {
    font-size: 14px;
    font-weight: 700;
    color: #ffffff;
    margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .home-footer-link {
    background: none;
    border: none;
    color: #a0a0a0;
    font-size: 14px;
    text-align: left;
    padding: 0;
    cursor: pointer;
    text-decoration: none;
    transition: color 0.2s;
  }

  .home-footer-link:hover {
    color: #e50914;
  }

  .home-footer-meta {
    font-size: 14px;
    color: #a0a0a0;
  }

  .home-footer-bottom {
    border-top: 1px solid #1a1a1a;
    text-align: center;
    font-size: 13px;
    color: #777777;
    padding: 20px 24px;
  }

  /* ===== RESPONSIVE ===== */
  @media (max-width: 768px) {
    .home-nav { display: none; }
    .home-hero-content { padding: 0 24px; }
    .home-hero-title { font-size: 34px; }
    .home-section { padding: 48px 16px; }
    .home-section-head { flex-direction: column; align-items: flex-start; }
    .home-footer-inner { grid-template-columns: 1fr; gap: 28px; }
    .home-movie-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 16px; }
    .home-about-inner { grid-template-columns: 1fr; gap: 28px; }
    .home-about-img { height: 260px; }
    .home-slider { aspect-ratio: 16 / 9; }
    .home-slider-caption p { font-size: 16px; }
    .home-slider-btn { width: 36px; height: 36px; font-size: 20px; }
    .home-slider-btn.prev { left: 10px; }
    .home-slider-btn.next { right: 10px; }
  }
`;

export default styles;