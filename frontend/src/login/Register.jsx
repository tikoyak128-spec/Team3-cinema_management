import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, Phone, User } from "lucide-react";
import AuthShell from "./AuthShell";
import api from "../api/client";
import { usePrefs } from "../context/PrefsContext";

const inputClass =
  "w-full bg-[var(--app-panel2)] border border-[var(--app-edge2)] rounded-[12px] py-3 pl-[42px] pr-[42px] text-[var(--app-ink)] text-[13px] placeholder:text-[var(--app-mute)] outline-none transition-all duration-200 hover:border-[var(--app-edge2)] focus:border-brand focus:ring-[3px] focus:ring-brand/15 focus:bg-[var(--app-panel)]";

const passwordStrength = (pw) => {
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score += 1;
  if (/\d/.test(pw)) score += 1;
  return score;
};

const strengthColors = ["bg-[#f87171]", "bg-[#fbbf24]", "bg-[#4ade80]", "bg-[#22c55e]"];

export default function Register() {
  const navigate = useNavigate();
  const { t } = usePrefs();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, phone, password, confirmPassword } = formData;

    if (!name || !email || !password || !confirmPassword) {
      setError(t("auth.fillRequired"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("auth.passMismatch"));
      return;
    }

    if (password.length < 8) {
      setError(t("auth.passTooShort"));
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await api.post("/register", { name, email, phone: phone || undefined, password, password_confirmation: confirmPassword });
      navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (err) {
      const msg = err?.response?.data?.message;
      const errors = err?.response?.data?.errors;
      if (errors) {
        const first = Object.values(errors)[0];
        setError(Array.isArray(first) ? first[0] : msg || t("auth.registrationFailed"));
      } else {
        setError(msg || t("auth.registrationFailed"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const score = passwordStrength(formData.password);

  return (
    <AuthShell title={t("auth.createAccount")} subtitle={t("auth.joinSubtitle")}>
      {error && (
        <div className="flex items-start gap-2 bg-[rgba(229,9,20,0.12)] border border-[rgba(229,9,20,0.35)] text-[#f87171] text-[12px] font-semibold p-[11px] px-3.5 rounded-[10px] mb-5 animate-[scaleIn_0.25s_ease_both]">
          <span className="mt-[1px] shrink-0">⚠</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-[16px]">
        <div className="flex flex-col gap-[7px]">
          <label className="text-[12px] font-bold text-[var(--app-ink2)]">{t("auth.fullName")}</label>
          <div className="relative flex items-center">
            <span className="absolute left-[14px] text-[var(--app-mute)] pointer-events-none">
              <User size={16} />
            </span>
            <input
              type="text"
              name="name"
              placeholder={t("auth.namePlaceholder")}
              value={formData.name}
              onChange={handleChange}
              required
              autoComplete="name"
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex flex-col gap-[7px]">
          <label className="text-[12px] font-bold text-[var(--app-ink2)]">{t("auth.emailAddress")}</label>
          <div className="relative flex items-center">
            <span className="absolute left-[14px] text-[var(--app-mute)] pointer-events-none">
              <Mail size={16} />
            </span>
            <input
              type="email"
              name="email"
              placeholder={t("auth.emailPlaceholder")}
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex flex-col gap-[7px]">
          <label className="text-[12px] font-bold text-[var(--app-ink2)]">{t("auth.phoneNumber")}</label>
          <div className="relative flex items-center">
            <span className="absolute left-[14px] text-[var(--app-mute)] pointer-events-none">
              <Phone size={16} />
            </span>
            <input
              type="tel"
              name="phone"
              placeholder={t("auth.phonePlaceholder")}
              value={formData.phone}
              onChange={handleChange}
              autoComplete="tel"
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex flex-col gap-[7px]">
          <label className="text-[12px] font-bold text-[var(--app-ink2)]">{t("auth.password")}</label>
          <div className="relative flex items-center">
            <span className="absolute left-[14px] text-[var(--app-mute)] pointer-events-none">
              <Lock size={16} />
            </span>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder={t("auth.passwordPlaceholder")}
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-[var(--app-mute)] hover:text-[var(--app-ink)] transition-colors cursor-pointer"
              aria-label={showPassword ? t("auth.hidePasswordBtn") : t("auth.showPasswordBtn")}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {formData.password && (
            <div className="flex items-center gap-2.5 mt-1">
              <span className="flex gap-1.5 flex-1 max-w-[160px]">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${i < score ? strengthColors[score - 1] : "bg-[var(--app-edge2)]"}`}
                  />
                ))}
              </span>
              <span className="text-[10px] font-semibold text-[var(--app-mute)]">
                {t(`auth.strength${score}`)}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-[7px]">
          <label className="text-[12px] font-bold text-[var(--app-ink2)]">{t("auth.confirmPassword")}</label>
          <div className="relative flex items-center">
            <span className="absolute left-[14px] text-[var(--app-mute)] pointer-events-none">
              <Lock size={16} />
            </span>
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder={t("auth.confirmPlaceholder")}
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              autoComplete="new-password"
              className={`${inputClass} ${formData.confirmPassword && formData.password !== formData.confirmPassword ? "!border-[#f87171] !ring-[3px] !ring-[rgba(248,113,113,0.15)]" : ""}`}
            />
          </div>
          {formData.confirmPassword && (
            <span
              className={`text-[11px] font-semibold ${formData.password === formData.confirmPassword ? "text-[#22c55e]" : "text-[#f87171]"}`}
            >
              {formData.password === formData.confirmPassword
                ? t("auth.passMatch")
                : t("auth.passNoMatch")}
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="group relative mt-1 w-full bg-brand text-white border-none rounded-[12px] p-[14px] text-[14px] font-bold cursor-pointer flex items-center justify-center gap-2 shadow-[0_10px_26px_-8px_rgba(229,9,20,0.6)] transition-all duration-200 hover:bg-brand-hover hover:-translate-y-px active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {submitting ? (
            <>
              <Loader2 size={17} className="animate-spin" /> {t("auth.creatingAccount")}
            </>
          ) : (
            <>
              {t("auth.createAccount")}
              <ArrowRight size={17} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-[12px] text-[var(--app-mute)]">
        {t("auth.alreadyAccount")}{" "}
        <Link to="/login" className="text-brand font-bold no-underline hover:underline">
          {t("auth.signIn")}
        </Link>
      </p>
    </AuthShell>
  );
}