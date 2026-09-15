import PromotionsSection from "../components/PromotionsSection";
import HeroBanner from "../components/HeroBanner";
import { usePrefs } from "../context/PrefsContext";

export default function Promotion() {
  const { t } = usePrefs();
  return (
    <>
      <HeroBanner
        badge={t("promo.exclusiveOffers")}
        title={t("promo.heroTitle")}
        desc={t("promo.heroDesc")}
        image="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&h=850&fit=crop"
      />

      <PromotionsSection />
    </>
  );
}