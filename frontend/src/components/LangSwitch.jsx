import { Languages } from "lucide-react";
import { usePrefs } from "../context/PrefsContext";

export default function LangSwitch({ size = "md" }) {
  const { language, setLanguage } = usePrefs();

  const button = (value, label) => {
    const active = language === value;
    return (
      <button
        type="button"
        onClick={() => setLanguage(value)}
        aria-pressed={active}
        className={`rounded-lg text-[11px] font-bold leading-none transition-all duration-200 cursor-pointer select-none ${
          size === "sm" ? "px-2 py-1.5" : "px-3 py-2"
        } ${
          active
            ? "bg-brand text-white shadow-[0_2px_10px_rgba(229,9,20,0.4)]"
            : "text-[var(--app-mute)] hover:text-[var(--app-ink)] hover:bg-[var(--app-fill)]"
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="flex shrink-0 items-center gap-1 rounded-[10px] border border-[var(--app-edge)] bg-[var(--app-panel2)]/60 p-1" role="group" aria-label="Language">
      <Languages size={14} className="ml-1.5 text-[var(--app-mute)]" />
      {button("en", "EN")}
      {button("km", "ខ្មែរ")}
    </div>
  );
}