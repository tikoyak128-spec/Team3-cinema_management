import { Link } from "react-router-dom";
import { navLinks } from "../data/cinemaData";
import { usePrefs } from "../context/PrefsContext";
import { Mail, Phone, MapPin, Clock, ArrowRight } from "lucide-react";

const navKeyMap = {
  "/": "nav.home",
  "/about": "nav.about",
  "/services": "nav.services",
  "/now-showing": "nav.nowShowing",
  "/coming-soon": "nav.comingSoon",
  "/cinemas": "nav.cinemas",
  "/promotions": "nav.promotions",
};

const contactItems = [
  {
    icon: Mail,
    label: "footer.emailUs",
    value: "info@khmercinema.com",
    href: "mailto:info@khmercinema.com",
  },
  {
    icon: Phone,
    label: "footer.hotline",
    value: "+855 23 000 000",
    href: "tel:+85523000000",
  },
  {
    icon: MapPin,
    label: "footer.headOffice",
    value: "Phnom Penh, Cambodia",
    href: "https://maps.google.com/?q=Phnom+Penh+Cambodia",
  },
  {
    icon: Clock,
    label: "footer.openHours",
    value: "Mon – Sun, 09:00 – 21:00",
  },
];

const FacebookIcon = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.014 1.792-4.678 4.533-4.678 1.313 0 2.686.235 2.686.235v2.964H15.83c-1.491 0-1.956.93-1.956 1.886v2.253h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
  </svg>
);

const InstagramIcon = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);

const YoutubeIcon = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const socials = [
  { icon: FacebookIcon, label: "Facebook", href: "#" },
  { icon: InstagramIcon, label: "Instagram", href: "#" },
  { icon: YoutubeIcon, label: "YouTube", href: "#" },
];

export default function Footer() {
  const { t } = usePrefs();
  return (
    <footer className="bg-white/90 dark:bg-[var(--app-deep)] border-t border-[var(--app-edge)]">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-8">
        {/* Top grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.4fr] gap-10 sm:gap-8 mb-12">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2.5 no-underline w-fit">
              <span className="flex flex-col leading-none">
                <span className="text-base font-extrabold tracking-[2px] text-[var(--app-ink)]">
                  KHMER <span className="text-brand">CINEMA</span>
                </span>
                </span>
            </Link>
            <p className="text-xs sm:text-sm text-[var(--app-mute)] leading-relaxed max-w-[280px]">
              {t("footer.tagline")}
            </p>
            <div className="flex items-center gap-2.5">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  title={social.label}
                  className="w-9 h-9 rounded-full bg-[var(--app-fill)] border border-[var(--app-edge)] flex items-center justify-center text-[var(--app-mute)] hover:text-white hover:bg-brand hover:border-brand transition-all duration-200"
                >
                  <social.icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-[var(--app-ink)] mb-4 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-brand inline-block" /> {t("footer.quickLinks")}
            </h4>
            <div className="flex flex-col gap-2.5">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  className="group text-xs sm:text-sm text-[var(--app-mute)] hover:text-brand transition-all no-underline w-fit flex items-center gap-1.5"
                  to={link.to}
                >
                  <ArrowRight size={12} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  {t(navKeyMap[link.to] || "nav.home")}
                </Link>
              ))}
            </div>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-[var(--app-ink)] mb-4 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-brand inline-block" /> {t("footer.account")}
            </h4>
            <div className="flex flex-col gap-2.5">
              <Link className="text-xs sm:text-sm text-[var(--app-mute)] hover:text-brand transition-all no-underline w-fit" to="/login">
                {t("nav.signIn")}
              </Link>
              <Link className="text-xs sm:text-sm text-[var(--app-mute)] hover:text-brand transition-all no-underline w-fit" to="/register">
                {t("nav.createAccount")}
              </Link>
              <Link className="text-xs sm:text-sm text-[var(--app-mute)] hover:text-brand transition-all no-underline w-fit" to="/profile">
                {t("nav.myProfile")}
              </Link>
            </div>
          </div>

          {/* Contact cards */}
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-[var(--app-ink)] mb-4 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-brand inline-block" /> {t("footer.contact")}
            </h4>
            <div className="flex flex-col gap-3">
              {contactItems.map((item) => {
                const Wrapper = item.href ? "a" : "div";
                return (
                  <Wrapper
                    key={item.label}
                    className="group flex items-center gap-3 transition-all hover:-translate-y-0.5 hover:border-brand/40 no-underline"
                  >
                    <span className="w-8 h-8 shrink-0 rounded-xl bg-brand/15 flex items-center justify-center transition-all group-hover:bg-brand">
                      <item.icon size={15} className="text-brand group-hover:text-white transition-colors" />
                    </span>
                    <span className="text-xs sm:text-[13px] text-[var(--app-mute)] group-hover:text-brand transition-colors">
                      {item.value}
                    </span>
                  </Wrapper>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[var(--app-edge)] pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 px-1">
          <p className="text-xs sm:text-[13px] text-[var(--app-mute)]">
            &copy; 2026 Khmer Cinema. {t("footer.rights")}
          </p>
          <div className="flex items-center gap-4 text-xs sm:text-[13px] text-[var(--app-mute)]">
            <Link to="/promotions" className="hover:text-brand transition-all no-underline">{t("footer.offers")}</Link>
            <span className="w-1 h-1 rounded-full bg-[var(--app-mute)]" />
            <Link to="/services" className="hover:text-brand transition-all no-underline">{t("footer.helpSupport")}</Link>
            <span className="w-1 h-1 rounded-full bg-[var(--app-mute)]" />
            <Link to="/about" className="hover:text-brand transition-all no-underline">{t("footer.aboutUs")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}