import { useEffect, useState } from "react";
import { Star, Star as StarIcon, Trash2 } from "lucide-react";
import api from "../../../../api/client";
import { usePrefs } from "../../../../context/PrefsContext";

function Stars({ value }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <StarIcon
          key={n}
          size={14}
          className={n <= value ? "text-[#eab308] fill-[#eab308]" : "text-[var(--app-mute)]"}
        />
      ))}
    </div>
  );
}

export default function ReviewsList() {
  const { t } = usePrefs();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [confirmId, setConfirmId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get("/reviews")
      .then(({ data }) => {
        if (!cancelled) setReviews(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.response?.data?.message || t("adminReviews.failedLoad"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/reviews/${id}`);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      setConfirmId(null);
    } catch (err) {
      setError(err?.response?.data?.message || t("adminReviews.failedDelete"));
    }
  };

  const filtered = reviews.filter((r) => {
    const q = search.toLowerCase();
    return (
      (r.movie?.title || "").toLowerCase().includes(q) ||
      (r.user?.name || "").toLowerCase().includes(q) ||
      (r.comment || "").toLowerCase().includes(q)
    );
  });

  const deleteButton = (r) => (
    <div className="flex gap-2 items-center">
      {confirmId === r.id ? (
        <div className="flex gap-2 items-center">
          <button
            className="inline-flex items-center gap-2 cursor-pointer py-2 px-3.5 text-[13px] font-bold rounded-[10px] transition-all duration-200 bg-[rgba(229,9,20,0.12)] text-[#e50914] border border-[rgba(229,9,20,0.35)] hover:bg-[rgba(229,9,20,0.2)]"
            onClick={() => handleDelete(r.id)}
          >
            {t("common.confirm")}
          </button>
          <button
            className="inline-flex items-center gap-2 cursor-pointer py-2 px-3.5 text-[13px] font-bold rounded-[10px] transition-all duration-200 bg-transparent text-[var(--app-ink2)] border border-[var(--app-edge2)] hover:bg-[var(--app-fill)]"
            onClick={() => setConfirmId(null)}
          >
            {t("common.cancel")}
          </button>
        </div>
      ) : (
        <button
          className="bg-[var(--app-panel)] border border-[var(--app-edge2)] text-[var(--app-ink2)] w-[34px] h-[34px] rounded-[10px] cursor-pointer flex items-center justify-center transition-all duration-200 hover:bg-[rgba(229,9,20,0.15)] hover:text-[#e50914] hover:border-[rgba(229,9,20,0.3)]"
          title={t("common.delete")}
          onClick={() => setConfirmId(r.id)}
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-6 text-[var(--app-ink)] [&_*]:box-border">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[22px] sm:text-[26px] font-extrabold tracking-wide">
            {t("admin.reviews")}
          </h1>
          <p className="text-[14px] text-[var(--app-mute)] mt-1">{t("adminReviews.subtitle")}</p>
        </div>
        <span className="text-[14px] text-[var(--app-mute)]">
          {t("adminReviews.totalLabel")}{" "}
          <b className="text-[var(--app-ink)]">{reviews.length}</b>
        </span>
      </div>

      {error && (
        <div className="bg-[rgba(229,9,20,0.12)] border border-[rgba(229,9,20,0.4)] text-[#ff6b6b] text-[13px] p-[10px_14px] rounded-[10px] flex justify-between items-center">
          {error}
          <button
            onClick={() => setError("")}
            className="bg-transparent border-none text-[#ff6b6b] text-[18px] cursor-pointer leading-none"
          >
            ×
          </button>
        </div>
      )}

      <div className="flex items-center gap-2.5 bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-xl py-2.5 px-3.5 text-[var(--app-mute)] w-full sm:max-w-xs">
        <span className="shrink-0">
          <Star size={16} />
        </span>
        <input
          className="bg-transparent border-none outline-none text-[var(--app-ink)] font-inherit text-[14px] w-full"
          placeholder={t("adminReviews.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 px-5 text-center text-[var(--app-mute)]">
            <p>{t("adminReviews.loading")}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-[60px] px-5 text-center text-[var(--app-mute)]">
            <div className="text-[44px] mb-3">
              <Star size={32} />
            </div>
            <p>{t("adminReviews.noData")}</p>
          </div>
        ) : (
          <>
            {/* Mobile / tablet card list */}
            <div className="md:hidden flex flex-col gap-3 p-4 sm:p-5">
              {filtered.map((r) => (
                <div key={r.id} className="bg-[var(--app-panel2)] border border-[var(--app-edge2)] rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-[38px] h-[38px] rounded-full bg-[rgba(229,9,20,0.12)] flex items-center justify-center font-bold text-brand shrink-0">
                      {(r.user?.name || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-[var(--app-ink)] leading-snug">
                        {r.movie?.title || "N/A"}
                      </div>
                      <div className="text-[12px] text-[var(--app-mute)] mt-0.5">
                        {r.user?.name || "User"} · {new Date(r.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="shrink-0">{deleteButton(r)}</div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-[var(--app-edge)] flex flex-col gap-2">
                    <Stars value={r.rating} />
                    {r.comment && (
                      <p className="text-[13px] text-[var(--app-ink2)] leading-relaxed">{r.comment}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse text-[14px] [&>thead_th]:text-left [&>thead_th]:py-[14px] [&>thead_th]:px-[18px] [&>thead_th]:text-[var(--app-mute)] [&>thead_th]:text-[12px] [&>thead_th]:font-bold [&>thead_th]:uppercase [&>thead_th]:tracking-widest [&>thead_th]:border-b [&>thead_th]:border-[var(--app-edge)] [&>thead_th]:bg-[var(--app-fill)] [&>thead_th]:whitespace-nowrap [&>th]:sticky [&>th]:top-0 [&>th]:z-5 [&>th]:bg-[var(--app-panel)] [&>tbody_td]:py-[14px] [&>tbody_td]:px-[18px] [&>tbody_td]:border-b [&>tbody_td]:border-[var(--app-edge)] [&>tbody_td]:text-[var(--app-ink2)] [&>tbody_td]:align-middle [&>tbody>tr]:transition-colors [&>tbody>tr]:duration-150 [&>tbody>tr:hover]:bg-[var(--app-fill)] [&>tbody>tr:last-child>td]:border-b-0">
                <thead>
                  <tr>
                    <th>{t("adminReviews.movie")}</th>
                    <th>{t("adminReviews.user")}</th>
                    <th>{t("adminReviews.rating")}</th>
                    <th>{t("adminReviews.comment")}</th>
                    <th>{t("adminReviews.date")}</th>
                    <th>{t("common.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <span className="font-bold text-[var(--app-ink)]">
                          {r.movie?.title || "N/A"}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-[34px] h-[34px] rounded-full bg-[rgba(229,9,20,0.12)] flex items-center justify-center font-bold text-brand shrink-0">
                            {(r.user?.name || "?").charAt(0).toUpperCase()}
                          </div>
                          <span>{r.user?.name || "User"}</span>
                        </div>
                      </td>
                      <td>
                        <Stars value={r.rating} />
                      </td>
                      <td className="max-w-[320px] text-[13px] text-[var(--app-mute)]">
                        {r.comment || "—"}
                      </td>
                      <td className="text-[12px] text-[var(--app-mute)]">
                        {new Date(r.created_at).toLocaleDateString()}
                      </td>
                      <td>{deleteButton(r)}</td>
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
