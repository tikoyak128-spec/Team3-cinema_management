import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, DoorOpen, Pencil, Plus, Search, Trash2 } from "lucide-react";
import api from "../../../../api/client";
import { usePrefs } from "../../../../context/PrefsContext";

export default function RoomList() {
  const navigate = useNavigate();
  const { t } = usePrefs();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [confirmId, setConfirmId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api.get("/rooms").then(({ data }) => { if (!cancelled) setRooms(data); })
      .catch((err) => { if (!cancelled) setError(err?.response?.data?.message || t("adminRoomList.failedLoad")); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/rooms/${id}`);
      setRooms((prev) => prev.filter((r) => r.id !== id));
      setConfirmId(null);
    } catch (err) {
      setError(err?.response?.data?.message || t("adminRoomList.failedDelete"));
    }
  };

  const filtered = rooms.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    (r.cinema?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const deleteButtons = (r) => (
    <div className="flex gap-2 items-center">
      <button className="bg-[var(--app-panel)] border border-[var(--app-edge2)] text-[var(--app-ink2)] w-[34px] h-[34px] rounded-[10px] cursor-pointer flex items-center justify-center text-[15px] transition-all duration-200 hover:bg-[var(--app-fill)] hover:text-[var(--app-ink)] [&.edit:hover]:bg-[rgba(229,9,20,0.15)] [&.edit:hover]:text-[#e50914] [&.edit:hover]:border-[rgba(229,9,20,0.3)]" title={t("common.edit")} onClick={() => navigate(`/admin/rooms/${r.id}/edit`)}><Pencil size={16} /></button>
      {confirmId === r.id ? (
        <div className="flex gap-2 items-center">
          <button className="inline-flex items-center gap-2 border-none cursor-pointer font-inherit py-2 px-3.5 text-[13px] font-bold rounded-[10px] transition-all duration-200 bg-[rgba(229,9,20,0.12)] text-[#e50914] border border-[rgba(229,9,20,0.35)] hover:bg-[rgba(229,9,20,0.2)]" onClick={() => handleDelete(r.id)}>{t("common.confirm")}</button>
          <button className="inline-flex items-center gap-2 border-none cursor-pointer font-inherit py-2 px-3.5 text-[13px] font-bold rounded-[10px] transition-all duration-200 bg-transparent text-[var(--app-ink2)] border border-[var(--app-edge2)] hover:bg-[var(--app-fill)]" onClick={() => setConfirmId(null)}>{t("common.cancel")}</button>
        </div>
      ) : (
        <button className="bg-[var(--app-panel)] border border-[var(--app-edge2)] text-[var(--app-ink2)] w-[34px] h-[34px] rounded-[10px] cursor-pointer flex items-center justify-center text-[15px] transition-all duration-200 hover:bg-[var(--app-fill)] hover:text-[var(--app-ink)] [&.delete:hover]:bg-[rgba(229,9,20,0.15)] [&.delete:hover]:text-[#e50914] [&.delete:hover]:border-[rgba(229,9,20,0.3)]" title={t("common.delete")} onClick={() => setConfirmId(r.id)}><Trash2 size={16} /></button>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-6 text-[var(--app-ink)] [&_*]:box-border">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[22px] sm:text-[26px] font-extrabold tracking-wide">{t("admin.rooms")}</h1>
          <p className="text-[14px] text-[var(--app-mute)] mt-1">{t("adminRoomList.subtitle")}</p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 border-none cursor-pointer font-inherit py-[11px] px-5 text-[14px] font-bold rounded-xl transition-all duration-200 bg-[#e50914] text-white shadow-[0_4px_14px_rgba(229,9,20,0.35)] hover:bg-[#f40612] hover:-translate-y-px w-full sm:w-auto" onClick={() => navigate("/admin/rooms/create")}><Plus size={16} /> {t("admin.addRoom")}</button>
      </div>

      {error && (
        <div className="bg-[rgba(229,9,20,0.12)] border border-[rgba(229,9,20,0.4)] text-[#ff6b6b] text-[13px] p-[10px_14px] rounded-[10px] flex justify-between items-center">
          {error}
          <button onClick={() => setError("")} className="bg-transparent border-none text-[#ff6b6b] text-[18px] cursor-pointer leading-none">×</button>
        </div>
      )}

      <div className="flex items-center gap-2.5 bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-xl py-2.5 px-3.5 text-[var(--app-mute)] w-full sm:max-w-xs">
        <span className="shrink-0"><Search size={16} /></span>
        <input className="bg-transparent border-none outline-none text-[var(--app-ink)] font-inherit text-[14px] w-full" placeholder={t("adminRoomList.searchPlaceholder")} value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 px-5 text-center text-[var(--app-mute)]">
            <p>{t("adminRoomList.loading")}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-[60px] px-5 text-center text-[var(--app-mute)]">
            <div className="text-[44px] mb-3"><DoorOpen size={32} /></div>
            <p>{t("adminRoomList.noData")}</p>
          </div>
        ) : (
          <>
            {/* Mobile / tablet card list */}
            <div className="md:hidden flex flex-col gap-3 p-4 sm:p-5">
              {filtered.map((r) => (
                <div key={r.id} className="bg-[var(--app-panel2)] border border-[var(--app-edge2)] rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-[38px] h-[38px] rounded-full bg-[rgba(229,9,20,0.12)] flex items-center justify-center text-[16px] shrink-0"><DoorOpen size={18} /></div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-[var(--app-ink)] leading-snug">{r.name}</div>
                      <div className="text-[12px] text-[var(--app-mute)] mt-0.5">RM-{String(r.id).padStart(3, "0")}</div>
                    </div>
                    <div className="shrink-0">{deleteButtons(r)}</div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-[var(--app-edge)] flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px]">
                    <span className="inline-flex items-center gap-1.5 text-[var(--app-mute)]"><Building2 size={14} /> {r.cinema?.name || "N/A"}</span>
                    <span className="inline-flex items-center gap-1.5 bg-[var(--app-fill)] border border-[var(--app-edge2)] text-[var(--app-ink2)] py-1 px-2.5 rounded-[8px] text-[12px] font-semibold">{t("adminRoomList.seatsCount", { count: r.capacity })}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse text-[14px] [&>thead_th]:text-left [&>thead_th]:py-[14px] [&>thead_th]:px-[18px] [&>thead_th]:text-[var(--app-mute)] [&>thead_th]:text-[12px] [&>thead_th]:font-bold [&>thead_th]:uppercase [&>thead_th]:tracking-widest [&>thead_th]:border-b [&>thead_th]:border-[var(--app-edge)] [&>thead_th]:bg-[var(--app-fill)] [&>thead_th]:whitespace-nowrap [&>th]:sticky [&>th]:top-0 [&>th]:z-5 [&>th]:bg-[var(--app-panel)] [&>tbody_td]:py-[14px] [&>tbody_td]:px-[18px] [&>tbody_td]:border-b [&>tbody_td]:border-[var(--app-edge)] [&>tbody_td]:text-[var(--app-ink2)] [&>tbody_td]:align-middle [&>tbody>tr]:transition-colors [&>tbody>tr]:duration-150 [&>tbody>tr:hover]:bg-[var(--app-fill)] [&>tbody>tr:last-child>td]:border-b-0">
                <thead><tr><th>{t("adminRoomList.room")}</th><th>{t("adminRoomList.cinema")}</th><th>{t("adminRoomList.capacity")}</th><th>{t("common.actions")}</th></tr></thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-[38px] h-[38px] rounded-full bg-[rgba(229,9,20,0.12)] flex items-center justify-center text-[16px] shrink-0"><DoorOpen size={18} /></div>
                          <div>
                            <div className="font-bold text-[var(--app-ink)]">{r.name}</div>
                            <div className="text-[12px] text-[var(--app-mute)]">RM-{String(r.id).padStart(3, "0")}</div>
                          </div>
                        </div>
                      </td>
                      <td>{r.cinema?.name || "N/A"}</td>
                      <td>{r.capacity}</td>
                      <td>{deleteButtons(r)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}