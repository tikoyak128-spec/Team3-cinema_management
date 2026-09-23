import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarClock, Clapperboard, Pencil, Plus, Search, Tag, Upload } from "lucide-react";
import Select from "../../../../components/Select";
import api from "../../../../api/client";
import { usePrefs } from "../../../../context/PrefsContext";

const today = () => new Date().toISOString().slice(0, 10);

function isFuture(releaseDate) {
  if (!releaseDate) return false;
  return String(releaseDate).slice(0, 10) > today();
}

export default function ComingSoonList() {
  const navigate = useNavigate();
  const { t } = usePrefs();
  const [movies, setMovies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [draftDate, setDraftDate] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .get("/movies")
      .then(({ data }) => {
        if (!cancelled && Array.isArray(data)) setMovies(data);
      })
      .catch(() => {
        if (!cancelled) setError("adminComingSoon.failedLoad");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    api
      .get("/categories")
      .then(({ data }) => {
        if (!cancelled && Array.isArray(data)) setCategories(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return movies
      .filter((m) => {
        if (!isFuture(m.release_date)) return false;
        const matchesSearch =
          !term ||
          m.title.toLowerCase().includes(term) ||
          (m.category?.name || "").toLowerCase().includes(term);
        const matchesCategory =
          category === "all" || String(m.movie_category_id) === String(category);
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => String(a.release_date || "").localeCompare(String(b.release_date || "")));
  }, [movies, search, category]);

  const soonCount = movies.filter((m) => isFuture(m.release_date)).length;

  const saveDate = async (id) => {
    if (!draftDate) return;
    setSaving(true);
    setError("");
    try {
      await api.put(`/movies/${id}`, { release_date: draftDate });
      setMovies((prev) => prev.map((m) => (m.id === id ? { ...m, release_date: draftDate } : m)));
      setEditingId(null);
      setDraftDate("");
    } catch (err) {
      setError(err?.response?.data?.message || t("adminComingSoon.failedSave"));
    } finally {
      setSaving(false);
    }
  };

  const setReleasedToday = async (id) => {
    const date = today();
    setSaving(true);
    setError("");
    try {
      await api.put(`/movies/${id}`, { release_date: date });
      setMovies((prev) => prev.map((m) => (m.id === id ? { ...m, release_date: date } : m)));
    } catch (err) {
      setError(err?.response?.data?.message || t("adminComingSoon.failedSave"));
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return "—";
    const [y, m, day] = String(d).slice(0, 10).split("-");
    if (!y || !m || !day) return String(d);
    const date = new Date(y, m - 1, day);
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const badge = () => (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[rgba(234,179,8,0.12)] border border-[rgba(234,179,8,0.4)] text-[#e0a800]">
      <CalendarClock size={12} /> {t("adminComingSoon.soonBadge")}
    </span>
  );

  const rows = (m) => (
    <>
      <td>
        <div className="flex items-center gap-3">
          <div className="w-[44px] h-[60px] rounded-lg object-cover bg-[var(--app-panel2)] overflow-hidden shrink-0">
            {m.poster ? <img src={m.poster} alt={m.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[var(--app-mute)]"><Clapperboard size={16} /></div>}
          </div>
          <div>
            <div className="font-bold text-[var(--app-ink)]">{m.title}</div>
            <div className="text-[12px] text-[var(--app-mute)]">MOV-{String(m.id).padStart(3, "0")}</div>
          </div>
        </div>
      </td>
      <td><span className="inline-flex items-center gap-1.5 bg-[var(--app-panel2)] border border-[var(--app-edge2)] text-[var(--app-ink2)] py-1.5 px-3 rounded-[10px] text-[13px] font-semibold"><Tag size={13} /> {m.category?.name || "N/A"}</span></td>
      <td>
        {editingId === m.id ? (
          <div className="flex items-center gap-2">
            <input
              type="date"
              className="bg-[var(--app-panel2)] border border-[var(--app-edge)] rounded-xl py-1.5 px-3 text-[var(--app-ink)] font-inherit text-[13px] outline-none focus:border-[#e50914]"
              value={draftDate}
              onChange={(e) => setDraftDate(e.target.value)}
            />
            <button
              className="inline-flex items-center gap-1.5 border-none cursor-pointer font-inherit py-1.5 px-3 text-[12px] font-bold rounded-[10px] bg-[#e50914] text-white hover:bg-[#f40612] disabled:opacity-50"
              disabled={saving || !draftDate}
              onClick={() => saveDate(m.id)}
            >
              {t("common.save")}
            </button>
            <button className="inline-flex items-center gap-1.5 border cursor-pointer font-inherit py-1.5 px-3 text-[12px] font-bold rounded-[10px] bg-transparent text-[var(--app-ink2)] border-[var(--app-edge2)] hover:bg-[var(--app-fill)]" onClick={() => { setEditingId(null); setDraftDate(""); }}>{t("common.cancel")}</button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-[var(--app-ink2)]">{formatDate(m.release_date)}</span>
            <button className="flex items-center justify-center w-[30px] h-[30px] rounded-[8px] bg-[var(--app-panel2)] border border-[var(--app-edge2)] text-[var(--app-ink2)] cursor-pointer hover:bg-[rgba(229,9,20,0.15)] hover:text-[#e50914] hover:border-[rgba(229,9,20,0.3)]" title={t("adminComingSoon.editDate")} onClick={() => { setEditingId(m.id); setDraftDate(String(m.release_date || "").slice(0, 10)); }}><Pencil size={13} /></button>
          </div>
        )}
      </td>
      <td>{badge(m)}</td>
      <td>
        <div className="flex gap-2 items-center">
          <button
            className="inline-flex items-center gap-1.5 border-none cursor-pointer font-inherit py-2 px-3 text-[12px] font-bold rounded-[10px] bg-[rgba(34,197,94,0.12)] text-[#22c55e] border border-[rgba(34,197,94,0.3)] hover:bg-[rgba(34,197,94,0.2)] disabled:opacity-50"
            title={t("adminComingSoon.releaseNow")}
            disabled={saving}
            onClick={() => setReleasedToday(m.id)}
          >
            <Upload size={13} /> {t("adminComingSoon.releaseNow")}
          </button>
        </div>
      </td>
    </>
  );

  return (
    <div className="flex flex-col gap-6 text-[var(--app-ink)] [&_*]:box-border">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[22px] sm:text-[26px] font-extrabold tracking-wide">{t("admin.comingSoon")}</h1>
          <p className="text-[14px] text-[var(--app-mute)] mt-1">{t("adminComingSoon.subtitle")}</p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 border-none cursor-pointer font-inherit py-[11px] px-5 text-[14px] font-bold rounded-xl transition-all duration-200 bg-[#e50914] text-white shadow-[0_4px_14px_rgba(229,9,20,0.35)] hover:bg-[#f40612] hover:-translate-y-px w-full sm:w-auto" onClick={() => navigate("/admin/movies/create")}>
          <Plus size={16} /> {t("admin.addMovie")}
        </button>
      </div>

      {error && (
        <div className="bg-[rgba(229,9,20,0.12)] border border-[rgba(229,9,20,0.4)] text-[#ff6b6b] text-[13px] p-[10px_14px] rounded-[10px] flex justify-between items-center">
          {error === "adminComingSoon.failedLoad" || error === "adminComingSoon.failedSave" ? t(error) : error}
          <button onClick={() => setError("")} className="bg-transparent border-none text-[#ff6b6b] text-[18px] cursor-pointer leading-none">×</button>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center gap-3 flex-wrap">
        <div className="flex w-full sm:w-auto items-center gap-1.5 bg-[rgba(234,179,8,0.12)] border border-[rgba(234,179,8,0.3)] rounded-full px-4 py-2.5">
          <CalendarClock size={14} className="text-[#e0a800]" />
          <span className="text-[13px] font-bold text-[#e0a800]">{t("nav.comingSoon")} <span className="opacity-70">({soonCount})</span></span>
        </div>
        <div className="flex items-center gap-2.5 bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-xl py-2.5 px-3.5 text-[var(--app-mute)] flex-1 md:max-w-xs">
          <span className="shrink-0"><Search size={16} /></span>
          <input className="bg-transparent border-none outline-none text-[var(--app-ink)] font-inherit text-[14px] w-full" placeholder={t("adminComingSoon.searchPlaceholder")} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select
          containerClassName="relative w-full sm:w-auto"
          className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-xl py-2.5 pl-3.5 pr-3 text-[14px] text-[var(--app-ink)] font-inherit outline-none cursor-pointer appearance-none w-full sm:w-[200px]"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="all">{t("adminComingSoon.allCategories")}</option>
          {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
        </Select>
      </div>

      <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 px-5 text-center text-[var(--app-mute)]">
            <p>{t("adminComingSoon.loading")}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-[60px] px-5 text-center text-[var(--app-mute)]">
            <div className="text-[44px] mb-3"><CalendarClock size={32} /></div>
            <p>{t("adminComingSoon.noData")}</p>
          </div>
        ) : (
          <>
            <div className="md:hidden flex flex-col gap-3 p-4 sm:p-5">
              {filtered.map((m) => (
                <div key={m.id} className="bg-[var(--app-panel2)] border border-[var(--app-edge2)] rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-[48px] h-[64px] rounded-lg bg-[var(--app-panel)] overflow-hidden shrink-0 flex items-center justify-center text-[var(--app-mute)]">
                      {m.poster ? <img src={m.poster} alt={m.title} className="w-full h-full object-cover" /> : <Clapperboard size={18} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-[var(--app-ink)] leading-snug">{m.title}</div>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {badge(m)}
                        <span className="inline-flex items-center gap-1 bg-[var(--app-fill)] border border-[var(--app-edge2)] text-[var(--app-ink2)] py-0.5 px-2 rounded-[8px] text-[11px] font-semibold"><Tag size={10} /> {m.category?.name || "N/A"}</span>
                      </div>
                      <div className="text-[12px] text-[var(--app-mute)] mt-1.5">{t("adminMovieList.releaseDate")}: {formatDate(m.release_date)}</div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-[var(--app-edge)] flex flex-wrap items-center gap-2">
                    {editingId === m.id ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <input type="date" className="bg-[var(--app-panel2)] border border-[var(--app-edge)] rounded-xl py-1.5 px-3 text-[var(--app-ink)] font-inherit text-[13px] outline-none focus:border-[#e50914]" value={draftDate} onChange={(e) => setDraftDate(e.target.value)} />
                        <button className="inline-flex items-center gap-1.5 border-none cursor-pointer font-inherit py-1.5 px-3 text-[12px] font-bold rounded-[10px] bg-[#e50914] text-white hover:bg-[#f40612] disabled:opacity-50" disabled={saving || !draftDate} onClick={() => saveDate(m.id)}>{t("common.save")}</button>
                        <button className="inline-flex items-center gap-1.5 border cursor-pointer font-inherit py-1.5 px-3 text-[12px] font-bold rounded-[10px] bg-transparent text-[var(--app-ink2)] border-[var(--app-edge2)] hover:bg-[var(--app-fill)]" onClick={() => { setEditingId(null); setDraftDate(""); }}>{t("common.cancel")}</button>
                      </div>
                    ) : (
                      <button className="inline-flex items-center gap-1.5 border cursor-pointer font-inherit py-1.5 px-3 text-[12px] font-bold rounded-[10px] bg-[var(--app-panel2)] text-[var(--app-ink2)] border-[var(--app-edge2)] hover:bg-[rgba(229,9,20,0.08)] hover:text-brand" onClick={() => { setEditingId(m.id); setDraftDate(String(m.release_date || "").slice(0, 10)); }}><Pencil size={12} /> {t("adminComingSoon.editDate")}</button>
                    )}
                    <button className="inline-flex items-center gap-1.5 border cursor-pointer font-inherit py-1.5 px-3 text-[12px] font-bold rounded-[10px] bg-[var(--app-panel2)] text-[var(--app-ink2)] border-[var(--app-edge2)] hover:text-brand" onClick={() => navigate(`/admin/movies/${m.id}/edit`)}><Clapperboard size={12} /> {t("adminComingSoon.editMovie")}</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse text-[14px] [&>thead_th]:text-left [&>thead_th]:py-[14px] [&>thead_th]:px-[18px] [&>thead_th]:text-[var(--app-mute)] [&>thead_th]:text-[12px] [&>thead_th]:font-bold [&>thead_th]:uppercase [&>thead_th]:tracking-widest [&>thead_th]:border-b [&>thead_th]:border-[var(--app-edge)] [&>thead_th]:bg-[var(--app-fill)] [&>thead_th]:whitespace-nowrap [&>th]:sticky [&>th]:top-0 [&>th]:z-5 [&>th]:bg-[var(--app-panel)] [&>tbody_td]:py-[14px] [&>tbody_td]:px-[18px] [&>tbody_td]:border-b [&>tbody_td]:border-[var(--app-edge)] [&>tbody_td]:text-[var(--app-ink2)] [&>tbody_td]:align-middle [&>tbody>tr]:transition-colors [&>tbody>tr]:duration-150 [&>tbody>tr:hover]:bg-[var(--app-fill)] [&>tbody>tr:last-child>td]:border-b-0">
                <thead>
                  <tr>
                    <th>{t("adminMovieList.movie")}</th>
                    <th>{t("adminMovieList.category")}</th>
                    <th>{t("adminMovieList.releaseDate")}</th>
                    <th>{t("adminComingSoon.status")}</th>
                    <th>{t("adminComingSoon.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m) => (<tr key={m.id}>{rows(m)}</tr>))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}