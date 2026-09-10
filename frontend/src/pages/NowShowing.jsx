import MovieCard from "../components/MovieCard";
import HeroBanner from "../components/HeroBanner";
import { usePrefs } from "../context/PrefsContext";
import { nowShowing } from "../data/cinemaData";

export default function NowShowing() {
  const { t } = usePrefs();
  return (
    <>
      <HeroBanner
        badge={t("nowShowing.heroBadge")}
        title={t("nav.nowShowing")}
        desc={t("nowShowing.heroDesc")}
      />

      <section className="max-w-[1280px] mx-auto px-6 md:px-12 py-16" id="now-showing">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <h2 className="text-2xl font-extrabold">{t("nav.nowShowing")}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {nowShowing.map((movie) => (
            <MovieCard key={movie.title} movie={movie} />
          ))}
        </div>
      </section>
    </>
  );
}