import { Armchair, QrCode } from "lucide-react";

export default function TicketDetails() {
  return (
    <div className="flex flex-col gap-6 text-[var(--app-ink)]">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-[26px] font-extrabold">Ticket Details</h1>
          <p className="text-sm text-[var(--app-mute)] mt-1">View full details for a single ticket.</p>
        </div>
      </div>

      <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl p-6">
        <div className="flex gap-[24px] flex-wrap items-start">
          <div className="min-w-[180px] shrink-0">
            <div className="w-[180px] h-[180px] bg-[var(--app-panel2)] rounded-[14px] border-2 border-dashed border-[var(--app-edge2)] flex flex-col items-center justify-center gap-[6px]">
              <QrCode size={56} color="#e50914" />
              <span className="text-[12px] text-[var(--app-mute)]">QR Code</span>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-[5px] text-xs font-bold rounded-[20px] whitespace-nowrap mt-[12px]">BK-0001</span>
          </div>

          <div className="flex-1 min-w-[260px]">
            <div className="bg-[var(--app-panel2)] border border-[var(--app-edge)] rounded-[14px] p-[22px]">
              <div className="flex justify-between items-center py-3 border-b border-[var(--app-edge)] last:border-b-0">
                <span className="text-[13px] text-[var(--app-mute)] font-semibold">Customer</span>
                <span className="text-[15px] font-bold text-[var(--app-ink)] text-right">Sok Vannak</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-[var(--app-edge)] last:border-b-0">
                <span className="text-[13px] text-[var(--app-mute)] font-semibold">Email</span>
                <span className="text-[15px] font-bold text-[var(--app-ink)] text-right">sok@email.com</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-[var(--app-edge)] last:border-b-0">
                <span className="text-[13px] text-[var(--app-mute)] font-semibold">Movie</span>
                <span className="text-[15px] font-bold text-[var(--app-ink)] text-right">The Last Emperor</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-[var(--app-edge)] last:border-b-0">
                <span className="text-[13px] text-[var(--app-mute)] font-semibold">Cinema</span>
                <span className="text-[15px] font-bold text-[var(--app-ink)] text-right">Cinema Phnom Penh · Hall 1</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-[var(--app-edge)] last:border-b-0">
                <span className="text-[13px] text-[var(--app-mute)] font-semibold">Showtime</span>
                <span className="text-[15px] font-bold text-[var(--app-ink)] text-right">2026-08-31 · 14:00</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-[var(--app-edge)] last:border-b-0">
                <span className="text-[13px] text-[var(--app-mute)] font-semibold">Seats</span>
                <span className="text-[15px] font-bold text-[var(--app-ink)] text-right">
                  <span className="flex items-center gap-2.5 flex-wrap justify-end">
                    <span className="inline-flex items-center gap-1.5 bg-[var(--app-panel2)] border border-[var(--app-edge2)] text-[var(--app-ink2)] py-1.5 px-3 rounded-[10px] text-[13px] font-semibold"><Armchair size={13} /> A3</span>
                    <span className="inline-flex items-center gap-1.5 bg-[var(--app-panel2)] border border-[var(--app-edge2)] text-[var(--app-ink2)] py-1.5 px-3 rounded-[10px] text-[13px] font-semibold"><Armchair size={13} /> A4</span>
                  </span>
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-[var(--app-edge)] last:border-b-0">
                <span className="text-[13px] text-[var(--app-mute)] font-semibold">Ticket Type</span>
                <span className="text-[15px] font-bold text-[var(--app-ink)] text-right"><span className="inline-flex items-center gap-1.5 px-3 py-[5px] text-xs font-bold rounded-[20px] whitespace-nowrap bg-[var(--app-fill)] text-[var(--app-mute)] border border-[var(--app-edge2)]">Standard</span></span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-[var(--app-edge)] last:border-b-0">
                <span className="text-[13px] text-[var(--app-mute)] font-semibold">Total Paid</span>
                <span className="text-[18px] font-bold text-[#e50914] text-right">$10.00</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-[var(--app-edge)] last:border-b-0">
                <span className="text-[13px] text-[var(--app-mute)] font-semibold">Status</span>
                <span className="text-[15px] font-bold text-[var(--app-ink)] text-right"><span className="inline-flex items-center gap-1.5 px-3 py-[5px] text-xs font-bold rounded-[20px] whitespace-nowrap bg-[rgba(22,163,74,0.14)] text-[#22c55e] border border-[rgba(34,197,94,0.3)]">Confirmed</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
