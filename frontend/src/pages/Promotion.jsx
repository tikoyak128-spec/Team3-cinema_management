import { useEffect, useState } from "react";
import { ArrowRight, BadgePercent, Clock, Flame, Sparkles, Ticket } from "lucide-react";
import PromotionsSection from "../components/PromotionsSection";
import { usePrefs } from "../context/PrefsContext";
import useHeroImage from "../hooks/useHeroImage";

function PromoCountdown() {
  const { t } = usePrefs();
  const [left, setLeft] = useState({ d: 2, h: 18, m: 45 });

  useEffect(() => {
    const target = Date.now() + 3 * 24 * 60 * 60 * 1000;
    const timer = setInterval(() => {
      const diff = target - Date.now();
      if (diff <= 0) return clearInterval(timer);
      setLeft({
        d: Math.floor(diff / (1000 * 60 * 60 * 24)),
        h: Math.floor((diff / (1000 * 60 * 60)) % 24),
        m: Math.floor((diff / (1000 * 60)) % 60),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const cells = [
    { val: left.d, label: t("promo.daysLbl") },
    { val: left.h, label: t("promo.hrsLbl") },
    { val: left.m, label: t("promo.minLbl") },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="flex items-center gap-1.5 text-[12px] font-bold text-white/80 mr-1">
        <Clock size={14} className="text-brand" /> {t("promo.endsIn")}
      </span>
      {cells.map(({ val, label }) => (
        <div key={label} className="flex items-center gap-1.5">
          <div className="min-w-[42px] rounded-lg bg-black/40 border border-white/20 px-2 py-1.5 text-center backdrop-blur">
            <span className="block font-black tabular-nums leading-none text-white text-base">
              {String(val).padStart(2, "0")}
            </span>
            <span className="mt-1 block text-[8px] font-bold uppercase tracking-widest text-white/60">{label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Promotion() {
  const { t } = usePrefs();
  const heroImage = useHeroImage(
    "promotions",
    "https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=1400&h=700&fit=crop"
  );

  const scrollToDeals = () => {
    document.getElementById("promotions")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <div className="max-w-[1024px] mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24">
        {/* ===== 50% OFF FLASH POSTER ===== */}
        <section
          className="relative overflow-hidden rounded-3xl border border-[var(--app-edge)] bg-[var(--app-panel)] shadow-[0_22px_60px_rgba(0,0,0,0.5)]"
          style={{ fontFamily: "'Mulish','Kantumruy Pro',system-ui,sans-serif" }}
        >
          <img
            className="absolute inset-0 w-full h-full object-cover"
            src={heroImage}
            alt="50% off"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(9,9,11,0.97)_0%,rgba(9,9,11,0.88)_34%,rgba(9,9,11,0.55)_68%,rgba(9,9,11,0.72)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(120%_130%_at_88%_12%,rgba(229,9,20,0.4)_0%,transparent_55%)]" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_auto] items-center gap-10 p-7 sm:p-10 md:p-12">
            <div className="max-w-[600px]">
              <div className="flex flex-wrap items-center gap-2.5 mb-4">
                <span className="inline-flex items-center gap-1.5 bg-brand text-white text-[11px] font-black uppercase tracking-[2px] px-3.5 py-2 rounded-full shadow-[0_4px_16px_rgba(229,9,20,0.5)]">
                  <Sparkles size={13} /> {t("home.promoPosterBadge")}
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur border border-white/25 text-white text-[11px] font-bold uppercase tracking-[2px] px-3.5 py-2 rounded-full">
                  <Flame size={13} className="text-[#ff7b24]" /> {t("promo.featured")}
                </span>
              </div>

              <h2 className="text-white leading-none tracking-tighter flex items-end gap-3 sm:gap-5">
                <span className="text-[48px] sm:text-[60px] lg:text-[76px] font-black bg-gradient-to-b from-white via-white to-white/55 bg-clip-text text-transparent">
                  50%
                </span>
                <span className="text-[28px] sm:text-[34px] lg:text-[42px] font-black text-brand drop-shadow-[0_0_30px_rgba(229,9,20,0.75)] leading-[0.9]">
                  {t("promo.off")}
                </span>
              </h2>

              <p className="text-sm sm:text-base text-white/75 leading-relaxed max-w-[460px] mt-4">
                {t("home.promoPosterDesc")}
              </p>

              <div className="flex flex-wrap items-center gap-4 mt-6">
                <button
                  onClick={scrollToDeals}
                  className="inline-flex items-center gap-2 bg-brand hover:bg-[#f40612] text-white text-sm font-bold px-7 py-4 rounded-full transition-all shadow-[0_10px_28px_rgba(229,9,20,0.5)] hover:-translate-y-0.5 cursor-pointer border-none"
                >
                  <Ticket size={16} /> {t("promo.viewAll")} <ArrowRight size={15} />
                </button>
              </div>

              <div className="mt-6">
                <PromoCountdown />
              </div>
            </div>

            <div className="relative mx-auto lg:mx-0 shrink-0">
              <div className="absolute -top-3 -left-2 sm:-left-6 z-20 rotate-[-6deg]">
                <span className="inline-block bg-gradient-to-r from-[#ff7b24] to-[#ff3b4d] text-white text-[11px] font-black uppercase tracking-[1px] px-3.5 py-1.5 rounded-lg shadow-[0_8px_20px_rgba(255,123,36,0.5)]">
                  {t("promo.hurry")}
                </span>
              </div>

              <div className="relative rotate-3 hover:rotate-0 transition-transform duration-500 ease-out">
                <div className="rounded-[30px] bg-gradient-to-br from-[#ff3b4d] via-brand to-[#6d0910] p-[2px] shadow-[0_30px_70px_-20px_rgba(229,9,20,0.7)]">
                  <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-b from-[#180508] to-[#0a0203] flex">
                    <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-brand/40 blur-[70px]" />
                    <div className="relative flex-1 px-6 sm:px-7 py-6 flex flex-col justify-between gap-5 min-w-[210px]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Ticket size={16} className="text-[#ff5f6d]" />
                          <span className="text-[10px] font-black uppercase tracking-[0.24em] text-white/80">Khmer Cinema</span>
                        </div>
                        <BadgePercent size={16} className="text-[#ff5f6d]" />
                      </div>

                      <div className="text-center py-1">
                        <div className="text-[64px] sm:text-[72px] leading-none font-black text-white flex items-baseline justify-center gap-1">
                          50<span className="text-[32px] text-[#ff5f6d]">%</span>
                        </div>
                        <span className="mt-2 inline-block bg-gradient-to-r from-brand to-[#ff5f6d] text-white text-[11px] font-black uppercase tracking-[0.28em] px-4 py-2 rounded-full whitespace-nowrap">
                          {t("promo.off")} {t("promo.dealsTitle")}
                        </span>
                      </div>

                      <div className="flex flex-col gap-3">
                        <div className="border-t-2 border-dashed border-white/25 pt-4 flex items-center justify-between gap-2 text-white/80">
                          <span className="text-[10px] font-black uppercase tracking-[0.18em]">{t("promo.hurry")}</span>
                          <Clock size={14} className="text-[#ff5f6d] shrink-0" />
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] font-semibold text-white/50 line-through">$7.00</span>
                          <span className="text-xl font-black text-white">$3.50</span>
                        </div>
                      </div>
                    </div>

                    <div className="w-14 sm:w-16 bg-black/25 border-l-2 border-dashed border-white/25 flex flex-col items-center justify-center gap-5">
                      <span className="text-white font-black text-2xl sm:text-[28px] leading-none tracking-tighter" style={{ writingMode: "vertical-rl" }}>
                        50%
                      </span>
                      <span className="block h-8 w-[22px] bg-[repeating-linear-gradient(90deg,#fff_0_2px,transparent_2px_4px)] opacity-80" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[85%] h-9 bg-[rgba(229,9,20,0.55)] blur-[26px]" />
            </div>
          </div>
        </section>
      </div>

      <PromotionsSection />
    </>
  );
}