import { useEffect, useMemo, useState } from "react";
import MovieCard from "../components/MovieCard";
import HeroBanner from "../components/HeroBanner";
import Select from "../components/Select";
import { usePrefs } from "../context/PrefsContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { nowShowing as fallbackNow, comingSoon as fallbackSoon } from "../data/cinemaData";
import { normalizeMovie, nowShowingOf, comingSoonOf } from "../utils/movieFormat";
import api from "../api/client";
import useHeroImage from "../hooks/useHeroImage";
import { Search } from "lucide-react";

const HERO_IMAGE = "https://images.thedirect.com/media/article_full/disney-2025.jpg";

export default function NowShowing({ initialTab = "now" }) {
  const { t } = usePrefs();
  const heroImage = useHeroImage("movies", HERO_IMAGE);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const promo = searchParams.get("promo");
  const [tab, setTab] = useState(initialTab);
  const [movies, setMovies] = useState(null);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    let cancelled = false;
    api
      .get("/movies")
      .then((res) => {
        if (cancelled) return;
        const list = (Array.isArray(res.data) ? res.data : []).map(normalizeMovie);
        setMovies(list);
      })
      .catch(() => {
        if (!cancelled) setMovies([]);
      });
    api
      .get("/categories")
      .then((res) => {
        if (!cancelled) setCategories(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const list = useMemo(() => {
    const all = movies ?? [];
    if (tab === "now") {
      const shown = nowShowingOf(all);
      return shown.length > 0 ? shown : fallbackNow;
    }
    const soon = comingSoonOf(all);
    return soon.length > 0 ? soon : fallbackSoon;
  }, [movies, tab]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return list.filter((m) => {
      const matchesSearch =
        !term ||
        String(m.title || "").toLowerCase().includes(term) ||
        String(m.categoryName || "").toLowerCase().includes(term);
      const matchesCategory =
        category === "all" || String(m.categoryId) === String(category);
      return matchesSearch && matchesCategory;
    });
  }, [list, search, category]);

  const isNow = tab === "now";

  const switchTab = (next) => {
    setTab(next);
    setSearch("");
    setCategory("all");
    navigate(next === "now" ? "/now-showing" : "/coming-soon");
  };

  return (
    <>
      <HeroBanner
        contained
        badge={isNow ? t("nowShowing.heroBadge") : t("comingSoon.heroBadge")}
        title={isNow ? t("nav.nowShowing") : t("nav.comingSoon")}
        desc={isNow ? t("nowShowing.heroDesc") : t("comingSoon.heroDesc")}
        image={heroImage}
      />

      <section className="max-w-[1024px] mx-auto px-6 md:px-12 py-16" id={isNow ? "now-showing" : "coming-soon"}>
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex w-full sm:w-auto bg-[var(--app-panel2)] border border-[var(--app-edge)] rounded-full p-1 gap-1">
            <button
              className={`flex-1 sm:flex-none text-[13px] font-bold px-5 py-2.5 rounded-full transition-all cursor-pointer ${isNow ? "bg-brand text-white shadow-[0_4px_14px_rgba(229,9,20,0.35)]" : "text-[var(--app-mute)] hover:text-[var(--app-ink)]"}`}
              onClick={() => switchTab("now")}
            >
              {t("nav.nowShowing")}
            </button>
            <button
              className={`flex-1 sm:flex-none text-[13px] font-bold px-5 py-2.5 rounded-full transition-all cursor-pointer ${!isNow ? "bg-brand text-white shadow-[0_4px_14px_rgba(229,9,20,0.35)]" : "text-[var(--app-mute)] hover:text-[var(--app-ink)]"}`}
              onClick={() => switchTab("soon")}
            >
              {t("nav.comingSoon")}
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2.5 bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-xl py-2.5 px-3.5 text-[var(--app-mute)] flex-1 sm:w-64">
              <Search size={16} className="shrink-0" />
              <input
                className="bg-transparent border-none outline-none text-[var(--app-ink)] text-[14px] w-full"
                placeholder={isNow ? t("nowShowing.searchPlaceholder") : t("comingSoon.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              containerClassName="relative w-full sm:w-auto"
              className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-xl py-2.5 px-3.5 text-[14px] text-[var(--app-ink)] outline-none cursor-pointer"
            >
              <option value="all">{t("nowShowing.allCategories")}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
        </div>
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-[var(--app-mute)]">
            {isNow ? t("nowShowing.noResults") : t("comingSoon.noResults")}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {filtered.map((movie) => (
              <MovieCard key={movie.id ?? movie.title} movie={movie} promo={promo} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
