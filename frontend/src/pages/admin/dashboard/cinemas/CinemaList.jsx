import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, MapPin, Pencil, Plus, Search, Trash2 } from "lucide-react";
import api from "../../../../api/client";
import { usePrefs } from "../../../../context/PrefsContext";

export default function CinemaList() {
  const navigate = useNavigate();
  const { t } = usePrefs();
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [confirmId, setConfirmId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api.get("/cinemas").then(({ data }) => { if (!cancelled) setCinemas(data); })
      .catch((err) => { if (!cancelled) setError(err?.response?.data?.message || t("adminCinemaList.failedLoad")); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/cinemas/${id}`);
      setCinemas((prev) => prev.filter((c) => c.id !== id));
      setConfirmId(null);
    } catch (err) {
      setError(err?.response?.data?.message || t("adminCinemaList.failedDelete"));
    }
  };

  const filtered = cinemas.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.location.toLowerCase().includes(search.toLowerCase())
  );

  const deleteButtons = (c) => (
    <div className="flex gap-2 items-center">
      <button className="bg-[var(--app-panel)] border border-[var(--app-edge2)] text-[var(--app-ink2)] w-[34px] h-[34px] rounded-[10px] cursor-pointer flex items-center justify-center text-[15px] transition-all duration-200 hover:bg-[var(--app-fill)] hover:text-[var(--app-ink)] [&.edit:hover]:bg-[rgba(229,9,20,0.15)] [&.edit:hover]:text-[#e50914] [&.edit:hover]:border-[rgba(229,9,20,0.3)]" title={t("common.edit")} onClick={() => navigate(`/admin/cinemas/${c.id}/edit`)}><Pencil size={16} /></button>
      {confirmId === c.id ? (
        <div className="flex gap-2 items-center">
          <button className="inline-flex items-center gap-2 border-none cursor-pointer font-inherit py-2 px-3.5 text-[13px] font-bold rounded-[10px] transition-all duration-200 bg-[rgba(229,9,20,0.12)] text-[#e50914] border border-[rgba(229,9,20,0.35)] hover:bg-[rgba(229,9,20,0.2)]" onClick={() => handleDelete(c.id)}>{t("common.confirm")}</button>
          <button className="inline-flex items-center gap-2 border-none cursor-pointer font-inherit py-2 px-3.5 text-[13px] font-bold rounded-[10px] transition-all duration-200 bg-transparent text-[var(--app-ink2)] border border-[var(--app-edge2)] hover:bg-[var(--app-fill)]" onClick={() => setConfirmId(null)}>{t("common.cancel")}</button>
        </div>
      ) : (
        <button className="bg-[var(--app-panel)] border border-[var(--app-edge2)] text-[var(--app-ink2)] w-[34px] h-[34px] rounded-[10px] cursor-pointer flex items-center justify-center text-[15px] transition-all duration-200 hover:bg-[var(--app-fill)] hover:text-[var(--app-ink)] [&.delete:hover]:bg-[rgba(229,9,20,0.15)] [&.delete:hover]:text-[#e50914] [&.delete:hover]:border-[rgba(229,9,20,0.3)]" title={t("common.delete")} onClick={() => setConfirmId(c.id)}><Trash2 size={16} /></button>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-6 text-[var(--app-ink)] [&_*]:box-border">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[22px] sm:text-[26px] font-extrabold tracking-wide">{t("admin.cinemas")}</h1>
          <p className="text-[14px] text-[var(--app-mute)] mt-1">{t("adminCinemaList.subtitle")}</p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 border-none cursor-pointer font-inherit py-[11px] px-5 text-[14px] font-bold rounded-xl transition-all duration-200 bg-[#e50914] text-white shadow-[0_4px_14px_rgba(229,9,20,0.35)] hover:bg-[#f40612] hover:-translate-y-px w-full sm:w-auto" onClick={() => navigate("/admin/cinemas/create")}><Plus size={16} /> {t("admin.addCinema")}</button>
      </div>

      {error && (
        <div className="bg-[rgba(229,9,20,0.12)] border border-[rgba(229,9,20,0.4)] text-[#ff6b6b] text-[13px] p-[10px_14px] rounded-[10px] flex justify-between items-center">
          {error}
          <button onClick={() => setError("")} className="bg-transparent border-none text-[#ff6b6b] text-[18px] cursor-pointer leading-none">×</button>
        </div>
      )}

      <div className="flex items-center gap-2.5 bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-xl py-2.5 px-3.5 text-[var(--app-mute)] w-full sm:max-w-xs">
        <span className="shrink-0"><Search size={16} /></span>
        <input className="bg-transparent border-none outline-none text-[var(--app-ink)] font-inherit text-[14px] w-full" placeholder={t("adminCinemaList.searchPlaceholder")} value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 px-5 text-center text-[var(--app-mute)]">
            <p>{t("adminCinemaList.loading")}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-[60px] px-5 text-center text-[var(--app-mute)]">
            <div className="text-[44px] mb-3"><Building2 size={32} /></div>
            <p>{t("adminCinemaList.noData")}</p>
          </div>
        ) : (
          <>
            {/* Mobile / tablet card list */}
            <div className="md:hidden flex flex-col gap-3 p-4 sm:p-5">
              {filtered.map((c) => (
                <div key={c.id} className="bg-[var(--app-panel2)] border border-[var(--app-edge2)] rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-[38px] h-[38px] rounded-full bg-[rgba(229,9,20,0.12)] flex items-center justify-center text-[16px] shrink-0"><Building2 size={18} /></div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-[var(--app-ink)] leading-snug">{c.name}</div>
                      <div className="text-[12px] text-[var(--app-mute)] mt-0.5">CIN-{String(c.id).padStart(3, "0")}</div>
                    </div>
                    <div className="shrink-0">{deleteButtons(c)}</div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-[var(--app-edge)] flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px]">
                    <span className="inline-flex items-center gap-1.5 text-[var(--app-mute)]"><MapPin size={14} /> {c.location}</span>
                    <span className="ml-auto inline-flex items-center gap-1.5 bg-[var(--app-fill)] border border-[var(--app-edge2)] text-[var(--app-ink2)] py-1 px-2.5 rounded-[8px] text-[12px] font-semibold">{t("adminCinemaList.roomsCount", { count: c.rooms?.length || 0 })}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse text-[14px] [&>thead_th]:text-left [&>thead_th]:py-[14px] [&>thead_th]:px-[18px] [&>thead_th]:text-[var(--app-mute)] [&>thead_th]:text-[12px] [&>thead_th]:font-bold [&>thead_th]:uppercase [&>thead_th]:tracking-widest [&>thead_th]:border-b [&>thead_th]:border-[var(--app-edge)] [&>thead_th]:bg-[var(--app-fill)] [&>thead_th]:whitespace-nowrap [&>th]:sticky [&>th]:top-[70px] [&>th]:z-5 [&>th]:bg-[var(--app-panel)] [&>tbody_td]:py-[14px] [&>tbody_td]:px-[18px] [&>tbody_td]:border-b [&>tbody_td]:border-[var(--app-edge)] [&>tbody_td]:text-[var(--app-ink2)] [&>tbody_td]:align-middle [&>tbody>tr]:transition-colors [&>tbody>tr]:duration-150 [&>tbody>tr:hover]:bg-[var(--app-fill)] [&>tbody>tr:last-child>td]:border-b-0">
                <thead><tr><th>{t("adminCinemaList.cinema")}</th><th>{t("adminCinemaList.location")}</th><th>{t("adminCinemaList.rooms")}</th><th>{t("common.actions")}</th></tr></thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-[38px] h-[38px] rounded-full bg-[rgba(229,9,20,0.12)] flex items-center justify-center text-[16px] shrink-0"><Building2 size={18} /></div>
                          <div>
                            <div className="font-bold text-[var(--app-ink)]">{c.name}</div>
                            <div className="text-[12px] text-[var(--app-mute)]">CIN-{String(c.id).padStart(3, "0")}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="inline-flex items-center gap-1"><MapPin size={13} /> {c.location}</span></td>
                      <td>{c.rooms?.length || 0}</td>
                      <td>{deleteButtons(c)}</td>
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