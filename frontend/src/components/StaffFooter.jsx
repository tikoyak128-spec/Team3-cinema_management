import { Link } from "react-router-dom";

const staffLinks = [
  { name: "Dashboard", to: "/staff/dashboard" },
  { name: "Sell Ticket", to: "/staff/sell" },
  { name: "Search Ticket", to: "/staff/search" },
  { name: "Check In", to: "/staff/checkin" },
];

export default function StaffFooter() {
  return (
    <footer className="border-t border-[var(--app-edge)] bg-[var(--app-panel)] px-[30px] py-4">
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-[12px] text-[var(--app-mute)]">
          <span>
            &copy; 2026 <b className="font-bold text-[var(--app-ink)]">Khmer Cinema</b>. Staff Panel.
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-[12px]">
          {staffLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-[var(--app-mute)] hover:text-brand no-underline transition-colors duration-200"
            >
              {link.name}
            </Link>
          ))}
          <span className="w-1 h-1 rounded-full bg-[var(--app-edge2)]" />
          <span className="text-[var(--app-mute)] font-semibold">v1.0.0</span>
        </div>
      </div>
    </footer>
  );
}