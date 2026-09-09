import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import api from "../api/client";

export default function ForgotPassword() {
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
      setError("Please enter your email address.");
      return;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await api.post("/forgot-password", { email });
      setSent(true);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to send reset link. Please try again.");
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

        <h2 style={styles.title}>{sent ? "Check Your Email" : "Forgot Password"}</h2>
        <p style={styles.subtitle}>
          {sent
            ? "We sent a password reset link to your email address."
            : "Enter your email and we'll send you a reset link."}
        </p>

        {sent ? (
          <div style={styles.successMsg}>
            A password reset link has been sent to{" "}
            <strong style={{ color: "#ffffff" }}>{email}</strong>. Please check your
            inbox and follow the instructions.
          </div>
        ) : (
          <>
            {error && <div style={styles.errorMsg}>{error}</div>}

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Email Address</label>
                <div style={styles.inputWrapper}>
                  <span style={styles.inputIcon}><Mail size={16} /></span>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={handleChange}
                    required
                    style={styles.input}
                  />
                </div>
              </div>

              <button type="submit" style={styles.submitBtn} disabled={submitting}>
                {submitting ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          </>
        )}

        <div style={styles.backRow}>
          <Link to="/login" style={styles.backLink}>
            <ArrowLeft size={14} /> Back to Sign In
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
  successMsg: {
    backgroundColor: "rgba(34, 197, 94, 0.12)",
    border: "1px solid rgba(34, 197, 94, 0.4)",
    color: "#86efac",
    fontSize: "13px",
    lineHeight: "1.5",
    textAlign: "center",
    padding: "14px",
    borderRadius: "8px",
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
  label: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#aaaaaa",
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
  backRow: {
    marginTop: "24px",
    textAlign: "center",
  },
  backLink: {
    color: "#777777",
    fontSize: "13px",
    fontWeight: "600",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
  },
};
