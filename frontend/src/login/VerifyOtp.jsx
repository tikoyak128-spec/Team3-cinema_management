import { useState, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";

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
    <div className="[font-family:'Mulish','Kantumruy_Pro',-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif] bg-[var(--app-page)] text-[var(--app-ink)] h-screen w-full flex items-center justify-center relative overflow-hidden p-5">
      <div className="fixed top-5 right-5 z-[5]"><ThemeToggle /></div>
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[450px] h-[450px] bg-[radial-gradient(circle,rgba(229,9,20,0.35)_0%,rgba(5,5,5,0)_70%)] blur-[50px] z-[1]" />
      <div className="absolute bottom-0 left-0 right-0 h-[200px] bg-gradient-to-t from-[var(--app-deep)] to-transparent z-[1]" />

      <div className="relative z-[2] w-full max-w-[420px] bg-[var(--app-panel)] border border-[var(--app-edge2)] rounded-[20px] py-9 px-[30px] shadow-[0_20px_40px_rgba(0,0,0,0.8)]">
        <div className="text-center leading-none mb-5">
          <span className="block text-[24px] font-black tracking-[3px] text-[var(--app-ink)]">KHMER</span>
          <span className="text-[10px] tracking-[5px] text-[#e50914] font-bold">CINEMA</span>
        </div>

        <div className="flex justify-center mb-4">
          <ShieldCheck size={36} color="#e50914" />
        </div>

        <h2 className="text-[22px] font-extrabold text-center mb-1">Verify Your Email</h2>
        <p className="text-[13px] text-[var(--app-mute)] text-center mb-6 leading-[1.6]">
          We sent a 6-digit code to<br />
          <strong className="text-[var(--app-ink)]">{email}</strong>
        </p>

        {error && <div className="bg-[rgba(229,9,20,0.15)] border border-[rgba(229,9,20,0.4)] text-[#ff4d4d] text-[12px] font-semibold text-center p-[10px] rounded-[8px] mb-4">{error}</div>}
        {success && <div className="bg-[rgba(34,197,94,0.15)] border border-[rgba(34,197,94,0.4)] text-[#22c55e] text-[12px] font-semibold text-center p-[10px] rounded-[8px] mb-4">{success}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
          <div className="flex gap-[10px] justify-center" onPaste={handlePaste}>
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
                className={`w-[48px] h-[56px] text-center text-[22px] font-bold bg-[var(--app-panel2)] rounded-[10px] text-[var(--app-ink)] outline-none transition-[border-color] duration-200 border ${digit ? "border-[#e50914]" : "border-[var(--app-edge2)]"}`}
              />
            ))}
          </div>

          <button type="submit" className="bg-[#e50914] text-white border-none rounded-[10px] p-[14px] text-[14px] font-bold cursor-pointer mt-[10px] shadow-[0_4px_15px_rgba(229,9,20,0.4)] transition-[background] duration-200" disabled={submitting}>
            {submitting ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        <div className="flex items-center justify-center gap-[6px] mt-5">
          <span className="text-[13px] text-[var(--app-mute)]">Didn't receive the code?</span>
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="bg-transparent border-none text-[#e50914] text-[13px] font-bold cursor-pointer p-0"
          >
            {resending ? "Sending..." : "Resend Code"}
          </button>
        </div>

        <div className="mt-6 text-center text-[13px] text-[var(--app-mute)]">
          <Link to="/register" className="text-[var(--app-mute)] no-underline inline-flex items-center gap-1">
            <ArrowLeft size={14} /> Back to Register
          </Link>
        </div>
      </div>
    </div>
  );
}
