import { useState, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef([]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError("");

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = pasted.split("").concat(Array(6).fill("")).slice(0, 6);
    setOtp(newOtp);
    if (pasted.length > 0) {
      inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const { data } = await api.post("/verify-otp", { email, otp: code });
      login({ ...data.user, token: data.token });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Verification failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/resend-otp", { email });
      setSuccess("A new OTP code has been sent to your email.");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setResending(false);
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

        <div style={styles.iconWrap}>
          <ShieldCheck size={36} color="#e50914" />
        </div>

        <h2 style={styles.title}>Verify Your Email</h2>
        <p style={styles.subtitle}>
          We sent a 6-digit code to<br />
          <strong style={{ color: "#ffffff" }}>{email}</strong>
        </p>

        {error && <div style={styles.errorMsg}>{error}</div>}
        {success && <div style={styles.successMsg}>{success}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.otpRow} onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                style={{
                  ...styles.otpInput,
                  borderColor: digit ? "#e50914" : "#282828",
                }}
              />
            ))}
          </div>

          <button type="submit" style={styles.submitBtn} disabled={submitting}>
            {submitting ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        <div style={styles.resendRow}>
          <span style={styles.resendText}>Didn't receive the code?</span>
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            style={styles.resendBtn}
          >
            {resending ? "Sending..." : "Resend Code"}
          </button>
        </div>

        <div style={styles.footerText}>
          <Link to="/register" style={styles.backLink}>
            <ArrowLeft size={14} /> Back to Register
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
    marginBottom: "20px",
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
  iconWrap: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "16px",
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
    lineHeight: "1.6",
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
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    border: "1px solid rgba(34, 197, 94, 0.4)",
    color: "#22c55e",
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
  otpRow: {
    display: "flex",
    gap: "10px",
    justifyContent: "center",
  },
  otpInput: {
    width: "48px",
    height: "56px",
    textAlign: "center",
    fontSize: "22px",
    fontWeight: "700",
    backgroundColor: "#181818",
    border: "1px solid #282828",
    borderRadius: "10px",
    color: "#ffffff",
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
  resendRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    marginTop: "20px",
  },
  resendText: {
    fontSize: "13px",
    color: "#666666",
  },
  resendBtn: {
    background: "none",
    border: "none",
    color: "#e50914",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    padding: 0,
  },
  footerText: {
    marginTop: "24px",
    textAlign: "center",
    fontSize: "13px",
    color: "#666666",
  },
  backLink: {
    color: "#aaaaaa",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
  },
};
