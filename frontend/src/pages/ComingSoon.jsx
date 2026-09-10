import MovieCard from "../components/MovieCard";
import HeroBanner from "../components/HeroBanner";
import { comingSoon } from "../data/cinemaData";
import { usePrefs } from "../context/PrefsContext";

export default function ComingSoon() {
  const { t } = usePrefs();
  return (
    <>
      <HeroBanner
        badge={t("comingSoon.heroBadge")}
        title={t("nav.comingSoon")}
        desc={t("comingSoon.heroDesc")}
      />

      <section className="max-w-[1280px] mx-auto px-6 md:px-12 py-16" id="coming-soon">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <h2 className="text-2xl font-extrabold">{t("nav.comingSoon")}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {comingSoon.map((movie) => (
            <MovieCard key={movie.title} movie={movie} />
          ))}
        </div>
      </section>
    </>
  );
}