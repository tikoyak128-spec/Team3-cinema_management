import { useState } from "react";
import { Armchair, CircleCheck, Clapperboard, DoorOpen, ScanLine, TriangleAlert } from "lucide-react";

export default function CheckIn() {
  const [code, setCode] = useState("");
  const [checkedIn, setCheckedIn] = useState(false);
  const [error, setError] = useState(false);

  const handleScan = (e) => {
    e.preventDefault();
    if (code.trim().length > 0) {
      setCheckedIn(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-[var(--app-ink)]">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-[26px] font-extrabold">Check-In</h1>
          <p className="text-sm text-[var(--app-mute)] mt-1">Validate tickets at the entrance by scanning the booking code.</p>
        </div>
      </div>

      <form className="flex items-center gap-3.5 bg-[var(--app-deep)] border-2 border-[var(--app-edge)] rounded-2xl py-5 px-6 mb-5" onSubmit={handleScan}>
        <span className="text-2xl"><ScanLine size={18} /></span>
        <input
          className="bg-transparent border-none outline-none text-[var(--app-ink)] text-lg w-full placeholder:text-[var(--app-ink2)]"
          placeholder="Scan or type ticket code..."
          value={code}
          onChange={(e) => { setCode(e.target.value); setCheckedIn(false); setError(false); }}
        />
        <button type="submit" className="inline-flex items-center gap-2 border-none cursor-pointer py-[11px] px-5 text-sm font-bold rounded-xl transition-all duration-200 bg-[#22a34e] text-white shadow-[0_4px_14px_rgba(34,163,78,0.35)] hover:bg-[#1e9344]">Validate</button>
      </form>

      {error && (
        <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl p-6 bg-[rgba(229,9,20,0.08)] border-[rgba(229,9,20,0.3)]">
          <div className="[text-align:center] py-[30px] text-[#e50914] font-bold">
            <TriangleAlert size={18} /> Please enter a ticket code to check in.
          </div>
        </div>
      )}

      {checkedIn && (
        <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl p-6 bg-[rgba(34,197,94,0.08)] border-[rgba(34,197,94,0.3)]">
          <div className="[text-align:center] py-[30px]">
            <div className="text-[54px] mb-[10px]"><CircleCheck size={54} /></div>
            <div className="text-[22px] font-extrabold text-[#22c55e]">Check-in Successful</div>
            <p className="text-[var(--app-mute)] mt-[8px]">
              Ticket <b className="text-[var(--app-ink)]">{code.toUpperCase()}</b> is valid.
            </p>
            <div className="flex items-center gap-2.5 flex-wrap justify-center mt-[16px]">
              <span className="inline-flex items-center gap-1.5 bg-[var(--app-panel2)] border border-[var(--app-edge2)] text-[var(--app-ink2)] py-1.5 px-3 rounded-[10px] text-[13px] font-semibold"><Clapperboard size={13} /> The Last Emperor</span>
              <span className="inline-flex items-center gap-1.5 bg-[var(--app-panel2)] border border-[var(--app-edge2)] text-[var(--app-ink2)] py-1.5 px-3 rounded-[10px] text-[13px] font-semibold"><DoorOpen size={13} /> Hall 1</span>
              <span className="inline-flex items-center gap-1.5 bg-[var(--app-panel2)] border border-[var(--app-edge2)] text-[var(--app-ink2)] py-1.5 px-3 rounded-[10px] text-[13px] font-semibold"><Armchair size={13} /> A3, A4</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
