import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePrefs } from "../context/PrefsContext";
import { navLinks } from "../data/cinemaData";
import { LogOut, Ticket, User } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import LangSwitch from "./LangSwitch";

const navKeyMap = {
  "/": "nav.home",
  "/about": "nav.about",
  "/services": "nav.services",
  "/now-showing": "nav.nowShowing",
  "/cinemas": "nav.cinemas",
  "/promotions": "nav.promotions",
};

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = usePrefs();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const isActive = useCallback(
    (path) => {
      if (path === "/") return location.pathname === "/";
      return location.pathname.startsWith(path);
    },
    [location.pathname]
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[100] bg-white/70 dark:bg-[#1b1b1b]/70 backdrop-blur-2xl backdrop-saturate-150 transition-all duration-500">
        <div className="w-full max-w-[1024px] mx-auto h-14 sm:h-16 lg:h-[72px] flex items-center justify-between gap-3 sm:gap-4 px-4 sm:px-6">
          {/* Logo */}
          <Link
            className="flex items-center gap-2.5 cursor-pointer shrink-0 no-underline group"
            to="/"
          >
            <span className="text-sm sm:text-[15px] lg:text-base font-extrabold tracking-[1.5px] whitespace-nowrap text-[var(--app-ink)] select-none">
              KHMER <span className="text-brand">CINEMA</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center max-w-[620px]">
            {navLinks.map((link) => {
              const active = isActive(link.to);
              const label = t(navKeyMap[link.to] || "nav.home");
              return (
                <Link
                  key={link.to}
                  className={`relative text-[13px] font-semibold px-3 xl:px-3.5 py-2 rounded-lg transition-all duration-200 whitespace-nowrap no-underline ${
                    active
                      ? "text-[var(--app-ink)]"
                      : "text-[var(--app-mute)] hover:text-[var(--app-ink)]"
                  }`}
                  to={link.to}
                >
                  {label}
                  {active && (
                    <span className="absolute inset-x-2 -bottom-0.5 h-[2px] rounded-full bg-brand" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right section */}
          <div className="flex items-center gap-2 sm:gap-3">
            <LangSwitch />
            <ThemeToggle />

            {/* Book Tickets CTA - Desktop */}
            <Link
              className="hidden sm:inline-flex items-center justify-center gap-1.5 bg-brand/10 hover:bg-brand/20 border border-brand/25 hover:border-brand/40 text-brand text-xs font-bold px-2.5 py-2 sm:px-3 rounded-lg transition-all duration-200 no-underline"
              to="/my-bookings"
              title={t("nav.myBookings")}
            >
              <Ticket size={15} />
            </Link>

            {/* Auth section */}
            {isAuthenticated && user ? (
              <div className="hidden sm:flex items-center gap-2.5">
                <Link className="flex items-center pl-2 border-l border-[var(--app-edge)] no-underline group" to="/profile" title={t("nav.myProfile")}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-extrabold text-white bg-gradient-to-br from-brand to-red-700 ring-2 ring-[var(--app-edge)] ring-offset-1 ring-offset-[var(--app-header)] overflow-hidden">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      (user.name || "U").charAt(0).toUpperCase()
                    )}
                  </div>
                </Link>
                <button
                  className="flex items-center gap-1.5 text-[var(--app-mute)] hover:text-[var(--app-ink)] text-xs font-semibold px-2.5 py-2 rounded-lg hover:bg-[var(--app-fill)] transition-all cursor-pointer"
                  onClick={() => { logout(); navigate("/"); }}
                  title={t("nav.logOut")}
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  className="text-[var(--app-mute)] hover:text-[var(--app-ink)] text-xs sm:text-sm font-semibold px-3 py-2 rounded-lg hover:bg-[var(--app-fill)] transition-all cursor-pointer"
                  onClick={() => navigate("/login")}
                >
                  {t("nav.signIn")}
                </button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="lg:hidden relative flex h-10 w-10 items-center justify-center text-[var(--app-ink)] rounded-xl hover:bg-[var(--app-fill)] active:bg-[var(--app-fill2)] transition-all cursor-pointer shrink-0"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle navigation menu"
            >
              <div className="relative w-5 h-3.5">
                <span
                  className={`absolute left-0 h-[1.5px] bg-[var(--app-ink)] rounded-full transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                    menuOpen
                      ? "top-[6px] w-full rotate-45"
                      : "top-0 w-full rotate-0"
                  }`}
                />
                <span
                  className={`absolute left-0 top-[6px] h-[1.5px] bg-[var(--app-ink)] rounded-full transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                    menuOpen ? "w-0 opacity-0" : "w-full opacity-100"
                  }`}
                />
                <span
                  className={`absolute left-0 h-[1.5px] bg-[var(--app-ink)] rounded-full transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                    menuOpen
                      ? "top-[6px] w-full -rotate-45"
                      : "top-[12px] w-full rotate-0"
                  }`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Accent line on scroll */}
        <div
          className={`h-[1px] bg-gradient-to-r from-transparent via-brand/30 to-transparent transition-opacity duration-500 ${
            scrolled ? "opacity-100" : "opacity-0"
          }`}
        />
      </header>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-[99] lg:hidden transition-all duration-400 ${
          menuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-[var(--app-page)]/80 backdrop-blur-sm transition-opacity duration-300 ${
            menuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeMenu}
        />

        {/* Menu panel */}
        <div
          className={`absolute top-0 right-0 bottom-0 w-[min(85vw,360px)] bg-[var(--app-bar)] border-l border-[var(--app-edge)] flex flex-col transition-transform duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
            menuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Menu header */}
          <div className="h-14 sm:h-16 lg:h-[72px] flex items-center justify-between px-5 border-b border-[var(--app-edge)]">
            <span className="text-sm font-extrabold tracking-[1.5px] text-[var(--app-ink)]">
              {t("nav.menu")}
            </span>
          </div>

          {/* Links */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            {navLinks.map((link, i) => {
              const active = isActive(link.to);
              const label = t(navKeyMap[link.to] || "nav.home");
              return (
                <Link
                  key={link.to}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 no-underline mb-0.5 ${
                    active
                      ? "bg-brand/10 text-brand border border-brand/20"
                      : "text-[var(--app-mute)] hover:text-[var(--app-ink)] hover:bg-[var(--app-fill)] border border-transparent"
                  } ${menuOpen ? "animate-[slideIn_0.35s_ease_both]" : ""}`}
                  style={{ animationDelay: menuOpen ? `${i * 40}ms` : "0ms" }}
                  to={link.to}
                  onClick={closeMenu}
                >
                  {active && <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" />}
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile menu footer */}
          <div className="px-3 pb-5 pt-2 border-t border-[var(--app-edge)]">
            {isAuthenticated && user ? (
              <div className="flex flex-col gap-2 px-1">
                <Link
                  className="flex items-center gap-3 px-3 py-2.5 no-underline"
                  to="/profile"
                  onClick={closeMenu}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-extrabold text-white bg-gradient-to-br from-brand to-red-700 ring-2 ring-[var(--app-edge)] overflow-hidden">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      (user.name || "U").charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-[var(--app-ink)] truncate">
                      {user.name || "User"}
                    </span>
                    <span className="text-[11px] text-[var(--app-mute)] truncate">
                      {user.email}
                    </span>
                  </div>
                </Link>
                <Link
                  to="/profile"
                  onClick={closeMenu}
                  className="flex items-center justify-center gap-2 w-full bg-[var(--app-fill)] hover:bg-[var(--app-fill2)] border border-[var(--app-edge)] text-[var(--app-ink)] text-sm font-bold py-3 rounded-xl transition-all cursor-pointer no-underline"
                >
                  <User size={16} />
                  {t("nav.viewProfile")}
                </Link>
                <Link
                  to="/my-bookings"
                  onClick={closeMenu}
                  className="flex items-center justify-center gap-2 w-full bg-[var(--app-fill)] hover:bg-[var(--app-fill2)] border border-[var(--app-edge)] text-[var(--app-ink)] text-sm font-bold py-3 rounded-xl transition-all cursor-pointer no-underline"
                >
                  <Ticket size={16} />
                  {t("nav.myBookings")}
                </Link>
                <button
                  className="flex items-center justify-center gap-2 w-full bg-[var(--app-fill)] hover:bg-[var(--app-fill2)] border border-[var(--app-edge)] text-[var(--app-ink)] text-sm font-bold py-3 rounded-xl transition-all cursor-pointer"
                  onClick={() => { logout(); closeMenu(); navigate("/"); }}>
                  <LogOut size={16} />
                  {t("nav.logOut")}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 px-1">
                <button
                  className="w-full bg-brand hover:bg-brand-hover text-white text-sm font-bold py-3 rounded-xl transition-all shadow-[0_2px_12px_rgba(229,9,20,0.3)] cursor-pointer"
                  onClick={() => { closeMenu(); navigate("/login"); }}
                >
                  {t("nav.signIn")}
                </button>
                <button
                  className="w-full bg-[var(--app-fill)] hover:bg-[var(--app-fill2)] border border-[var(--app-edge)] text-[var(--app-ink)] text-sm font-bold py-3 rounded-xl transition-all cursor-pointer"
                  onClick={() => { closeMenu(); navigate("/register"); }}
                >
                  {t("nav.createAccount")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
