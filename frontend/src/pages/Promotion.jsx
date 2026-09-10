import PromotionsSection from "../components/PromotionsSection";
import { usePrefs } from "../context/PrefsContext";

export default function Promotion() {
  const { t } = usePrefs();
  return (
    <>
      {/* Hero Banner */}
      <div className="relative min-h-[42vh] md:min-h-[46vh] flex items-center justify-center overflow-hidden border-b border-white/5">
        <div
          className="absolute inset-0 bg-cover bg-center animate-[heroZoom_12s_ease-in-out_forwards]"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1920&h=850&fit=crop')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/80" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(229,9,20,0.28),transparent_65%)]" />
        <div className="relative z-10 text-center px-6 md:px-12 pt-20 pb-16 md:pt-28 md:py-24 max-w-[900px] mx-auto">
          <span className="inline-flex items-center gap-2 bg-brand/90 text-white text-[11px] md:text-xs font-bold tracking-[2px] uppercase px-4 py-2 rounded-full mb-5 shadow-[0_4px_14px_rgba(229,9,20,0.4)]">
            {t("promo.exclusiveOffers")}
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white capitalize tracking-tight mb-4">
            {t("promo.heroTitle")}
          </h1>
          <p className="text-sm md:text-base text-gray-300 leading-relaxed max-w-[600px] mx-auto mb-6">
            {t("promo.heroDesc")}
          </p>
        </div>
      </div>

      <PromotionsSection />
    </>
  );
}