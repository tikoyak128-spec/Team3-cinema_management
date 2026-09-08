import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";

function getRoleFromEmail(email = "") {
  const e = email.trim().toLowerCase();
  if (e.includes("admin")) return "admin";
  if (e.includes("staff")) return "staff";
  return "customer";
}

export default function CinemaLogin() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { login, loginWithToken } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const goAfterLogin = (role) => {
    const redirect = searchParams.get("redirect");
    if (redirect) {
      navigate(redirect, { replace: true });
      return;
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
      errorMessage = "Something went wrong during Google sign in.";
    } catch {
      errorMessage = "Something went wrong during Google sign in.";
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
    const base = "/api/auth/google";
    window.location.href = redirect
      ? `${base}?redirect=${encodeURIComponent(redirect)}`
      : base;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = formData.email.trim();
    if (!email || !formData.password) {
      setError("Please enter your email and password.");
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
      setError("Invalid credentials. Please check your email and password.");
    } catch (err) {
      const resp = err?.response?.data;
      if (resp?.requires_verification) {
        navigate(`/verify-otp?email=${encodeURIComponent(resp.email || email)}`);
        return;
      }
      setError(
        err?.response?.data?.message ||
          "Invalid credentials. Please check your email and password."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.loginContainer}>
      <div style={styles.glowRed} />
      <div style={styles.glowDark} />

      <div style={styles.card}>
        <div style={styles.brandLogo}>
          <span style={styles.logoPrimary}>KHMER</span>
          <span style={styles.logoSub}>CINEMA</span>
        </div>

        <h2 style={styles.title}>Welcome Back</h2>
        <p style={styles.subtitle}>Sign in to your account to continue</p>

        {error && <div style={styles.errorMsg}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}><Mail size={16} /></span>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>
            <span style={styles.hint}>
              Use an email containing "admin" or "staff" to access their portal.
            </span>
          </div>

          <div style={styles.inputGroup}>
            <div style={styles.labelRow}>
              <label style={styles.label}>Password</label>
              <Link to="/forgot-password" style={styles.forgotLink}>
                Forgot?
              </Link>
            </div>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}><Lock size={16} /></span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                style={styles.input}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" style={styles.submitBtn} disabled={submitting}>
            {submitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div style={styles.dividerRow}>
          <span style={styles.dividerLine} />
          <span style={styles.dividerText}>or</span>
          <span style={styles.dividerLine} />
        </div>

        <button type="button" onClick={handleGoogle} style={styles.googleBtn}>
          <svg width="18" height="18" viewBox="0 0 48 48" style={styles.googleIcon}>
            <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.2 29.4 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.2 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.3 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4 5.5l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"/>
          </svg>
          Sign in with Google
        </button>

        <div style={styles.footerText}>
          Don't have an account?{" "}
          <Link to="/register" style={styles.registerLink}>
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  loginContainer: {
    backgroundColor: "#050505",
    color: "#ffffff",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    height: "100vh",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    padding: "20px",
  },
  glowRed: {
    position: "absolute",
    top: "20%",
    left: "50%",
    transform: "translateX(-50%)",
    width: "450px",
    height: "450px",
    background: "radial-gradient(circle, rgba(229, 9, 20, 0.35) 0%, rgba(5,5,5,0) 70%)",
    filter: "blur(50px)",
    zIndex: 1,
  },
  glowDark: {
    position: "absolute",
    bottom: "0",
    left: "0",
    right: "0",
    height: "200px",
    background: "linear-gradient(to top, #000000, transparent)",
    zIndex: 1,
  },
  card: {
    position: "relative",
    zIndex: 2,
    width: "100%",
    maxWidth: "420px",
    backgroundColor: "#111111",
    border: "1px solid #222222",
    borderRadius: "20px",
    padding: "36px 30px",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.8)",
  },
  brandLogo: {
    textAlign: "center",
    lineHeight: "1",
    marginBottom: "24px",
  },
  logoPrimary: {
    display: "block",
    fontSize: "24px",
    fontWeight: "900",
    letterSpacing: "3px",
    color: "#ffffff",
  },
  logoSub: {
    fontSize: "10px",
    letterSpacing: "5px",
    color: "#e50914",
    fontWeight: "700",
  },
  title: {
    fontSize: "22px",
    fontWeight: "800",
    textAlign: "center",
    marginBottom: "4px",
  },
  subtitle: {
    fontSize: "13px",
    color: "#777777",
    textAlign: "center",
    marginBottom: "24px",
  },
  errorMsg: {
    backgroundColor: "rgba(229, 9, 20, 0.15)",
    border: "1px solid rgba(229, 9, 20, 0.4)",
    color: "#ff4d4d",
    fontSize: "12px",
    fontWeight: "600",
    textAlign: "center",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "16px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  labelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#aaaaaa",
  },
  hint: {
    fontSize: "11px",
    color: "#666666",
    lineHeight: "1.4",
  },
  forgotLink: {
    fontSize: "12px",
    color: "#e50914",
    textDecoration: "none",
  },
  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: "14px",
    fontSize: "14px",
    pointerEvents: "none",
  },
  input: {
    width: "100%",
    backgroundColor: "#181818",
    border: "1px solid #282828",
    borderRadius: "10px",
    padding: "12px 14px 12px 40px",
    color: "#ffffff",
    fontSize: "13px",
    outline: "none",
    transition: "border-color 0.2s",
  },
  eyeBtn: {
    position: "absolute",
    right: "12px",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
  },
  submitBtn: {
    backgroundColor: "#e50914",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    padding: "14px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    marginTop: "10px",
    boxShadow: "0 4px 15px rgba(229, 9, 20, 0.4)",
    transition: "background 0.2s",
  },
  dividerRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    margin: "20px 0 4px",
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    backgroundColor: "#2a2a2a",
  },
  dividerText: {
    fontSize: "12px",
    color: "#777777",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  googleBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    width: "100%",
    backgroundColor: "#ffffff",
    color: "#1a1a1a",
    border: "1px solid #2a2a2a",
    borderRadius: "10px",
    padding: "12px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "12px",
    transition: "background 0.2s, border-color 0.2s",
  },
  googleIcon: {
    flexShrink: 0,
  },
  footerText: {
    marginTop: "24px",
    textAlign: "center",
    fontSize: "13px",
    color: "#666666",
  },
  registerLink: {
    color: "#ffffff",
    fontWeight: "700",
    textDecoration: "none",
    marginLeft: "4px",
  },
};
