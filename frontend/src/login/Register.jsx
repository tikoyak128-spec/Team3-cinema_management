import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, Phone, User } from "lucide-react";
import api from "../api/client";

export default function Register() {
  const navigate = useNavigate();
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
      setError("Please fill in all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
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
        setError(Array.isArray(first) ? first[0] : msg || "Registration failed.");
      } else {
        setError(msg || "Registration failed. Please try again.");
      }
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

        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.subtitle}>Join Khmer Cinema to book tickets and more</p>

        {error && <div style={styles.errorMsg}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}><User size={16} /></span>
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>
          </div>

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
              Use an email containing "admin" or "staff" to sign into their portal.
            </span>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Phone Number (optional)</label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}><Phone size={16} /></span>
              <input
                type="tel"
                name="phone"
                placeholder="+1 234 567 890"
                value={formData.phone}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
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

          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm Password</label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}><Lock size={16} /></span>
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>
          </div>

          <button type="submit" style={styles.submitBtn} disabled={submitting}>
            {submitting ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div style={styles.footerText}>
          Already have an account?{" "}
          <Link to="/login" style={styles.registerLink}>
            Sign In
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
