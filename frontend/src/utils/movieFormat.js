export function formatDuration(min) {
  if (!min && min !== 0) return "";
  const h = Math.floor(Number(min) / 60);
  const m = Number(min) % 60;
  return h > 0 ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}m`;
}

export function normalizeMovie(m) {
  const categoryName = m.category?.name || "";
  const durationStr = formatDuration(m.duration);
  const genre = categoryName ? `${categoryName} • ${durationStr}` : durationStr;
  const date =
    m.release_date && String(m.release_date).length >= 10
      ? new Date(`${m.release_date.slice(0, 10)}T00:00:00`).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "";

  return {
    id: m.id,
    title: m.title,
    genre,
    rating: m.rating != null && String(m.rating) !== "0" ? String(m.rating) : "N/A",
    date,
    poster: m.poster || "https://placehold.co/300x450/050505/e50914/png?text=Khmer+Cinema",
    release_date: m.release_date,
    description: m.description || "",
    trailer_url: m.trailer_url || "",
    status: m.status,
    duration: m.duration,
    categoryId: m.movie_category_id ?? m.category?.id ?? null,
    categoryName,
  };
}

export function isReleased(m, now = new Date()) {
  if (!m.release_date) return true;
  const d = new Date(`${m.release_date.slice(0, 10)}T00:00:00`);
  return !Number.isNaN(d.getTime()) && d.getTime() <= now.getTime();
}

export function nowShowingOf(movies) {
  return (movies || []).filter((m) => isReleased(m));
}

export function comingSoonOf(movies) {
  return (movies || []).filter((m) => !isReleased(m));
}