import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Plus, Search, Trash2, UsersRound } from "lucide-react";
import api from "../../../../api/client";
import { usePrefs } from "../../../../context/PrefsContext";

export default function TeamList() {
  const navigate = useNavigate();
  const { t } = usePrefs();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [confirmId, setConfirmId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api.get("/team-members").then(({ data }) => { if (!cancelled) setMembers(Array.isArray(data) ? data : []); })
      .catch((err) => { if (!cancelled) setError(err?.response?.data?.message || t("adminTeamList.failedLoad")); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/team-members/${id}`);
      setMembers((prev) => prev.filter((m) => m.id !== id));
      setConfirmId(null);
    } catch (err) {
      setError(err?.response?.data?.message || t("adminTeamList.failedDelete"));
    }
  };

  const filtered = members.filter((m) =>
    (m.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (m.role || "").toLowerCase().includes(search.toLowerCase())
  );

  const deleteButtons = (m) => (
    <div className="flex gap-2 items-center">
      <button className="bg-[var(--app-panel)] border border-[var(--app-edge2)] text-[var(--app-ink2)] w-[34px] h-[34px] rounded-[10px] cursor-pointer flex items-center justify-center text-[15px] transition-all duration-200 hover:bg-[var(--app-fill)] hover:text-[var(--app-ink)] [&.edit:hover]:bg-[rgba(229,9,20,0.15)] [&.edit:hover]:text-[#e50914] [&.edit:hover]:border-[rgba(229,9,20,0.3)]" title={t("common.edit")} onClick={() => navigate(`/admin/team/${m.id}/edit`)}><Pencil size={16} /></button>
      {confirmId === m.id ? (
        <div className="flex gap-2 items-center">
          <button className="inline-flex items-center gap-2 border-none cursor-pointer font-inherit py-2 px-3.5 text-[13px] font-bold rounded-[10px] transition-all duration-200 bg-[rgba(229,9,20,0.12)] text-[#e50914] border border-[rgba(229,9,20,0.35)] hover:bg-[rgba(229,9,20,0.2)]" onClick={() => handleDelete(m.id)}>{t("common.confirm")}</button>
          <button className="inline-flex items-center gap-2 border-none cursor-pointer font-inherit py-2 px-3.5 text-[13px] font-bold rounded-[10px] transition-all duration-200 bg-transparent text-[var(--app-ink2)] border border-[var(--app-edge2)] hover:bg-[var(--app-fill)]" onClick={() => setConfirmId(null)}>{t("common.cancel")}</button>
        </div>
      ) : (
        <button className="bg-[var(--app-panel)] border border-[var(--app-edge2)] text-[var(--app-ink2)] w-[34px] h-[34px] rounded-[10px] cursor-pointer flex items-center justify-center text-[15px] transition-all duration-200 hover:bg-[var(--app-fill)] hover:text-[var(--app-ink)] [&.delete:hover]:bg-[rgba(229,9,20,0.15)] [&.delete:hover]:text-[#e50914] [&.delete:hover]:border-[rgba(229,9,20,0.3)]" title={t("common.delete")} onClick={() => setConfirmId(m.id)}><Trash2 size={16} /></button>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-6 text-[var(--app-ink)] [&_*]:box-border">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[22px] sm:text-[26px] font-extrabold tracking-wide">{t("admin.team")}</h1>
          <p className="text-[14px] text-[var(--app-mute)] mt-1">{t("adminTeamList.subtitle")}</p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 border-none cursor-pointer font-inherit py-[11px] px-5 text-[14px] font-bold rounded-xl transition-all duration-200 bg-[#e50914] text-white shadow-[0_4px_14px_rgba(229,9,20,0.35)] hover:bg-[#f40612] hover:-translate-y-px w-full sm:w-auto" onClick={() => navigate("/admin/team/create")}><Plus size={16} /> {t("admin.addTeamMember")}</button>
      </div>

      {error && (
        <div className="bg-[rgba(229,9,20,0.12)] border border-[rgba(229,9,20,0.4)] text-[#ff6b6b] text-[13px] p-[10px_14px] rounded-[10px] flex justify-between items-center">
          {error}
          <button onClick={() => setError("")} className="bg-transparent border-none text-[#ff6b6b] text-[18px] cursor-pointer leading-none">×</button>
        </div>
      )}

      <div className="flex items-center gap-2.5 bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-xl py-2.5 px-3.5 text-[var(--app-mute)] w-full sm:max-w-xs">
        <span className="shrink-0"><Search size={16} /></span>
        <input className="bg-transparent border-none outline-none text-[var(--app-ink)] font-inherit text-[14px] w-full" placeholder={t("adminTeamList.searchPlaceholder")} value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 px-5 text-center text-[var(--app-mute)]">
            <p>{t("adminTeamList.loading")}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-[60px] px-5 text-center text-[var(--app-mute)]">
            <div className="text-[44px] mb-3"><UsersRound size={32} /></div>
            <p>{t("adminTeamList.noData")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 p-4 sm:p-5">
            {filtered.map((m) => (
              <div key={m.id} className="bg-[var(--app-panel2)] border border-[var(--app-edge2)] rounded-2xl overflow-hidden transition-colors hover:border-brand/40">
                <div className="relative h-[200px] overflow-hidden bg-[var(--app-fill)]">
                  {m.image ? (
                    <img src={m.image} alt={m.name} className="w-full h-full object-cover object-top" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--app-mute)]"><UsersRound size={40} /></div>
                  )}
                  {!m.is_active && (
                    <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-[rgba(0,0,0,0.7)] text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                      {t("adminTeamList.inactive")}
                    </span>
                  )}
                  <span className="absolute top-3 right-3 bg-[rgba(0,0,0,0.7)] text-white/80 text-[11px] font-bold px-2.5 py-1 rounded-full">
                    #{m.sort_order ?? m.id}
                  </span>
                </div>
                <div className="p-4">
                  <div className="font-bold text-[var(--app-ink)] leading-snug flex items-center justify-between gap-3">
                    <span className="min-w-0 truncate">{m.name}</span>
                    {m.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="text-[12px] text-[var(--app-mute)] mt-0.5 mb-3">{m.role || "N/A"}</div>
                  <div className="pt-3 border-t border-[var(--app-edge)] flex items-center justify-between gap-2">
                    <span className="text-[12px] text-[var(--app-mute)]">#{String(m.id).padStart(3, "0")}</span>
                    {deleteButtons(m)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}