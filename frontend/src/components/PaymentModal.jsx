import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Check,
  CheckCircle2,
  Loader2,
  RefreshCw,
  ScanLine,
  ShieldCheck,
  TriangleAlert,
  X,
} from "lucide-react";

const currencySymbol = (currency) => (currency === "KHR" ? "៛" : "$");

function formatAmount(amount, currency) {
  const value = Number(amount || 0).toFixed(2);
  return `${currencySymbol(currency)}${value}`;
}

function useCountdown(expiresAt, active) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [active]);

  if (!expiresAt) return 0;
  return Math.max(
    Math.floor((new Date(expiresAt).getTime() - now) / 1000),
    0
  );
}

function formatCountdown(total) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function PaymentModal({
  open,
  payment,
  status = "pending",
  error = "",
  onCheck,
  onClose,
  onConfirm,
  confirmLabel = "I have paid — Confirm",
  checking = false,
  confirming = false,
  onRefresh,
  refreshing = false,
  bookingCode,
}) {
  const remaining = useCountdown(payment?.expires_at, open && status === "pending");

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || !payment) return null;

  const isExpired = remaining <= 0;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[420px] bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-[26px] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.55)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Accent top bar */}
        <div className="h-[6px] bg-gradient-to-r from-[#e50914] via-[#ff5a5f] to-[#e50914]" />

        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center bg-[var(--app-fill)] border border-[var(--app-edge2)] text-[var(--app-mute)] cursor-pointer transition-all duration-200 hover:text-white hover:bg-brand hover:border-brand"
        >
          <X size={17} />
        </button>

        <div className="px-6 pt-6 pb-7 flex flex-col items-center">
          <div className="flex items-center gap-2 text-[13px] font-[800] tracking-wide text-[var(--app-ink)]">
            <ScanLine size={17} className="text-brand" />
            Scan to Pay
          </div>
          <p className="text-[12px] text-[var(--app-mute)] font-[600] mt-1 text-center">
            Open your Bakong app and scan the QR below
          </p>

          {/* QR panel */}
          <div className="relative mt-5 p-3 rounded-2xl bg-white shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
            <span className="absolute top-0 left-0 w-6 h-6 border-t-[3px] border-l-[3px] border-[#e50914] rounded-tl-xl" />
            <span className="absolute top-0 right-0 w-6 h-6 border-t-[3px] border-r-[3px] border-[#e50914] rounded-tr-xl" />
            <span className="absolute bottom-0 left-0 w-6 h-6 border-b-[3px] border-l-[3px] border-[#e50914] rounded-bl-xl" />
            <span className="absolute bottom-0 right-0 w-6 h-6 border-b-[3px] border-r-[3px] border-[#e50914] rounded-br-xl" />

            <div
              className={`transition-all duration-300 ${
                status === "confirmed" ? "blur-[2px] opacity-40" : ""
              }`}
            >
              <QRCodeSVG
                value={payment.qr}
                size={216}
                level="M"
                bgColor="#ffffff"
                fgColor="#111111"
                marginSize={0}
              />
            </div>

            {status === "confirmed" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="w-16 h-16 rounded-full bg-[#22c55e] text-white flex items-center justify-center shadow-[0_8px_24px_rgba(34,197,94,0.5)]">
                  <Check size={34} strokeWidth={3} />
                </span>
              </div>
            )}
          </div>

          {/* Amount */}
          <div className="mt-5 flex flex-col items-center">
            <span className="text-[28px] font-[900] text-brand leading-none">
              {formatAmount(payment.amount, payment.currency)}
            </span>
            <span className="text-[12px] text-[var(--app-mute)] font-[600] mt-1.5">
              {bookingCode ? `Booking ${bookingCode}` : "Khmer Cinema"}
            </span>
          </div>

          {/* Countdown / status */}
          {status === "pending" && !isExpired && (
            <div className="mt-4 flex items-center gap-2 text-[12px] font-[700] text-[var(--app-mute)]">
              <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
              Waiting for payment · expires in
              <span className="font-mono text-[var(--app-ink)]">
                {formatCountdown(remaining)}
              </span>
            </div>
          )}

          {status === "confirmed" && (
            <div className="mt-4 flex items-center gap-2 text-[13px] font-[800] text-[#22c55e]">
              <ShieldCheck size={16} /> Payment confirmed — preparing your tickets
            </div>
          )}

          {/* Expired */}
          {isExpired && status === "pending" && (
            <div className="mt-5 w-full flex items-start gap-2.5 bg-[rgba(229,9,20,0.1)] border border-[rgba(229,9,20,0.3)] text-[#f87171] px-4 py-3 rounded-xl text-[13px] font-[600] leading-relaxed">
              <TriangleAlert size={17} className="shrink-0 mt-0.5" />
              <p className="m-0">
                {onRefresh
                  ? "This QR code has expired. Generate a new payment code below to continue this booking."
                  : "This QR code has expired. Close this window and generate a new payment code."}
              </p>
            </div>
          )}

          {/* Error */}
          {error && status === "pending" && (!isExpired || onRefresh) && (
            <div className="mt-5 w-full flex items-start gap-2.5 bg-[rgba(251,191,36,0.1)] border border-[rgba(251,191,36,0.3)] text-[#fbbf24] px-4 py-3 rounded-xl text-[12px] font-[600] leading-relaxed">
              <TriangleAlert size={16} className="shrink-0 mt-0.5" />
              <p className="m-0">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 w-full flex flex-col gap-2.5">
            {status === "pending" && !isExpired && (
              <>
                {onConfirm && (
                  <button
                    onClick={onConfirm}
                    disabled={confirming}
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-[800] py-3.5 rounded-xl transition-all duration-200 cursor-pointer shadow-[0_6px_18px_rgba(34,197,94,0.35)]"
                  >
                    {confirming ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Confirming...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={16} /> {confirmLabel}
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={onCheck}
                  disabled={checking}
                  className="w-full inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-[800] py-3.5 rounded-xl transition-all duration-200 cursor-pointer shadow-[0_6px_18px_rgba(229,9,20,0.35)]"
                >
                  {checking ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Checking...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={16} />
                      {onConfirm ? "Check Bakong status" : "I have paid — Check status"}
                    </>
                  )}
                </button>
              </>
            )}

            {status === "confirmed" && (
              <div className="w-full inline-flex items-center justify-center gap-2 bg-[rgba(34,197,94,0.15)] border border-[rgba(34,197,94,0.4)] text-[#22c55e] text-sm font-[800] py-3.5 rounded-xl">
                <Loader2 size={16} className="animate-spin" /> Loading tickets...
              </div>
            )}

            {status === "pending" && isExpired && onRefresh && (
              <button
                onClick={onRefresh}
                disabled={refreshing}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-[800] py-3.5 rounded-xl transition-all duration-200 cursor-pointer shadow-[0_6px_18px_rgba(34,197,94,0.35)]"
              >
                {refreshing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <RefreshCw size={16} /> Generate new payment code
                  </>
                )}
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full bg-transparent border border-[var(--app-edge2)] text-[var(--app-ink2)] text-[13px] font-[700] py-3 rounded-xl transition-all duration-200 hover:bg-[var(--app-fill)] cursor-pointer"
            >
              {isExpired && !onRefresh ? "Close & try again" : "Close"}
            </button>
          </div>

          <p className="mt-4 text-[11px] text-[var(--app-mute)] font-[600] text-center leading-relaxed">
            Tickets are issued automatically as soon as Bakong confirms your
            payment. Keep this window open.
          </p>
        </div>
      </div>
    </div>
  );
}
