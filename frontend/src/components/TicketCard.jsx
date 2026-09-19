import { forwardRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import {
  Armchair,
  Calendar,
  Clapperboard,
  Clock,
  MapPin,
  QrCode,
  Ticket,
} from "lucide-react";

const ACCENT = "#e50914";
const STUB_BG = "#f6f7f9";

const currencySymbol = (currency) => (currency === "KHR" ? "៛" : "$");

const pad = (n) => String(n).padStart(2, "0");

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function InfoRow({ icon: Icon, label, value, accent = false }) {
  return (
    <div className="flex items-center justify-between gap-3 py-[6px] border-b border-dashed last:border-b-0" style={{ borderColor: "#e8e8ec" }}>
      <span className="inline-flex items-center gap-2 text-[9.5px] font-bold uppercase tracking-[0.16em] text-[#8a8a8a]">
        <span
          className="w-[18px] h-[18px] rounded-md flex items-center justify-center shrink-0"
          style={{ backgroundColor: "rgba(229,9,20,0.1)", color: ACCENT }}
        >
          <Icon size={10} />
        </span>
        {label}
      </span>
      <span
        className="text-[12px] font-extrabold text-[#1a1a1a] text-right"
        style={accent ? { color: ACCENT } : undefined}
      >
        {value}
      </span>
    </div>
  );
}

function Perforation() {
  return (
    <div
      className="relative w-[26px] shrink-0"
      style={{ borderLeft: "2px dashed #e3e3e8" }}
    >
      {/* top notch */}
      <div className="absolute -left-[13px] -top-[13px] w-[26px] h-[26px] overflow-hidden rounded-full">
        <div className="absolute inset-0 rounded-full bg-white" />
        <div
          className="absolute left-[13px] top-0 h-full w-[13px]"
          style={{ backgroundColor: STUB_BG }}
        />
      </div>
      {/* bottom notch */}
      <div className="absolute -left-[13px] -bottom-[13px] w-[26px] h-[26px] overflow-hidden rounded-full">
        <div className="absolute inset-0 rounded-full bg-white" />
        <div
          className="absolute left-[13px] top-0 h-full w-[13px]"
          style={{ backgroundColor: STUB_BG }}
        />
      </div>
    </div>
  );
}

function TicketCard(
  {
    movie,
    cinema,
    room,
    startTime,
    bookingCode,
    ticketCode,
    seats = [],
    amount = 0,
    currency = "USD",
  },
  ref
) {
  const seatLabel =
    seats.length > 0
      ? seats
          .map(
            (s) =>
              s?.seat?.seat_number ||
              s?.seat_number ||
              s?.name ||
              s?.id ||
              "—"
          )
          .join(", ")
      : "—";

  return (
    <div
      ref={ref}
      className="relative w-full max-w-[440px] rounded-3xl overflow-hidden select-none shadow-[0_18px_50px_rgba(0,0,0,0.25)]"
      style={{
        fontFamily: "'Mulish','Kantumruy Pro',system-ui,sans-serif",
        background: "linear-gradient(180deg,#ffffff 0%,#f7f7f9 100%)",
        color: "#0f0f0f",
      }}
    >
      {/* Accent bar */}
      <div className="h-[6px] bg-gradient-to-r from-[#c32127] via-[#ff5a5f] to-[#c32127]" />

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <div className="flex items-center gap-2.5">
          <span
            className="w-8 h-8 rounded-xl text-white flex items-center justify-center shadow-[0_4px_14px_rgba(229,9,20,0.35)]"
            style={{ backgroundColor: ACCENT }}
          >
            <Clapperboard size={16} />
          </span>
          <div className="leading-none">
            <div className="text-[12px] font-black tracking-[0.22em] text-[#111]">
              KHMER <span style={{ color: ACCENT }}>CINEMA</span>
            </div>
            <div className="mt-1 text-[8px] font-bold tracking-[0.28em] text-[#9a9a9a] uppercase">
              E-Ticket · Entrance Pass
            </div>
          </div>
        </div>
        <span
          className="text-[9px] font-black tracking-[0.22em] px-3 py-1.5 rounded-full border"
          style={{
            backgroundColor: "rgba(229,9,20,0.08)",
            color: ACCENT,
            borderColor: "rgba(229,9,20,0.25)",
          }}
        >
          ADMIT ONE
        </span>
      </div>

      <div className="flex items-stretch">
        {/* Main */}
        <div className="flex-1 min-w-0 px-5 pt-2 pb-4">
          <div className="flex items-center gap-1.5 text-[8.5px] font-bold uppercase tracking-[0.26em] text-[#9a9a9a]">
            <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ACCENT }} />
            Now Showing
          </div>
          <div className="mt-1 text-[19px] font-black leading-tight text-[#111] line-clamp-2">
            {movie || "—"}
          </div>

          <div className="mt-3">
            {cinema && (
              <InfoRow
                icon={MapPin}
                label="Cinema"
                value={`${cinema}${room ? ` · ${room}` : ""}`}
              />
            )}
            <InfoRow icon={Calendar} label="Date" value={formatDate(startTime)} />
            <InfoRow icon={Clock} label="Time" value={formatTime(startTime)} />
            <InfoRow
              icon={Armchair}
              label="Seats"
              value={seatLabel}
              accent
            />
          </div>
        </div>

        {/* Perforation */}
        <Perforation />

        {/* Stub */}
        <div
          className="w-[150px] shrink-0 flex flex-col items-center justify-center gap-2.5 px-3.5 py-5"
          style={{ backgroundColor: STUB_BG }}
        >
          <div
            className="bg-white rounded-2xl p-2 border shadow-[0_4px_18px_rgba(0,0,0,0.10)]"
            style={{ borderColor: "#ececec" }}
          >
            <QRCodeCanvas
              value={ticketCode || bookingCode || "KHMER-CINEMA"}
              size={100}
              level="M"
              bgColor="#ffffff"
              fgColor="#111111"
              marginSize={0}
            />
          </div>
          <div className="font-mono text-[13px] font-black tracking-[0.12em] text-[#111]">
            {ticketCode || "—"}
          </div>
          <div className="inline-flex items-center gap-1 text-[8px] font-black tracking-[0.2em] text-[#8a8a8a] uppercase">
            <QrCode size={9} style={{ color: ACCENT }} /> Scan at entrance
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-dashed pl-[5px]" style={{ borderColor: "#dedee4" }}>
        <div className="flex items-center gap-1.5 min-w-0 text-[9px] font-black tracking-[0.14em] text-[#8a8a8a] uppercase pl-[5px]">
          <Ticket size={11} style={{ color: ACCENT }} />
          {bookingCode || "—"}
        </div>
        <div className="flex items-end gap-1.5 shrink-0">
          <span className="text-[8.5px] font-bold uppercase tracking-[0.16em] text-[#9a9a9a] pb-[2px]">
            Paid
          </span>
          <span className="text-[17px] font-black leading-none" style={{ color: ACCENT }}>
            {currencySymbol(currency)}
            {Number(amount || 0).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default forwardRef(TicketCard);