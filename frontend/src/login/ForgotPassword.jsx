import { useState } from "react";
import { Link } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import LangSwitch from "../components/LangSwitch";
import { ArrowLeft, Mail } from "lucide-react";
import api from "../api/client";
import { usePrefs } from "../context/PrefsContext";

export default function ForgotPassword() {
  const { t } = usePrefs();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    setError("");
    setSent(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError(t("auth.enterEmailError"));
      return;
    }
    if (!email.includes("@")) {
      setError(t("auth.validEmailError"));
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await api.post("/forgot-password", { email });
      setSent(true);
    } catch (err) {
      setError(err?.response?.data?.message || t("auth.failedSend"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="[font-family:'Mulish','Kantumruy_Pro',-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif] bg-[var(--app-page)] text-[var(--app-ink)] h-screen w-full flex items-center justify-center relative overflow-hidden p-5">
      <div className="fixed top-5 right-5 z-[5] flex items-center gap-2"><LangSwitch size="sm" /><ThemeToggle /></div>
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[450px] h-[450px] bg-[radial-gradient(circle,rgba(229,9,20,0.35)_0%,rgba(5,5,5,0)_70%)] blur-[50px] z-[1]" />
      <div className="absolute bottom-0 left-0 right-0 h-[200px] bg-gradient-to-t from-[var(--app-deep)] to-transparent z-[1]" />

      <div className="relative z-[2] w-full max-w-[420px] bg-[var(--app-panel)] border border-[var(--app-edge2)] rounded-[20px] py-9 px-[30px] shadow-[0_20px_40px_rgba(0,0,0,0.8)]">
        <div className="text-center leading-none mb-6">
          <span className="block text-[24px] font-black tracking-[3px] text-[var(--app-ink)]">KHMER</span>
          <span className="text-[10px] tracking-[5px] text-[#e50914] font-bold">CINEMA</span>
        </div>

        <h2 className="text-[22px] font-extrabold text-center mb-1">{sent ? t("auth.checkEmailTitle") : t("auth.forgotPasswordTitle")}</h2>
        <p className="text-[13px] text-[var(--app-mute)] text-center mb-6">
          {sent ? t("auth.checkEmailSubtitle") : t("auth.forgotSubtitle")}
        </p>

        {sent ? (
          <div className="bg-[rgba(34,197,94,0.12)] border border-[rgba(34,197,94,0.4)] text-[#86efac] text-[13px] leading-[1.5] text-center p-[14px] rounded-[8px]">
            {t("auth.resetLinkSent")}{" "}
            <strong className="text-[var(--app-ink)]">{email}</strong>. {t("auth.pleaseCheckInbox")}
          </div>
        ) : (
          <>
            {error && <div className="bg-[rgba(229,9,20,0.15)] border border-[rgba(229,9,20,0.4)] text-[#ff4d4d] text-[12px] font-semibold text-center p-[10px] rounded-[8px] mb-4">{error}</div>}

            <form onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
              <div className="flex flex-col gap-[6px]">
                <label className="text-[12px] font-semibold text-[var(--app-mute)]">{t("auth.emailAddress")}</label>
                <div className="relative flex items-center">
                  <span className="absolute left-[14px] text-[14px] pointer-events-none"><Mail size={16} /></span>
                  <input
                    type="email"
                    placeholder={t("auth.emailPlaceholder")}
                    value={email}
                    onChange={handleChange}
                    required
                    className="w-full bg-[var(--app-panel2)] border border-[var(--app-edge2)] rounded-[10px] py-3 pl-[40px] pr-[14px] text-[var(--app-ink)] text-[13px] outline-none transition-[border-color] duration-200"
                  />
                </div>
              </div>

              <button type="submit" className="bg-[#e50914] text-white border-none rounded-[10px] p-[14px] text-[14px] font-bold cursor-pointer mt-[10px] shadow-[0_4px_15px_rgba(229,9,20,0.4)] transition-[background] duration-200" disabled={submitting}>
                {submitting ? t("auth.sending") : t("auth.sendResetLink")}
              </button>
            </form>
          </>
        )}

        <div className="mt-6 text-center">
          <Link to="/login" className="text-[var(--app-mute)] text-[13px] font-semibold no-underline inline-flex items-center gap-1">
            <ArrowLeft size={14} /> {t("auth.backToSignIn")}
          </Link>
        </div>
      </div>
    </div>
  );
}
