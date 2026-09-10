import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Armchair,
  Building2,
  ChevronDown,
  ChevronRight,
  DoorOpen,
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import api from "../../../../api/client";
import { usePrefs } from "../../../../context/PrefsContext";

const typeBadge = (t) =>
  t === "vip"
    ? "bg-[rgba(234,179,8,0.14)] text-[#eab308] border border-[rgba(234,179,8,0.3)]"
    : t === "couple"
      ? "bg-[rgba(59,130,246,0.14)] text-[#60a5fa] border border-[rgba(96,165,250,0.3)]"
      : "bg-[var(--app-fill)] text-[var(--app-mute)] border border-[var(--app-edge2)]";

function SeatChip({ seat, onEdit, onDelete }) {
  const { t } = usePrefs();
  const typeLabel =
    seat.seat_type === "regular" || seat.seat_type === "vip" || seat.seat_type === "couple"
      ? t(`seatType.${seat.seat_type}`)
      : seat.seat_type;
  return (
    <div className="group flex flex-col justify-between bg-[var(--app-panel2)] border border-[var(--app-edge2)] rounded-xl px-3 py-2.5 min-w-[120px] transition-all duration-200 hover:border-[rgba(229,9,20,0.4)] hover:bg-[rgba(229,9,20,0.04)]">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 font-bold text-[var(--app-ink)] text-[13px]">
          <Armchair size={14} className="shrink-0" />
          {seat.seat_number}
        </span>
        <div className="flex items-center gap-1">
          <button
            className="flex h-6 w-6 items-center justify-center rounded-md border border-transparent text-[var(--app-mute)] opacity-0 transition-all duration-150 group-hover:opacity-100 cursor-pointer hover:border-[rgba(229,9,20,0.3)] hover:bg-[rgba(229,9,20,0.1)] hover:text-[#e50914]"
            title={t("common.edit")}
            onClick={() => onEdit(seat.id)}
          >
            <Pencil size={12} />
          </button>
          <button
            className="flex h-6 w-6 items-center justify-center rounded-md border border-transparent text-[var(--app-mute)] opacity-0 transition-all duration-150 group-hover:opacity-100 cursor-pointer hover:border-[rgba(229,9,20,0.3)] hover:bg-[rgba(229,9,20,0.1)] hover:text-[#e50914]"
            title={t("common.delete")}
            onClick={() => onDelete(seat)}
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
      <div className="mt-1.5 flex items-center gap-2">
        <span className="text-[10px] font-semibold text-[var(--app-mute)] uppercase tracking-wide">
          {seat.row || "—"}
        </span>
        <span className={`ml-auto inline-flex items-center gap-1 px-2 py-[3px] text-[10px] font-bold rounded-[12px] whitespace-nowrap ${typeBadge(seat.seat_type)}`}>
          {typeLabel}
        </span>
      </div>
    </div>
  );
}

