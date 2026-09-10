export const defaultCinemaImage =
  "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=900&h=600&fit=crop";

export function normalizeCinema(c, t) {
  const rooms = Array.isArray(c.rooms) ? c.rooms : [];
  const screenCount = typeof c.screen_count === "number" ? c.screen_count : rooms.length;
  const seatsCount =
    typeof c.seats_count === "number"
      ? c.seats_count
      : rooms.reduce((sum, r) => sum + (Number(r.total_seats) || 0), 0);
  return {
    id: c.id,
    name: c.name,
    location: c.location,
    area: c.area || "",
    hours: c.hours || "",
    phone: c.phone || "",
    tagline: c.tagline || "",
    image: c.image || defaultCinemaImage,
    features: Array.isArray(c.features) ? c.features : [],
    screen_count: screenCount,
    seats_count: seatsCount,
    screen: `${screenCount} ${t("cinemas.halls")}`,
    seats: `${seatsCount} ${t("cinemas.seats")}`,
  };
}