import { Link } from "react-router-dom";

const adminLinks = [
  { name: "Dashboard", to: "/admin/dashboard" },
  { name: "Analytics", to: "/admin/analytics" },
  { name: "Bookings", to: "/admin/bookings" },
  { name: "Reports", to: "/admin/reports" },
];

export default function AdminFooter() {
  return (
    <footer className="border-t border-[rgba(0,0,0,0.1)] dark:border-dark-border bg-[rgba(255,255,255,0.6)] dark:bg-[rgba(0,0,0,0.3)] px-7 py-4 transition-colors duration-300">
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-[12px] text-[var(--app-mute)]">
          <span>
            &copy; 2026 <b className="font-bold text-[var(--app-ink)]">Khmer Cinema</b>. Admin Panel.
          </span>
        </div>

        <div className="flex items-center gap-4 text-[12px]">
          {adminLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-[var(--app-mute)] hover:text-brand no-underline transition-colors duration-200"
            >
              {link.name}
            </Link>
          ))}
          <span className="w-1 h-1 rounded-full bg-[var(--app-edge2)]" />
          <span className="text-[var(--app-mute)] font-semibold">
            v1.0.0
          </span>
        </div>
      </div>
    </footer>
  );
}