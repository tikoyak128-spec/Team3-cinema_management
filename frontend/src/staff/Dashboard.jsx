import { CircleCheck, Clock, Ticket, Users, Wallet } from "lucide-react";

const stats = [
  { label: "Bookings Today", value: "12", icon: Ticket, color: "#e50914" },
  { label: "Tickets Scanned", value: "8", icon: CircleCheck, color: "#22c55e" },
  { label: "Active Customers", value: "24", icon: Users, color: "#60a5fa" },
  { label: "Revenue Today", value: "$60", icon: Wallet, color: "#eab308" },
];

const recentBookings = [
  { customer: "Sok Vannak", movie: "The Last Emperor", seats: ["A3", "A4"], time: "14:00", status: "Confirmed" },
  { customer: "Dara Kem", movie: "City of Shadows", seats: ["B7", "B8"], time: "16:30", status: "Pending" },
  { customer: "Khuon Srey", movie: "Golden Dawn", seats: ["A1"], time: "19:00", status: "Confirmed" },
];

export default function Dashboard() {
  const statusBadge = (s) =>
    s === "Confirmed"
      ? "bg-[rgba(22,163,74,0.14)] text-[#22c55e] border border-[rgba(34,197,94,0.3)]"
      : "bg-[rgba(234,179,8,0.14)] text-[#eab308] border border-[rgba(234,179,8,0.3)]";

  return (
    <div className="flex flex-col gap-6 text-[var(--app-ink)]">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-[26px] font-extrabold">Staff Dashboard</h1>
          <p className="text-sm text-[var(--app-mute)] mt-1">Today's overview and recent bookings.</p>
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] max-[640px]:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-5">
        {stats.map((s) => (
          <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl p-[22px] transition-all duration-200 hover:-translate-y-[3px] hover:border-[rgba(229,9,20,0.4)]" key={s.label}>
            <span className="text-[26px] float-right opacity-80"><s.icon size={22} /></span>
            <div className="text-[13px] text-[var(--app-mute)] font-semibold">{s.label}</div>
            <div className="text-[32px] font-extrabold mt-1.5 text-[var(--c)]" style={{ "--c": s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl p-6">
        <h2 className="text-lg font-extrabold mb-[18px]">Recent Bookings</h2>
        <div className="flex flex-col gap-3">
          {recentBookings.map((b, i) => (
            <div key={i} className="flex justify-between items-center p-4 bg-[var(--app-panel2)] rounded-xl border border-[var(--app-edge)] flex-wrap gap-3">
              <div>
                <div className="font-bold text-[15px]">{b.customer}</div>
                <div className="text-[13px] text-[var(--app-mute)] mt-1">
                  {b.movie} · {b.seats.join(", ")} · <Clock size={13} /> {b.time}
                </div>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-[5px] text-xs font-bold rounded-[20px] whitespace-nowrap ${statusBadge(b.status)}`}>{b.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
