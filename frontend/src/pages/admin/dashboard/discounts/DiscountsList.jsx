import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BadgePercent, Pencil, Plus, Search, Trash2 } from "lucide-react";
import api from "../../../../api/client";
import { usePrefs } from "../../../../context/PrefsContext";

export default function DiscountsList() {
  const navigate = useNavigate();
  const { t } = usePrefs();
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [confirmId, setConfirmId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api.get("/discounts").then(({ data }) => { if (!cancelled) setDiscounts(Array.isArray(data) ? data : []); })
      .catch((err) => { if (!cancelled) setError(err?.response?.data?.message || t("adminDiscountList.failedLoad")); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/discounts/${id}`);
      setDiscounts((prev) => prev.filter((d) => d.id !== id));
      setConfirmId(null);
    } catch (err) {
      setError(err?.response?.data?.message || t("adminDiscountList.failedDelete"));
    }
  };

  const filtered = discounts.filter((d) =>
    (d.code || "").toLowerCase().includes(search.toLowerCase()) ||
    (d.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const fmtDate = (val) => {
    if (!val) return "—";
    try { return new Date(val).toLocaleDateString(); } catch { return "—"; }
  };

  const isActive = (d) => {
    if (d.is_active === false) return false;
    const now = new Date();
    if (d.starts_at && new Date(d.starts_at) > now) return false;
    if (d.ends_at && new Date(d.ends_at) < now) return false;
    return true;
  };

  const deleteButtons = (d) => (
    <div className="flex gap-2 items-center">
      <button className="bg-[var(--app-panel)] border border-[var(--app-edge2)] text-[var(--app-ink2)] w-[34px] h-[34px] rounded-[10px] cursor-pointer flex items-center justify-center text-[15px] transition-all duration-200 hover:bg-[var(--app-fill)] hover:text-[var(--app-ink)] [&.edit:hover]:bg-[rgba(229,9,20,0.15)] [&.edit:hover]:text-[#e50914] [&.edit:hover]:border-[rgba(229,9,20,0.3)]" title={t("common.edit")} onClick={() => navigate(`/admin/discounts/${d.id}/edit`)}><Pencil size={16} /></button>
      {confirmId === d.id ? (
        <div className="flex gap-2 items-center">
          <button className="inline-flex items-center gap-2 border-none cursor-pointer font-inherit py-2 px-3.5 text-[13px] font-bold rounded-[10px] transition-all duration-200 bg-[rgba(229,9,20,0.12)] text-[#e50914] border border-[rgba(229,9,20,0.35)] hover:bg-[rgba(229,9,20,0.2)]" onClick={() => handleDelete(d.id)}>{t("common.confirm")}</button>
          <button className="inline-flex items-center gap-2 border-none cursor-pointer font-inherit py-2 px-3.5 text-[13px] font-bold rounded-[10px] transition-all duration-200 bg-transparent text-[var(--app-ink2)] border border-[var(--app-edge2)] hover:bg-[var(--app-fill)]" onClick={() => setConfirmId(null)}>{t("common.cancel")}</button>
        </div>
      ) : (
        <button className="bg-[var(--app-panel)] border border-[var(--app-edge2)] text-[var(--app-ink2)] w-[34px] h-[34px] rounded-[10px] cursor-pointer flex items-center justify-center text-[15px] transition-all duration-200 hover:bg-[var(--app-fill)] hover:text-[var(--app-ink)] [&.delete:hover]:bg-[rgba(229,9,20,0.15)] [&.delete:hover]:text-[#e50914] [&.delete:hover]:border-[rgba(229,9,20,0.3)]" title={t("common.delete")} onClick={() => setConfirmId(d.id)}><Trash2 size={16} /></button>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-6 text-[var(--app-ink)] [&_*]:box-border">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[22px] sm:text-[26px] font-extrabold tracking-wide">{t("admin.discounts")}</h1>
          <p className="text-[14px] text-[var(--app-mute)] mt-1">{t("adminDiscountList.subtitle")}</p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 border-none cursor-pointer font-inherit py-[11px] px-5 text-[14px] font-bold rounded-xl transition-all duration-200 bg-[#e50914] text-white shadow-[0_4px_14px_rgba(229,9,20,0.35)] hover:bg-[#f40612] hover:-translate-y-px w-full sm:w-auto" onClick={() => navigate("/admin/discounts/create")}><Plus size={16} /> {t("admin.addDiscount")}</button>
      </div>

      {error && (
        <div className="bg-[rgba(229,9,20,0.12)] border border-[rgba(229,9,20,0.4)] text-[#ff6b6b] text-[13px] p-[10px_14px] rounded-[10px] flex justify-between items-center">
          {error}
          <button onClick={() => setError("")} className="bg-transparent border-none text-[#ff6b6b] text-[18px] cursor-pointer leading-none">×</button>
        </div>
      )}

      <div className="flex items-center gap-2.5 bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-xl py-2.5 px-3.5 text-[var(--app-mute)] w-full sm:max-w-xs">
        <span className="shrink-0"><Search size={16} /></span>
        <input className="bg-transparent border-none outline-none text-[var(--app-ink)] font-inherit text-[14px] w-full" placeholder={t("adminDiscountList.searchPlaceholder")} value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 px-5 text-center text-[var(--app-mute)]">
            <p>{t("adminDiscountList.loading")}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-[60px] px-5 text-center text-[var(--app-mute)]">
            <div className="text-[44px] mb-3"><BadgePercent size={32} /></div>
            <p>{t("adminDiscountList.noData")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 p-4 sm:p-5">
            {filtered.map((d) => (
              <div key={d.id} className="bg-[var(--app-panel2)] border border-[var(--app-edge2)] rounded-2xl overflow-hidden transition-colors hover:border-brand/40">
                <div className="p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-block rounded-lg bg-brand/10 px-3 py-1 text-[13px] font-bold text-brand tracking-wide">{d.code}</span>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${isActive(d) ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"}`}>
                      {isActive(d) ? t("adminDiscountList.active") : t("adminDiscountList.inactive")}
                    </span>
                  </div>

                  <div className="font-bold text-[var(--app-ink)] leading-snug">{d.name}</div>

                  {d.description && (
                    <div className="text-[13px] text-[var(--app-mute)] line-clamp-2 leading-snug">{d.description}</div>
                  )}

                  <div className="flex flex-wrap gap-x-5 gap-y-2 pt-2 border-t border-[var(--app-edge)] text-[12px] text-[var(--app-mute)]">
                    <span className="flex items-center gap-1.5">
                      <span className="font-semibold text-[var(--app-ink2)]">{t("adminDiscountList.value")}:</span>
                      {d.type === "fixed" ? `$${d.value}` : `${d.value}%`}
                    </span>
                    {d.min_amount && (
                      <span className="flex items-center gap-1.5">
                        <span className="font-semibold text-[var(--app-ink2)]">{t("adminDiscountList.minAmount")}:</span>
                        ${d.min_amount}
                      </span>
                    )}
                    {d.max_discount && (
                      <span className="flex items-center gap-1.5">
                        <span className="font-semibold text-[var(--app-ink2)]">{t("adminDiscountList.maxDiscount")}:</span>
                        ${d.max_discount}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-[var(--app-edge)]">
                    <span className="text-[11px] text-[var(--app-mute)]">{fmtDate(d.starts_at)} → {fmtDate(d.ends_at)}</span>
                    {deleteButtons(d)}
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