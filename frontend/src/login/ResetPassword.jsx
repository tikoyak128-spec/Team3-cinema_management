import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, KeyRound, Lock } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";
import LangSwitch from "../components/LangSwitch";
import api from "../api/client";
import { usePrefs } from "../context/PrefsContext";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { t } = usePrefs();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token || !email) {
      setError(t("auth.badLink"));
      return;
    }
    if (password.length < 8) {
      setError(t("auth.passTooShort"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("auth.passMismatch"));
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/reset-password", {
        token,
        email,
        password,
        password_confirmation: confirmPassword,
      });
      setSuccess(t("auth.resetSuccess"));
      setTimeout(() => navigate("/login", { replace: true }), 1800);
    } catch (err) {
      setError(err?.response?.data?.message || t("auth.failedReset"));
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
        <div className="text-center leading-none mb-5">
          <span className="block text-[24px] font-black tracking-[3px] text-[var(--app-ink)]">KHMER</span>
          <span className="text-[10px] tracking-[5px] text-[#e50914] font-bold">CINEMA</span>
        </div>

        <div className="flex justify-center mb-4">
          <KeyRound size={36} color="#e50914" />
        </div>

        <h2 className="text-[22px] font-extrabold text-center mb-1">{t("auth.resetPasswordTitle")}</h2>
        <p className="text-[13px] text-[var(--app-mute)] text-center mb-6 leading-[1.6]">
          {t("auth.enterNewPassword")}
          <br />
          <strong className="text-[var(--app-ink)]">{email || t("auth.yourAccount")}</strong>
        </p>

        {error && <div className="bg-[rgba(229,9,20,0.15)] border border-[rgba(229,9,20,0.4)] text-[#ff4d4d] text-[12px] font-semibold text-center p-[10px] rounded-[8px] mb-4">{error}</div>}
        {success && <div className="bg-[rgba(34,197,94,0.15)] border border-[rgba(34,197,94,0.4)] text-[#22c55e] text-[12px] font-semibold text-center p-[10px] rounded-[8px] mb-4">{success}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
          <div className="flex flex-col gap-[6px]">
            <label className="text-[12px] font-semibold text-[var(--app-mute)]">{t("auth.newPassword")}</label>
            <div className="relative flex items-center">
              <span className="absolute left-[14px] text-[14px] pointer-events-none"><Lock size={16} /></span>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[var(--app-panel2)] border border-[var(--app-edge2)] rounded-[10px] py-3 pl-[40px] pr-[14px] text-[var(--app-ink)] text-[13px] outline-none transition-[border-color] duration-200"
              />
            </div>
          </div>

          <div className="flex flex-col gap-[6px]">
            <label className="text-[12px] font-semibold text-[var(--app-mute)]">{t("auth.confirmNewPassword")}</label>
            <div className="relative flex items-center">
              <span className="absolute left-[14px] text-[14px] pointer-events-none"><Lock size={16} /></span>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full bg-[var(--app-panel2)] border border-[var(--app-edge2)] rounded-[10px] py-3 pl-[40px] pr-[14px] text-[var(--app-ink)] text-[13px] outline-none transition-[border-color] duration-200"
              />
            </div>
          </div>

          <button type="submit" className="bg-[#e50914] text-white border-none rounded-[10px] p-[14px] text-[14px] font-bold cursor-pointer mt-[10px] shadow-[0_4px_15px_rgba(229,9,20,0.4)] transition-[background] duration-200" disabled={submitting}>
            {submitting ? t("auth.resetting") : t("auth.resetPasswordTitle")}
          </button>
        </form>

        <div className="mt-6 text-center text-[13px] text-[var(--app-mute)]">
          <Link to="/login" className="text-[var(--app-mute)] no-underline inline-flex items-center gap-1">
            <ArrowLeft size={14} /> {t("auth.backToSignIn")}
          </Link>
        </div>
      </div>
    </div>
  );
}
