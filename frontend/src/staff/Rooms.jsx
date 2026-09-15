import { useEffect, useState } from "react";
import { Building2, DoorOpen, MapPin, Search, Armchair } from "lucide-react";
import api from "../api/client";

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    api.get("/staff/rooms")
      .then(({ data }) => { if (!cancelled) setRooms(data); })
      .catch((err) => { if (!cancelled) setError(err?.response?.data?.message || "Failed to load rooms."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const filtered = rooms.filter((r) => {
    const q = search.toLowerCase();
    return (
      (r.name || "").toLowerCase().includes(q) ||
      (r.cinema?.name || "").toLowerCase().includes(q) ||
      (r.cinema?.location || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col gap-6 text-[var(--app-ink)]">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-[26px] font-extrabold">Rooms</h1>
          <p className="text-sm text-[var(--app-mute)] mt-1">View all cinema halls and their capacity.</p>
        </div>
      </div>

      {error && (
        <div className="bg-[rgba(229,9,20,0.12)] border border-[rgba(229,9,20,0.4)] text-[#ff6b6b] text-[13px] p-[10px_14px] rounded-[10px] flex justify-between items-center">
          {error}
          <button onClick={() => setError("")} className="bg-transparent border-none text-[#ff6b6b] text-[18px] cursor-pointer leading-none">×</button>
        </div>
      )}

      <div className="flex items-center gap-2.5 bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-xl py-2.5 px-3.5 text-[var(--app-mute)] w-full sm:max-w-xs">
        <span className="shrink-0"><Search size={16} /></span>
        <input className="bg-transparent border-none outline-none text-[var(--app-ink)] font-inherit text-[14px] w-full" placeholder="Search room or cinema…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <p className="text-[var(--app-mute)] py-8">Loading rooms…</p>
      ) : filtered.length === 0 ? (
        <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl flex flex-col items-center justify-center py-[60px] text-[var(--app-mute)]">
          <div className="text-[44px] mb-3"><DoorOpen size={32} /></div>
          <p>No rooms found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
          {filtered.map((r) => (
            <div key={r.id} className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl p-5 transition-all duration-200 hover:-translate-y-[3px] hover:border-[rgba(229,9,20,0.4)]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-[44px] h-[44px] rounded-full bg-[rgba(229,9,20,0.12)] flex items-center justify-center shrink-0"><DoorOpen size={20} /></div>
                <div className="min-w-0">
                  <div className="font-extrabold text-base">{r.name}</div>
                  <div className="text-[12px] text-[var(--app-mute)]">RM-{String(r.id).padStart(3, "0")}</div>
                </div>
              </div>
              <div className="flex flex-col gap-2 pt-3 border-t border-[var(--app-edge)] text-[13px]">
                <span className="inline-flex items-center gap-1.5 text-[var(--app-mute)]"><Building2 size={14} className="shrink-0" /> {r.cinema?.name || "N/A"}</span>
                <span className="inline-flex items-center gap-1.5 text-[var(--app-mute)]"><MapPin size={14} className="shrink-0" /> {r.cinema?.location || ""}</span>
                <span className="inline-flex items-center gap-1.5 font-bold text-[var(--app-ink)]"><Armchair size={14} /> {r.capacity} seats</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}