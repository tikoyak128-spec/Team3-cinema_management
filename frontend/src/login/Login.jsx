import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api, { API_BASE } from "../api/client";
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import AuthShell from "./AuthShell";
import { usePrefs } from "../context/PrefsContext";

function getRoleFromEmail(email = "") {
  const e = email.trim().toLowerCase();
  if (e.includes("admin")) return "admin";
  if (e.includes("staff")) return "staff";
  return "customer";
}

const inputClass =
  "w-full bg-[var(--app-panel2)] border border-[var(--app-edge2)] rounded-[12px] py-3 pl-[42px] pr-[42px] text-[var(--app-ink)] text-[13px] placeholder:text-[var(--app-mute)] outline-none transition-all duration-200 hover:border-[var(--app-edge2)] focus:border-brand focus:ring-[3px] focus:ring-brand/15 focus:bg-[var(--app-panel)]";

export default function CinemaLogin() {
  const navigate = useNavigate();
  const { t } = usePrefs();
  const [searchParams, setSearchParams] = useSearchParams();
  const { login, loginWithToken } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const goAfterLogin = (role) => {
    const redirect = searchParams.get("redirect");
    if (redirect) {
      const isOwnArea =
        (role === "admin" && redirect.startsWith("/admin")) ||
        (role === "staff" && redirect.startsWith("/staff")) ||
        (role === "customer" && !redirect.startsWith("/admin") && !redirect.startsWith("/staff"));
      if (isOwnArea) {
        navigate(redirect, { replace: true });
        return;
      }
    }
    if (role === "admin") navigate("/admin/dashboard", { replace: true });
    else if (role === "staff") navigate("/staff/dashboard", { replace: true });
    else navigate("/", { replace: true });
  };

  // Handle Google OAuth callback payload: /login?google=<urlencoded {token,user}>
  useEffect(() => {
    const googlePayload = searchParams.get("google");
    if (!googlePayload) return;

    let errorMessage = "";
    try {
      const data = JSON.parse(decodeURIComponent(googlePayload));
      if (data && data.token && data.user) {
        loginWithToken(data);
        goAfterLogin(data.user.role);
        return;
      }
      errorMessage = t("auth.googleError");
    } catch {
      errorMessage = t("auth.googleError");
    }

    if (errorMessage) {
      setSearchParams({}, { replace: true });
      queueMicrotask(() => setError(errorMessage));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleGoogle = (e) => {
    e.preventDefault();
    const redirect = searchParams.get("redirect");
    const base = `${API_BASE}/auth/google`;
    window.location.href = redirect
      ? `${base}?redirect=${encodeURIComponent(redirect)}`
      : base;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = formData.email.trim();
    if (!email || !formData.password) {
      setError(t("auth.fillCredentials"));
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const { data } = await api.post("/login", {
        email,
        password: formData.password,
      });

      if (data && data.token && data.user) {
        login({ ...data.user, token: data.token });
        goAfterLogin(data.user.role || getRoleFromEmail(email));
        return;
      }
      setError(t("auth.invalidCredentials"));
    } catch (err) {
      const resp = err?.response?.data;
      if (resp?.requires_verification) {
        navigate(`/verify-otp?email=${encodeURIComponent(resp.email || email)}`);
        return;
      }
      setError(
        err?.response?.data?.message ||
          t("auth.invalidCredentials")
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell title={t("auth.welcomeBack")} subtitle={t("auth.signInSubtitle")}>
      {error && (
        <div className="flex items-start gap-2 bg-[rgba(229,9,20,0.12)] border border-[rgba(229,9,20,0.35)] text-[#f87171] text-[12px] font-semibold p-[11px] px-3.5 rounded-[10px] mb-5 animate-[scaleIn_0.25s_ease_both]">
          <span className="mt-[1px] shrink-0">⚠</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
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
          <div className="flex justify-between items-center">
            <label className="text-[12px] font-bold text-[var(--app-ink2)]">{t("auth.password")}</label>
            <Link
              to="/forgot-password"
              className="text-[12px] font-bold text-brand no-underline hover:underline"
            >
              {t("auth.forgotPassword")}
            </Link>
          </div>
          <div className="relative flex items-center">
            <span className="absolute left-[14px] text-[var(--app-mute)] pointer-events-none">
              <Lock size={16} />
            </span>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
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
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="group relative mt-1 w-full bg-brand text-white border-none rounded-[12px] p-[14px] text-[14px] font-bold cursor-pointer flex items-center justify-center gap-2 shadow-[0_10px_26px_-8px_rgba(229,9,20,0.6)] transition-all duration-200 hover:bg-brand-hover hover:-translate-y-px active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {submitting ? (
            <>
              <Loader2 size={17} className="animate-spin" /> {t("auth.signingIn")}
            </>
          ) : (
            <>
              {t("auth.signIn")}
              <ArrowRight size={17} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>

      <div className="flex items-center gap-4 my-6">
        <span className="flex-1 h-px bg-[var(--app-edge2)]" />
        <span className="text-[11px] text-[var(--app-mute)] uppercase tracking-[1.5px] font-bold">{t("auth.orContinueWith")}</span>
        <span className="flex-1 h-px bg-[var(--app-edge2)]" />
      </div>

      <button
        type="button"
        onClick={handleGoogle}
        className="flex items-center justify-center gap-[10px] w-full bg-[var(--app-panel2)] text-[var(--app-ink)] border border-[var(--app-edge2)] rounded-[12px] p-[13px] text-[14px] font-semibold cursor-pointer transition-all duration-200 hover:border-brand/50 hover:bg-[var(--app-fill)]"
      >
        <svg width="18" height="18" viewBox="0 0 48 48" className="shrink-0">
          <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.2 29.4 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.2 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"/>
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.3 44 24 44z"/>
          <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4 5.5l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"/>
        </svg>
        {t("auth.signInWithGoogle")}
      </button>

      <p className="mt-6 text-center text-[12px] text-[var(--app-mute)]">
        {t("auth.noAccount")}{" "}
        <Link to="/register" className="text-brand font-bold no-underline hover:underline">
          {t("auth.createAccount")}
        </Link>
      </p>
    </AuthShell>
  );
}