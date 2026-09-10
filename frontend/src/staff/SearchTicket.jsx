import { useState } from "react";
import { Armchair, Search, Ticket } from "lucide-react";

export default function SearchTicket() {
  const [code, setCode] = useState("");
  const [searched, setSearched] = useState(false);

  const found = code.trim().length > 0;

  const handleSearch = (e) => {
    e.preventDefault();
    setSearched(true);
  };

  return (
    <div className="flex flex-col gap-6 text-[var(--app-ink)]">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-[26px] font-extrabold">Search Ticket</h1>
          <p className="text-sm text-[var(--app-mute)] mt-1">Find a ticket by its booking reference.</p>
        </div>
      </div>

      <form className="flex items-center gap-3.5 bg-[var(--app-deep)] border-2 border-[var(--app-edge)] rounded-2xl py-5 px-6 mb-5" onSubmit={handleSearch}>
        <span className="text-2xl"><Search size={18} /></span>
        <input
          className="bg-transparent border-none outline-none text-[var(--app-ink)] text-lg w-full placeholder:text-[var(--app-ink2)]"
          placeholder="Enter ticket or booking code..."
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button type="submit" className="inline-flex items-center gap-2 border-none cursor-pointer py-[11px] px-5 text-sm font-bold rounded-xl transition-all duration-200 bg-[#e50914] text-white shadow-[0_4px_14px_rgba(229,9,20,0.35)] hover:bg-[#f40612] hover:-translate-y-0.5">Search</button>
      </form>

      {searched && found && (
        <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl p-6">
          <h2 className="text-lg font-extrabold mb-4">Result</h2>
          <div className="flex items-center gap-3.5 p-4 bg-[var(--app-panel2)] rounded-xl border border-[var(--app-edge)] mb-4">
            <div className="w-[44px] h-[44px] rounded-full bg-[rgba(229,9,20,0.12)] flex items-center justify-center text-lg"><Ticket size={20} /></div>
            <div className="w-full">
              <div className="font-extrabold text-base">Booking #{code.toUpperCase()}</div>
              <div className="text-[13px] text-[var(--app-mute)]">The Last Emperor · Cinema Phnom Penh · Hall 1</div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-[5px] text-xs font-bold rounded-[20px] whitespace-nowrap bg-[rgba(22,163,74,0.14)] text-[#22c55e] border border-[rgba(34,197,94,0.3)]">Valid</span>
          </div>

          <div className="bg-[var(--app-panel2)] border border-[var(--app-edge)] rounded-[14px] p-[22px]">
            <div className="flex justify-between items-center py-3 border-b border-[var(--app-edge)] last:border-b-0">
              <span className="text-[13px] text-[var(--app-mute)] font-semibold">Customer</span>
              <span className="text-[15px] font-bold text-[var(--app-ink)] text-right">Sok Vannak</span>
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
              <span className="text-[13px] text-[var(--app-mute)] font-semibold">Total Paid</span>
              <span className="text-[15px] font-bold text-[var(--app-ink)] text-right">$10.00</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-[var(--app-edge)] last:border-b-0">
              <span className="text-[13px] text-[var(--app-mute)] font-semibold">Ticket Type</span>
              <span className="text-[15px] font-bold text-[var(--app-ink)] text-right"><span className="inline-flex items-center gap-1.5 px-3 py-[5px] text-xs font-bold rounded-[20px] whitespace-nowrap bg-[var(--app-fill)] text-[var(--app-mute)] border border-[var(--app-edge2)]">Standard</span></span>
            </div>
          </div>
        </div>
      )}

      {searched && !found && (
        <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl p-6">
          <div className="flex flex-col items-center justify-center py-[40px] text-[var(--app-mute)] [text-align:center]">
            <div className="text-[44px] mb-[10px]"><Ticket size={44} /></div>
            <p>Enter a booking code to search for a ticket.</p>
          </div>
        </div>
      )}
    </div>
  );
}
