import { Clapperboard, QrCode, Sparkles } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";
import LangSwitch from "../components/LangSwitch";
import { usePrefs } from "../context/PrefsContext";

export default function AuthShell({ title, subtitle, children }) {
  const { t } = usePrefs();
  return (
    <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-[var(--app-page)] [font-family:'Mulish','Kantumruy_Pro',-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif] p-0 sm:p-6">
      {/* ambient glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-24 w-[420px] h-[420px] bg-brand/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-32 -right-24 w-[420px] h-[420px] bg-brand/10 rounded-full blur-[100px]" />
      </div>

      <div className="fixed top-5 right-5 z-50 flex items-center gap-2">
        <LangSwitch size="sm" />
        <ThemeToggle />
      </div>

      <div className="relative z-10 w-full max-w-[1000px] grid lg:grid-cols-[1fr_1fr] overflow-hidden rounded-[24px] border border-[var(--app-edge2)] bg-[var(--app-panel)] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.65)]">
        {/* ===== Showcase panel (desktop) ===== */}
        <aside className="hidden lg:flex flex-col relative overflow-hidden p-11 text-white bg-[#0c0c0e]">
          <div className="absolute inset-0 bg-[radial-gradient(100%_100%_at_0%_0%,rgba(229,9,20,0.22)_0%,rgba(12,12,14,0)_45%),radial-gradient(100%_100%_at_100%_100%,rgba(229,9,20,0.10)_0%,rgba(12,12,14,0)_50%)]" />

          <div className="relative z-10 flex flex-col min-h-[620px]">
            {/* brand */}
            <div className="flex items-center gap-2.5 animate-[fadeIn_0.5s_ease_both]">
              <span className="text-lg font-black tracking-[2px] text-white">
                KHMER <span className="text-brand">CINEMA</span>
              </span>
            </div>

            {/* image */}
            <div className="relative flex-1 min-h-0 my-8 overflow-hidden rounded-2xl ring-1 ring-white/10 animate-[fadeIn_0.8s_ease_0.1s_both]">
              <img
                src="https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=900&q=80&fit=crop&auto=format"
                alt="Cinema experience"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0e] via-transparent to-transparent" />
            </div>

            {/* headline */}
            <div className="pb-6">
             

              <h2 className="mt-4 text-[36px] leading-[1.12] font-black tracking-tight animate-[fadeIn_0.6s_ease_0.15s_both]">
                {t("auth.showHeadlineA")}
                <br />
                {t("auth.showHeadlineB")}
              </h2>
              <p className="mt-4 text-[14px] leading-relaxed text-white/60 max-w-[360px] animate-[fadeIn_0.6s_ease_0.2s_both]">
                {t("auth.showDesc")}
              </p>

              <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-6 text-[12px] text-white/70 animate-[fadeIn_0.6s_ease_0.3s_both]">
                <span className="flex items-center gap-1.5">
                  <QrCode size={14} className="text-brand" /> {t("auth.showQr")}
                </span>
                <span className="flex items-center gap-1.5">
                  <Sparkles size={14} className="text-brand" /> {t("auth.showBakong")}
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* ===== Form panel ===== */}
        <div className="relative flex flex-col justify-center bg-[var(--app-panel)] px-7 py-9 sm:px-12 sm:py-12">
          {/* mobile brand */}
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-7">
            <span className="w-9 h-9 rounded-xl bg-brand grid place-items-center shadow-[0_10px_26px_rgba(229,9,20,0.45)]">
              <Clapperboard size={16} className="text-white" />
            </span>
            <span className="text-[20px] font-black tracking-[2px] text-[var(--app-ink)]">
              KHMER <span className="text-brand">CINEMA</span>
            </span>
          </div>

          <h2 className="text-[26px] font-extrabold tracking-tight text-[var(--app-ink)] animate-[scaleIn_0.4s_ease_both]">
            {title}
          </h2>
          <p className="text-[13px] text-[var(--app-mute)] mt-1.5 mb-7 animate-[fadeIn_0.5s_ease_0.1s_both]">
            {subtitle}
          </p>

          {children}
        </div>
      </div>
    </div>
  );
}