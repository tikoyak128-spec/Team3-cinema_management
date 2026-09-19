import { useEffect, useState } from "react";
import { ArrowRight, MapPin, Film, Ticket, Star, Users, Heart, Shield, Award, Tv, Popcorn, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { usePrefs } from "../context/PrefsContext";
import useHeroImage from "../hooks/useHeroImage";
import api from "../api/client";

const DEFAULT_HERO =
  "https://s.studiobinder.com/wp-content/uploads/2025/05/Film-Lighting-and-Artificial-Lighting-on-Movie-Set-Production-Cast-and-Crew.jpg";

const stats = [
  { value: "50+", labelKey: "home.hallsNationwide" },
  { value: "1M+", labelKey: "home.happyCustomers" },
  { value: "200+", labelKey: "home.moviesPerYear" },
  { value: "8", labelKey: "about.cinemaLocations" },
];

const values = [
  {
    icon: Heart,
    titleKey: "about.valuePassion",
    descKey: "about.valuePassionDesc",
  },
  {
    icon: Shield,
    titleKey: "about.valueQuality",
    descKey: "about.valueQualityDesc",
  },
  {
    icon: Users,
    titleKey: "about.valueCommunity",
    descKey: "about.valueCommunityDesc",
  },
  {
    icon: Star,
    titleKey: "about.valueInnovation",
    descKey: "about.valueInnovationDesc",
  },
];

const features = [
  {
    icon: Tv,
    titleKey: "about.featureImax",
    descKey: "about.featureImaxDesc",
  },
  {
    icon: Ticket,
    titleKey: "about.featureBooking",
    descKey: "about.featureBookingDesc",
  },
  {
    icon: Popcorn,
    titleKey: "about.featureConcessions",
    descKey: "about.featureConcessionsDesc",
  },
  {
    icon: Clock,
    titleKey: "about.featureShowtimes",
    descKey: "about.featureShowtimesDesc",
  },
  {
    icon: Film,
    titleKey: "about.featureDiverse",
    descKey: "about.featureDiverseDesc",
  },
  {
    icon: Award,
    titleKey: "about.featureLoyalty",
    descKey: "about.featureLoyaltyDesc",
  },
];


export default function About() {
  const { t } = usePrefs();
  const heroImage = useHeroImage("about", DEFAULT_HERO);
  const [team, setTeam] = useState([]);

  useEffect(() => {
    let cancelled = false;
    api
      .get("/team-members")
      .then(({ data }) => {
        if (cancelled) return;
        const list = (Array.isArray(data) ? data : [])
          .filter((m) => m.is_active !== false)
          .map((m) => ({
            name: m.name,
            role: m.role || "",
            image: m.image || "",
            social: {
              facebook: m.facebook,
              linkedin: m.linkedin,
              twitter: m.twitter,
            },
          }));
        if (list.length > 0) setTeam(list);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[70vh] sm:min-h-[74vh] lg:min-h-[80vh] flex items-center overflow-hidden bg-[var(--app-page)]">
        <div
          className="absolute inset-0 bg-cover bg-center animate-[heroZoom_16s_ease-in-out_forwards]"
          style={{
            backgroundImage:
              `url('${heroImage}')`,
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(5,5,5,0.96),rgba(5,5,5,0.65)_50%,rgba(5,5,5,0.15))] z-[1]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,#050505_0%,rgba(5,5,5,0.55)_40%,rgba(229,9,20,0.12)_100%)] z-[1]" />
        <div className="absolute top-1/4 left-[12%] w-[180px] h-[180px] sm:w-[340px] sm:h-[340px] md:w-[420px] md:h-[420px] rounded-full bg-[rgba(229,9,20,0.18)] blur-[90px] md:blur-[130px] pointer-events-none z-[1]" />
        <div className="absolute bottom-1/4 right-[8%] w-[140px] h-[140px] sm:w-[260px] sm:h-[260px] md:w-[340px] md:h-[340px] rounded-full bg-[rgba(237,195,143,0.12)] blur-[70px] md:blur-[110px] pointer-events-none z-[1]" />

        <div className="relative z-[2] w-full max-w-[1024px] mx-auto px-5 sm:px-6 lg:px-8 pt-24 sm:pt-28 md:pt-28 pb-12 sm:pb-16">
          <div className="max-w-[620px]">
            <h1 className="text-3xl min-[400px]:text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.08] tracking-tight text-balance text-white mb-3">
              {t("about.heroTitle")}
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-[#c9c9c9] leading-relaxed mb-6 max-w-[540px]">
              {t("about.heroText")}
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              <a
                href="#about-story"
                className="inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-white font-bold text-sm sm:text-[15px] px-7 py-3 rounded-full transition-all shadow-[0_8px_24px_rgba(229,9,20,0.4)] hover:-translate-y-0.5 no-underline"
              >
                {t("about.heroCtaStory")} <ArrowRight size={16} />
              </a>
              <Link
                to="/now-showing"
                className="inline-flex items-center justify-center gap-2 bg-transparent border border-white/30 hover:bg-white/10 text-white font-bold text-sm sm:text-[15px] px-7 py-3 rounded-full transition-all no-underline"
              >
                <Film size={16} /> {t("about.heroCtaMovies")}
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-7 sm:gap-x-9 md:gap-x-11 gap-y-4 mt-9 sm:mt-11 pt-5 border-t border-white/10">
            {stats.map((stat) => (
              <div className="flex flex-col gap-0.5" key={stat.labelKey}>
                <span className="text-2xl sm:text-3xl font-black text-white">{stat.value}</span>
                <span className="text-[10px] sm:text-[11px] text-[var(--app-mute)] font-semibold uppercase tracking-wider">
                  {t(stat.labelKey)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Story */}
      <section className="max-w-[1024px] mx-auto px-6 md:px-12 py-16 md:py-20 scroll-mt-20" id="about-story">
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-12 items-center">
          <div>
            <h2 className="text-[28px] md:text-[42px] font-black leading-[1.15] mb-4">
              {t("home.aboutTitle")}
            </h2>
            <p className="text-[15px] text-[var(--app-mute)] leading-relaxed mb-5">
              {t("home.aboutText")}
            </p>
            <p className="text-[15px] text-[var(--app-mute)] leading-relaxed mb-7">
              {t("about.storyText")}
            </p>
          </div>
          <div className="relative">
            <div className="relative [perspective:1000px]">
              <img
                className="w-full h-[260px] md:h-[380px] object-cover rounded-[20px] relative z-[2] shadow-[0_24px_50px_rgba(0,0,0,0.6)]"
                src="https://www.madeinn.co.uk/media/yootheme/cache/32/NewScreen1Nottingham-327b7014.jpg"
                alt="Khmer Cinema Interior"
              />
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(229,9,20,0.15),transparent_60%)] translate-x-4 translate-y-4 z-[1]" />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-[var(--app-deep)] border-y border-[var(--app-edge)]">
        <div className="max-w-[1024px] mx-auto px-6 md:px-12 py-16 md:py-20 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="bg-[linear-gradient(135deg,var(--app-panel),var(--app-panel2))] border border-[var(--app-edge)] rounded-2xl p-8 md:p-10 transition-all hover:-translate-y-1 hover:border-brand/40">
            <div className="w-14 h-14 rounded-2xl bg-brand/15 flex items-center justify-center mb-5">
              <Star className="text-brand" size={26} />
            </div>
            <h3 className="text-xl md:text-2xl font-black mb-3">{t("about.missionTitle")}</h3>
            <p className="text-[15px] text-[var(--app-mute)] leading-relaxed">
              {t("about.missionText")}
            </p>
          </div>
          <div className="bg-[linear-gradient(135deg,var(--app-panel),var(--app-panel2))] border border-[var(--app-edge)] rounded-2xl p-8 md:p-10 transition-all hover:-translate-y-1 hover:border-brand/40">
            <div className="w-14 h-14 rounded-2xl bg-brand/15 flex items-center justify-center mb-5">
              <Award className="text-brand" size={26} />
            </div>
            <h3 className="text-xl md:text-2xl font-black mb-3">{t("about.visionTitle")}</h3>
            <p className="text-[15px] text-[var(--app-mute)] leading-relaxed">
              {t("about.visionText")}
            </p>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="max-w-[1024px] mx-auto px-6 md:px-10 py-16 md:py-10">
        <div className="text-center mb-12">
          <h2 className="text-[28px] md:text-[42px] font-black leading-[1.15]">
            {t("about.valuesTitle")}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value) => {
            const Icon = value.icon;
            return (
              <div
                key={value.titleKey}
                className="bg-[linear-gradient(135deg,var(--app-panel),var(--app-panel2))] border border-[var(--app-edge)] rounded-2xl p-7 flex flex-col items-center text-center transition-all hover:-translate-y-1 hover:border-brand/40"
              >
                <div className="w-14 h-14 rounded-2xl bg-brand/15 flex items-center justify-center mb-5">
                  <Icon className="text-brand" size={24} />
                </div>
                <h3 className="text-lg font-bold mb-2">{t(value.titleKey)}</h3>
                <p className="text-sm text-[var(--app-mute)] leading-relaxed">{t(value.descKey)}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Why Choose Us / Features */}
      <section className="bg-[var(--app-deep)] border-y border-[var(--app-edge)]">
        <div className="max-w-[1024px] mx-auto px-6 md:px-12 py-16 md:py-20">
          <div className="text-center mb-12">
            <h2 className="text-[28px] md:text-[42px] font-black leading-[1.15]">
              {t("about.whyTitle")}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.titleKey}
                  className="bg-[linear-gradient(135deg,var(--app-panel),var(--app-panel2))] border border-[var(--app-edge)] rounded-2xl p-7 flex flex-col transition-all hover:-translate-y-1 hover:border-brand/40 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-brand/15 flex items-center justify-center mb-4 group-hover:bg-brand/25 transition-colors">
                    <Icon className="text-brand" size={22} />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{t(feature.titleKey)}</h3>
                  <p className="text-sm text-[var(--app-mute)] leading-relaxed">{t(feature.descKey)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* Team Members */}
      <section className="bg-[var(--app-deep)] border-y border-[var(--app-edge)]">
        <div className="max-w-[1024px] mx-auto px-6 md:px-12 py-16 md:py-20">
          <div className="text-center mb-12">
            <h2 className="text-[28px] md:text-[42px] font-black leading-[1.15] mb-3">
              {t("about.teamTitle")}
            </h2>
            <p className="text-[15px] text-[var(--app-mute)] max-w-[600px] mx-auto leading-relaxed">
              {t("about.teamText")}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-[960px] mx-auto">
            {team.map((member) => (
              <div
                key={member.name}
                className="bg-[linear-gradient(135deg,var(--app-panel),var(--app-panel2))] border border-[var(--app-edge)] rounded-2xl overflow-hidden text-center transition-all hover:-translate-y-1 hover:border-brand/40 group"
              >
                <div className="relative h-[280px] overflow-hidden">
                  <img
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    src={member.image}
                    alt={member.name}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <div className="flex justify-center gap-3">
                      {member.social.facebook && (
                        <a href={member.social.facebook} className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-white text-sm hover:bg-brand transition-colors">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                        </a>
                      )}
                      {member.social.linkedin && (
                        <a href={member.social.linkedin} className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-white text-sm hover:bg-brand transition-colors">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                        </a>
                      )}
                      {member.social.twitter && (
                        <a href={member.social.twitter} className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-white text-sm hover:bg-brand transition-colors">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-1">{member.name}</h3>
                  <p className="text-sm text-brand font-semibold">{member.role ? member.role : (member.roleKey ? t(member.roleKey) : "")}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-[1024px] mx-auto px-6 md:px-12 py-16 md:py-20">
        <div className="relative rounded-[24px] overflow-hidden">
          <img
            className="absolute inset-0 w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1280&h=500&fit=crop"
            alt="Cinema Experience"
          />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(229,9,20,0.85),rgba(0,0,0,0.9))]" />
          <div className="relative z-10 text-center px-8 py-16 md:py-20">
            <h2 className="text-[28px] md:text-[42px] font-black text-white leading-[1.15] mb-4">
              {t("about.ctaTitle")}
            </h2>
            <p className="text-[15px] text-white/80 leading-relaxed max-w-[550px] mx-auto mb-8">
              {t("about.ctaText")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/now-showing"
                className="inline-flex items-center gap-2 bg-white text-brand font-bold text-sm px-7 py-3.5 rounded-full hover:bg-gray-100 transition-all shadow-[0_4px_20px_rgba(255,255,255,0.2)] no-underline"
              >
                {t("about.browseMovies")} <ArrowRight size={16} />
              </Link>
              <Link
                to="/cinemas"
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white font-bold text-sm px-7 py-3.5 rounded-full border border-white/20 hover:bg-white/20 transition-all no-underline"
              >
                <MapPin size={16} /> {t("about.findCinema")}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
