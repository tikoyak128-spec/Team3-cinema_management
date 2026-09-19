import { useEffect, useState } from "react";
import { Check, Image, RefreshCw, Save } from "lucide-react";
import api, { buildFormData } from "../../../../api/client";
import { usePrefs } from "../../../../context/PrefsContext";

const PAGE_SLOTS = [
  {
    key: "about",
    titleKey: "adminHeroes.about",
    defaultImage:
      "https://s.studiobinder.com/wp-content/uploads/2025/05/Film-Lighting-and-Artificial-Lighting-on-Movie-Set-Production-Cast-and-Crew.jpg",
  },
  {
    key: "services",
    titleKey: "adminHeroes.services",
    defaultImage:
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=1200&fit=crop",
  },
  {
    key: "movies",
    titleKey: "adminHeroes.movies",
    defaultImage: "https://images.thedirect.com/media/article_full/disney-2025.jpg",
  },
  {
    key: "cinemas",
    titleKey: "adminHeroes.cinemas",
    defaultImage:
      "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&h=1200&fit=crop",
  },
  {
    key: "promotions",
    titleKey: "adminHeroes.promotions",
    defaultImage:
      "https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=1400&h=700&fit=crop",
  },
];

export default function HeroesList() {
  const { t } = usePrefs();
  const [heroes, setHeroes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [urls, setUrls] = useState({});
  const [files, setFiles] = useState({});
  const [savingKey, setSavingKey] = useState(null);
  const [savedKey, setSavedKey] = useState("");

  useEffect(() => {
    let cancelled = false;
    api
      .get("/heroes")
      .then(({ data }) => {
        if (cancelled) return;
        const list = Array.isArray(data) ? data : [];
        setHeroes(list);
        const initial = {};
        PAGE_SLOTS.forEach((slot) => {
          const record = list.find((h) => h.page === slot.key);
          initial[slot.key] = record?.image || slot.defaultImage;
        });
        setUrls(initial);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err?.response?.data?.message || t("adminHeroes.failedLoad"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [t]);

  const byPage = (key) => heroes.find((h) => h.page === key);

  const setFile = (key, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFiles((prev) => ({ ...prev, [key]: file }));
    setUrls((prev) => ({ ...prev, [key]: URL.createObjectURL(file) }));
  };

  const handleSave = async (slot) => {
    setSavingKey(slot.key);
    setError("");
    setSavedKey("");
    const url = (urls[slot.key] || "").trim();
    const file = files[slot.key];

    if (!url && !file) {
      setError(t("adminHeroes.noImage"));
      setSavingKey(null);
      return;
    }

    const record = byPage(slot.key);

    try {
      let data;
      if (file) {
        const payload = buildFormData({ page: slot.key, image: null, image_file: file });
        if (record) {
          payload.append("_method", "put");
          data = (await api.post(`/heroes/${record.id}`, payload)).data;
        } else {
          data = (await api.post("/heroes", payload)).data;
        }
      } else if (record) {
        data = (await api.put(`/heroes/${record.id}`, { page: slot.key, image: url })).data;
      } else {
        data = (await api.post("/heroes", { page: slot.key, image: url })).data;
      }

      setHeroes((prev) => {
        const exists = prev.some((h) => h.id === data.id);
        return exists ? prev.map((h) => (h.id === data.id ? data : h)) : [...prev, data];
      });
      setUrls((prev) => ({ ...prev, [slot.key]: data.image }));
      setFiles((prev) => ({ ...prev, [slot.key]: null }));
      setSavedKey(slot.key);
      setTimeout(() => setSavedKey(""), 2200);
    } catch (err) {
      setError(
        err?.response?.data?.errors?.page?.[0] ||
          err?.response?.data?.errors?.image?.[0] ||
          err?.response?.data?.message ||
          t("adminHeroes.failedSave")
      );
    } finally {
      setSavingKey(null);
    }
  };

  const inputClass =
    "bg-[var(--app-panel2)] border border-[var(--app-edge)] rounded-xl py-3 px-3.5 text-[var(--app-ink)] font-inherit text-[14px] outline-none transition-colors duration-200 focus:border-[#e50914]";

  if (loading) {
    return (
      <div className="flex flex-col gap-6 text-[var(--app-ink)] [&_*]:box-border">
        <div className="flex flex-col items-center justify-center py-[60px] px-5 text-center text-[var(--app-mute)]">
          <p>{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 text-[var(--app-ink)] [&_*]:box-border">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[22px] sm:text-[26px] font-extrabold tracking-wide flex items-center gap-2">
            <Image size={24} /> {t("admin.heroImages")}
          </h1>
          <p className="text-[14px] text-[var(--app-mute)] mt-1">{t("adminHeroes.subtitle")}</p>
        </div>
        <span className="text-[14px] text-[var(--app-mute)]">
          {t("adminHeroes.pageLabel")} <b className="text-[var(--app-ink)]">{PAGE_SLOTS.length}</b>
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

      <div className="flex flex-col gap-5">
        {PAGE_SLOTS.map((slot) => {
          const isSaving = savingKey === slot.key;
          const isSaved = savedKey === slot.key;
          return (
            <div
              key={slot.key}
              className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl p-5 sm:p-6 flex flex-col lg:flex-row gap-5 lg:items-start transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-3 gap-3">
                  <h3 className="text-[16px] font-extrabold tracking-wide">
                    {t(slot.titleKey)}
                  </h3>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[var(--app-panel2)] border border-[var(--app-edge)] text-[var(--app-mute)]">
                    /{slot.key}
                  </span>
                </div>

                <div className="relative overflow-hidden rounded-xl border border-[var(--app-edge)] aspect-[16/7] bg-[var(--app-panel2)]">
                  {urls[slot.key] ? (
                    <img
                      src={urls[slot.key]}
                      alt={t(slot.titleKey)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--app-mute)]">
                      <Image size={28} />
                    </div>
                  )}
                  {isSaved && (
                    <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 bg-emerald-500 text-white text-[12px] font-bold px-3 py-1.5 rounded-full shadow">
                      <Check size={13} /> {t("adminHeroes.saved")}
                    </span>
                  )}
                </div>
              </div>

              <div className="lg:w-[340px] shrink-0 flex flex-col gap-3 lg:pt-9">
                <div className="flex flex-col gap-[7px]">
                  <label className="text-[13px] font-bold text-[var(--app-ink2)]">
                    {t("adminHeroes.uploadHint")}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    key={slot.key + (files[slot.key] ? "set" : "")}
                    onChange={(e) => setFile(slot.key, e)}
                    className="text-[13px] text-[var(--app-mute)] file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-none file:bg-[var(--app-panel2)] file:text-[var(--app-ink)] file:font-bold file:cursor-pointer file:transition-colors hover:file:bg-[var(--app-edge2)] cursor-pointer"
                  />
                </div>
                <div className="flex flex-col gap-[7px]">
                  <label className="text-[13px] font-bold text-[var(--app-ink2)]">
                    {t("adminCinemaForm.imageUrl")}
                  </label>
                  <input
                    className={inputClass}
                    placeholder={t("adminHeroes.urlPh")}
                    value={urls[slot.key] || ""}
                    onChange={(e) => {
                      setUrls((prev) => ({ ...prev, [slot.key]: e.target.value }));
                      setFiles((prev) => ({ ...prev, [slot.key]: null }));
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleSave(slot)}
                  disabled={isSaving}
                  className="inline-flex items-center justify-center gap-2 border-none cursor-pointer font-inherit py-[11px] px-5 text-[14px] font-bold rounded-xl transition-all duration-200 bg-[#e50914] text-white shadow-[0_4px_14px_rgba(229,9,20,0.35)] hover:bg-[#f40612] hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" /> {t("adminHeroes.uploading")}
                    </>
                  ) : isSaved ? (
                    <>
                      <Check size={15} /> {t("adminHeroes.saved")}
                    </>
                  ) : (
                    <>
                      <Save size={15} /> {t("common.save")}
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}