export default function SeatList() {
  const navigate = useNavigate();
  const { t } = usePrefs();
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [confirmSeat, setConfirmSeat] = useState(null);
  const [collapsedRooms, setCollapsedRooms] = useState({});
  const [collapsedCinemas, setCollapsedCinemas] = useState({});

  useEffect(() => {
    let cancelled = false;
    api
      .get("/seats")
      .then(({ data }) => { if (!cancelled) setSeats(data); })
      .catch((err) => { if (!cancelled) setError(err?.response?.data?.message || t("adminSeatList.failedLoad")); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const handleDelete = async (seat) => {
    try {
      await api.delete(`/seats/${seat.id}`);
      setSeats((prev) => prev.filter((s) => s.id !== seat.id));
      setConfirmSeat(null);
    } catch (err) {
      setError(err?.response?.data?.message || t("adminSeatList.failedDelete"));
    }
  };

  const query = search.trim().toLowerCase();
  const filtered = useMemo(() => {
    return seats.filter((s) => {
      if (!query) return true;
      return (
        s.seat_number.toLowerCase().includes(query) ||
        (s.row || "").toLowerCase().includes(query) ||
        (s.seat_type || "").toLowerCase().includes(query) ||
        (s.room?.name || "").toLowerCase().includes(query) ||
        (s.room?.cinema?.name || "").toLowerCase().includes(query) ||
        (s.room?.cinema?.location || "").toLowerCase().includes(query)
      );
    });
  }, [seats, query]);

  const groups = useMemo(() => {
    const map = new Map();
    filtered.forEach((s) => {
      const cinema = s.room?.cinema || null;
      const room = s.room || null;
      const cinemaKey = cinema?.id ?? "unknown";
      const roomKey = room?.id ?? "unknown";
      if (!map.has(cinemaKey)) {
        map.set(cinemaKey, { cinema, name: cinema?.name || t("adminSeatList.unassigned"), location: cinema?.location || "", rooms: new Map() });
      }
      const entry = map.get(cinemaKey);
      if (!entry.rooms.has(roomKey)) {
        entry.rooms.set(roomKey, { room, name: room?.name || t("adminSeatList.unassigned"), seats: [] });
      }
      entry.rooms.get(roomKey).seats.push(s);
    });
    return Array.from(map.values())
      .map((c) => ({
        ...c,
        rooms: Array.from(c.rooms.values())
          .map((r) => ({ ...r, seats: [...r.seats].sort((a, b) => a.seat_number.localeCompare(b.seat_number, undefined, { numeric: true })) }))
          .sort((a, b) => a.name.localeCompare(b.name)),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [filtered, t]);

  const totalSeats = filtered.length;
  const totalRooms = groups.reduce((n, c) => n + c.rooms.length, 0);
  const totalCinemas = groups.length;

  const toggleRoom = (key) => setCollapsedRooms((prev) => ({ ...prev, [key]: !prev[key] }));
  const toggleCinema = (key) => setCollapsedCinemas((prev) => ({ ...prev, [key]: !prev[key] }));

  const allRoomsVisible = groups.every((c) => c.rooms.every((r) => !collapsedRooms[r.room?.id ?? "unknown"]));

  return (
    <div className="flex flex-col gap-6 text-[var(--app-ink)] [&_*]:box-border">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[22px] sm:text-[26px] font-extrabold tracking-wide">{t("admin.seats")}</h1>
          <p className="text-[14px] text-[var(--app-mute)] mt-1">
            {t("adminSeatList.subtitle")}
          </p>
        </div>
        <button
          className="inline-flex items-center justify-center gap-2 border-none cursor-pointer font-inherit py-[11px] px-5 text-[14px] font-bold rounded-xl transition-all duration-200 bg-[#e50914] text-white shadow-[0_4px_14px_rgba(229,9,20,0.35)] hover:bg-[#f40612] hover:-translate-y-px w-full sm:w-auto"
          onClick={() => navigate("/admin/seats/create")}
        >
          <Plus size={16} /> {t("admin.addSeat")}
        </button>
      </div>

      {error && (
        <div className="bg-[rgba(229,9,20,0.12)] border border-[rgba(229,9,20,0.4)] text-[#ff6b6b] text-[13px] p-[10px_14px] rounded-[10px] flex justify-between items-center">
          {error}
          <button onClick={() => setError("")} className="bg-transparent border-none text-[#ff6b6b] text-[18px] cursor-pointer leading-none">×</button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5 bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-xl py-2.5 px-3.5 text-[var(--app-mute)] w-full sm:max-w-sm">
          <span className="shrink-0"><Search size={16} /></span>
          <input
            className="bg-transparent border-none outline-none text-[var(--app-ink)] font-inherit text-[14px] w-full"
            placeholder={t("adminSeatList.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold rounded-lg bg-[var(--app-panel)] border border-[var(--app-edge)] text-[var(--app-mute)]">
            <Building2 size={13} /> {totalCinemas} {t("adminSeatList.locations")}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold rounded-lg bg-[var(--app-panel)] border border-[var(--app-edge)] text-[var(--app-mute)]">
            <DoorOpen size={13} /> {totalRooms} {t("adminSeatList.rooms")}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold rounded-lg bg-[var(--app-panel)] border border-[var(--app-edge)] text-[var(--app-mute)]">
            <Armchair size={13} /> {totalSeats} {t("adminSeatList.seats")}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-end">
        <button
          className="bg-transparent border border-[var(--app-edge2)] text-[var(--app-ink2)] text-[12px] font-bold px-3.5 py-1.5 rounded-lg cursor-pointer hover:bg-[var(--app-fill)] hover:text-[var(--app-ink)] transition-all duration-200"
          onClick={() => {
            const next = !allRoomsVisible;
            const collapsed = {};
            groups.forEach((c) => c.rooms.forEach((r) => { collapsed[r.room?.id ?? "unknown"] = next; }));
            setCollapsedRooms(collapsed);
          }}
        >
          {allRoomsVisible ? t("adminSeatList.collapseAll") : t("adminSeatList.expandAll")}
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 px-5 text-center text-[var(--app-mute)] bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl">
          <p>{t("adminSeatList.loading")}</p>
        </div>
      ) : groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-[60px] px-5 text-center text-[var(--app-mute)] bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl">
          <div className="text-[44px] mb-3"><Armchair size={32} /></div>
          <p>{query ? t("adminSeatList.noSearchResults") : t("adminSeatList.noData")}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {groups.map((cinema) => {
            const cinemaKey = cinema.cinema?.id ?? "unknown";
            const isCinemaCollapsed = !!collapsedCinemas[cinemaKey];
            const cinemaSeats = cinema.rooms.reduce((n, r) => n + r.seats.length, 0);

            return (
              <section key={cinemaKey} className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl overflow-hidden">
                {/* Cinema header */}
                <button
                  className="w-full flex items-center gap-3.5 px-5 sm:px-6 py-4 text-left cursor-pointer border-b border-[var(--app-edge)] hover:bg-[var(--app-fill)] transition-colors duration-150"
                  onClick={() => toggleCinema(cinemaKey)}
                >
                  <span className="w-10 h-10 shrink-0 rounded-xl bg-[rgba(229,9,20,0.12)] flex items-center justify-center text-brand">
                    <Building2 size={20} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-extrabold text-[15px] text-[var(--app-ink)] truncate">{cinema.name}</span>
                    <span className="flex items-center gap-1.5 text-[12px] text-[var(--app-mute)] mt-0.5">
                      <MapPin size={12} className="shrink-0" />
                      <span className="truncate">{cinema.location || t("adminSeatList.noLocation")}</span>
                    </span>
                  </span>
                  <span className="hidden sm:inline-flex text-[12px] font-bold text-[var(--app-mute)]">
                    {t("adminSeatList.cinemaRoomsCount", { count: cinema.rooms.length })} · {t("adminSeatList.cinemaSeatsCount", { count: cinemaSeats })}
                  </span>
                  <span className={`text-[var(--app-mute)] transition-transform duration-200 ${isCinemaCollapsed ? "" : "rotate-180"}`}>
                    <ChevronDown size={18} />
                  </span>
                </button>

                {/* Rooms */}
                <div className={`grid transition-all duration-300 ${isCinemaCollapsed ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"}`}>
                  <div className="overflow-hidden">
                    <div className="flex flex-col gap-4 p-4 sm:p-5">
                      {cinema.rooms.map((room) => {
                        const roomKey = room.room?.id ?? "unknown";
                        const isRoomCollapsed = !!collapsedRooms[roomKey];

                        return (
                          <div key={roomKey} className="border border-[var(--app-edge)] rounded-xl overflow-hidden bg-[var(--app-panel2)]">
                            <button
                              className="w-full flex items-center gap-3 px-4 py-3 text-left cursor-pointer hover:bg-[var(--app-fill)] transition-colors duration-150"
                              onClick={() => toggleRoom(roomKey)}
                            >
                              <span className="w-8 h-8 shrink-0 rounded-lg bg-[var(--app-fill)] flex items-center justify-center text-[var(--app-ink2)]">
                                <DoorOpen size={16} />
                              </span>
                              <span className="min-w-0 flex-1 font-bold text-[14px] text-[var(--app-ink)] truncate">
                                {room.name}
                              </span>
                              <span className="text-[12px] font-bold text-[var(--app-mute)] px-2.5 py-1 rounded-lg bg-[var(--app-fill)]">
                                {t("adminSeatList.roomSeatsCount", { count: room.seats.length })}
                              </span>
                              <span className={`text-[var(--app-mute)] transition-transform duration-200 ${isRoomCollapsed ? "" : "rotate-90"}`}>
                                <ChevronRight size={16} />
                              </span>
                            </button>

                            <div className={`grid transition-all duration-300 ${isRoomCollapsed ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"}`}>
                              <div className="overflow-hidden">
                                <div className="p-3.5 flex flex-wrap gap-2.5 border-t border-[var(--app-edge)]">
                                  {room.seats.map((s) => (
                                    <SeatChip
                                      key={s.id}
                                      seat={s}
                                      onEdit={(id) => navigate(`/admin/seats/${id}/edit`)}
                                      onDelete={(seat) => setConfirmSeat(seat)}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Delete confirmation overlay */}
      {confirmSeat && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-[3px] flex items-center justify-center p-5">
          <div className="w-full max-w-[400px] bg-[var(--app-panel)] border border-[var(--app-edge2)] rounded-2xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)] animate-[scaleIn_0.25s_ease_both]">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-10 shrink-0 rounded-xl bg-[rgba(229,9,20,0.12)] flex items-center justify-center text-[#e50914]">
                <Trash2 size={20} />
              </span>
              <div>
                <h3 className="text-[16px] font-extrabold text-[var(--app-ink)]">{t("adminSeatList.deleteSeatTitle")}</h3>
                <p className="text-[12px] text-[var(--app-mute)] mt-0.5">
                  {confirmSeat.seat_number} · {confirmSeat.room?.name || t("adminSeatList.unassigned")} · {confirmSeat.room?.cinema?.name || t("adminSeatList.noLocationText")}
                </p>
              </div>
            </div>
            <p className="text-[13px] text-[var(--app-mute)] leading-relaxed mb-5">
              {t("adminSeatList.deleteSeatBody")}
            </p>
            <div className="flex gap-2.5 justify-end">
              <button
                className="px-4 py-2.5 text-[13px] font-bold rounded-[10px] cursor-pointer bg-transparent text-[var(--app-ink2)] border border-[var(--app-edge2)] hover:bg-[var(--app-fill)] transition-colors duration-200"
                onClick={() => setConfirmSeat(null)}
              >
                {t("common.cancel")}
              </button>
              <button
                className="px-4 py-2.5 text-[13px] font-bold rounded-[10px] cursor-pointer bg-[#e50914] text-white hover:bg-[#f40612] transition-colors duration-200"
                onClick={() => handleDelete(confirmSeat)}
              >
                {t("common.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}