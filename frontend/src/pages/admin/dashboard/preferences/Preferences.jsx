import { useRef, useState } from "react";
import {
  Bell,
  Check,
  Globe,
  KeyRound,
  Moon,
  Palette,
  RotateCcw,
  Save,
  Shield,
  Sun,
} from "lucide-react";
import { usePrefs } from "../../../../context/PrefsContext";

const NOTIF_DEFAULTS = {
  newBooking: true,
  checkIn: true,
  lowSeats: false,
  dailyReport: true,
};

function Switch({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative h-[26px] w-[46px] shrink-0 cursor-pointer rounded-full border transition-all duration-300 ${
        checked
          ? "bg-[#e50914] border-[#e50914] shadow-[0_2px_10px_rgba(229,9,20,0.4)]"
          : "bg-[var(--app-fill)] border-[var(--app-edge2)]"
      }`}
    >
      <span
        className={`absolute top-[2px] left-[3px] h-[20px] w-[20px] rounded-full bg-white shadow-md transition-transform duration-300 ${
          checked ? "translate-x-[19px]" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function ThemeCard({ active, name, hint, icon, preview, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex flex-col gap-3 rounded-2xl border p-4 text-left transition-all duration-200 cursor-pointer ${
        active
          ? "border-[#e50914] bg-[rgba(229,9,20,0.05)] shadow-[0_0_0_1px_rgba(229,9,20,0.6)]"
          : "border-[var(--app-edge2)] bg-[var(--app-panel2)] hover:border-[rgba(229,9,20,0.35)]"
      }`}
    >
      {active && (
        <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-[#e50914] text-white shadow-[0_2px_8px_rgba(229,9,20,0.5)]">
          <Check size={14} strokeWidth={3} />
        </span>
      )}
      <div className="overflow-hidden rounded-xl border border-[var(--app-edge2)]">{preview}</div>
      <div className="flex items-center gap-2.5">
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${active ? "bg-[rgba(229,9,20,0.14)] text-[#e50914]" : "bg-[var(--app-fill)] text-[var(--app-ink2)]"}`}>
          {icon}
        </span>
        <div className="min-w-0">
          <div className="text-[14px] font-bold text-[var(--app-ink)]">{name}</div>
          <div className="truncate text-[12px] text-[var(--app-mute)]">{hint}</div>
        </div>
      </div>
    </button>
  );
}

export default function Preferences() {
  const { prefs, setTheme, setLanguage, updatePrefs, resetPrefs, t } = usePrefs();
  const [saved, setSaved] = useState(false);
  const toastTimer = useRef(null);

  const notifications = { ...NOTIF_DEFAULTS, ...(prefs.notifications || {}) };

  const toggleNotification = (key) => {
    const next = { ...NOTIF_DEFAULTS, ...notifications, [key]: !notifications[key] };
    updatePrefs({ notifications: next });
  };

  const showSaved = () => {
    setSaved(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setSaved(false), 2200);
  };

  const handleSave = () => showSaved();

  const handleReset = () => {
    resetPrefs();
    updatePrefs({ notifications: { ...NOTIF_DEFAULTS } });
    showSaved();
  };

  const notifRows = [
    ["newBooking", t("prefs.newBooking"), t("prefs.newBookingDesc")],
    ["checkIn", t("prefs.checkIn"), t("prefs.checkInDesc")],
    ["lowSeats", t("prefs.lowSeats"), t("prefs.lowSeatsDesc")],
    ["dailyReport", t("prefs.dailyReport"), t("prefs.dailyReportDesc")],
  ];

  const sectionTitle = (icon, text) => (
    <div className="mb-5 flex items-center gap-2.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[rgba(229,9,20,0.12)] text-[#e50914]">
        {icon}
      </span>
      <h2 className="text-[15px] font-bold tracking-wide text-[var(--app-ink)]">{text}</h2>
    </div>
  );

  const darkPreview = (
    <div className="flex h-20 flex-col gap-1.5 bg-[#0d0d0f] p-3">
      <div className="flex items-center justify-between">
        <span className="h-2 w-2 rounded-full bg-[#e50914]" />
        <span className="h-1.5 w-10 rounded-full bg-[#2b2b30]" />
      </div>
      <div className="mt-1 h-1.5 w-full rounded-full bg-[#1c1c21]" />
      <div className="h-1.5 w-4/5 rounded-full bg-[#1c1c21]" />
      <div className="mt-auto h-4 rounded-md bg-[rgba(229,9,20,0.85)]" />
    </div>
  );

  const lightPreview = (
    <div className="flex h-20 flex-col gap-1.5 bg-[#f7f7f9] p-3">
      <div className="flex items-center justify-between">
        <span className="h-2 w-2 rounded-full bg-[#e50914]" />
        <span className="h-1.5 w-10 rounded-full bg-[#e3e3e8]" />
      </div>
      <div className="mt-1 h-1.5 w-full rounded-full bg-[#e3e3e8]" />
      <div className="h-1.5 w-4/5 rounded-full bg-[#e3e3e8]" />
      <div className="mt-auto h-4 rounded-md bg-[rgba(229,9,20,0.85)]" />
    </div>
  );

  return (
    <div className="flex flex-col gap-6 text-[var(--app-ink)] [&_*]:box-border">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[rgba(229,9,20,0.12)] text-[#e50914]">
            <Palette size={24} />
          </span>
          <div>
            <h1 className="text-[22px] sm:text-[26px] font-extrabold tracking-wide">{t("prefs.title")}</h1>
            <p className="text-[14px] text-[var(--app-mute)] mt-1">{t("prefs.subtitle")}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        {/* Appearance */}
        <section className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-3xl p-5 sm:p-7">
          {sectionTitle(<Palette size={18} />, t("prefs.appearance"))}

          <div className="flex flex-col gap-6">
            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-[13px] font-bold text-[var(--app-ink2)]">{t("prefs.theme")}</span>
                <span className="text-[12px] text-[var(--app-mute)]">{t("prefs.themeHint")}</span>
              </div>
              <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3.5">
                <ThemeCard
                  active={prefs.theme === "dark"}
                  name={t("prefs.dark")}
                  hint="Midnight slate"
                  icon={<Moon size={18} />}
                  preview={darkPreview}
                  onClick={() => setTheme("dark")}
                />
                <ThemeCard
                  active={prefs.theme === "light"}
                  name={t("prefs.light")}
                  hint="Bright & clean"
                  icon={<Sun size={18} />}
                  preview={lightPreview}
                  onClick={() => setTheme("light")}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-[var(--app-edge)] pt-5">
              <div className="flex items-center gap-2">
                <Globe size={15} className="text-[var(--app-mute)]" />
                <span className="text-[13px] font-bold text-[var(--app-ink2)]">{t("prefs.language")}</span>
              </div>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <span className="text-[12px] text-[var(--app-mute)]">{t("prefs.languageHint")}</span>
                <div className="flex rounded-xl border border-[var(--app-edge)] bg-[var(--app-fill)] p-1">
                  {[
                    ["en", t("prefs.english")],
                    ["km", t("prefs.khmer")]
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setLanguage(value)}
                      className={`rounded-lg px-4 py-2 text-[13px] font-bold transition-all duration-200 cursor-pointer ${
                        prefs.language === value
                          ? "bg-[#e50914] text-white shadow-[0_2px_10px_rgba(229,9,20,0.4)]"
                          : "text-[var(--app-mute)] hover:text-[var(--app-ink)]"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Notifications + Security */}
        <div className="flex flex-col gap-5">
          <section className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-3xl p-5 sm:p-7">
            {sectionTitle(<Bell size={18} />, t("prefs.notifications"))}
            <div className="flex flex-col gap-1">
              {notifRows.map(([key, title, desc]) => (
                <div
                  key={key}
                  className="flex items-center justify-between gap-4 rounded-2xl px-3 py-3 transition-colors duration-150 hover:bg-[var(--app-fill)]"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-bold text-[var(--app-ink)]">{title}</div>
                    <div className="text-[12px] text-[var(--app-mute)] mt-0.5">{desc}</div>
                  </div>
                  <Switch checked={notifications[key]} onChange={() => toggleNotification(key)} />
                </div>
              ))}
            </div>
          </section>

          <section className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-3xl p-5 sm:p-7">
            {sectionTitle(<Shield size={18} />, t("prefs.security"))}
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 rounded-2xl border border-[var(--app-edge2)] bg-[var(--app-panel2)] px-4 py-3.5 text-left transition-all duration-200 cursor-pointer hover:border-[rgba(229,9,20,0.35)] hover:bg-[rgba(229,9,20,0.04)]"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[14px] font-bold text-[var(--app-ink)]">
                  <KeyRound size={16} className="text-[var(--app-mute)]" />
                  {t("prefs.changePassword")}
                </div>
                <div className="text-[12px] text-[var(--app-mute)] mt-0.5">{t("prefs.changePasswordDesc")}</div>
              </div>
              <span className="shrink-0 rounded-lg px-3 py-1.5 text-[12px] font-bold text-[#e50914] bg-[rgba(229,9,20,0.1)]">
                {t("prefs.password")}
              </span>
            </button>
          </section>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center justify-center gap-2 border-none cursor-pointer font-inherit py-[11px] px-5 text-[14px] font-bold rounded-xl transition-all duration-200 bg-[#e50914] text-white shadow-[0_4px_14px_rgba(229,9,20,0.35)] hover:bg-[#f40612] hover:-translate-y-px"
        >
          <Save size={16} /> {t("common.save")}
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center justify-center gap-2 border-none cursor-pointer font-inherit py-[11px] px-5 text-[14px] font-bold rounded-xl transition-all duration-200 bg-transparent text-[var(--app-ink2)] border border-[var(--app-edge2)] hover:bg-[var(--app-fill)] hover:border-[var(--app-edge2)]"
        >
          <RotateCcw size={16} /> {t("prefs.resetToDefaults")}
        </button>
      </div>

      {/* Toast */}
      <div
        className={`fixed bottom-6 right-6 z-[150] flex items-center gap-2.5 rounded-2xl border border-[#22c55e]/40 bg-[rgba(22,37,30,0.96)] px-5 py-3 shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur transition-all duration-300 ${
          saved ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#22c55e] text-white">
          <Check size={15} strokeWidth={3} />
        </span>
        <span className="text-[14px] font-bold text-[#e8f5ec]">{t("prefs.savedToast")}</span>
      </div>
    </div>
  );
}