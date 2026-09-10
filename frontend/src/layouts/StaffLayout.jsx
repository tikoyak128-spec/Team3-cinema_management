import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  ChartColumn,
  CircleCheck,
  Clapperboard,
  LogOut,
  Search,
  Shield,
  Sun,
  Moon,
  Ticket,
  Users,
} from "lucide-react";

const staffSections = [
  {
    label: "Main",
    items: [
      { name: "Dashboard", icon: ChartColumn, path: "/staff/dashboard" },
    ],
  },
  {
    label: "Ticketing",
    items: [
      { name: "Bookings", icon: Ticket, path: "/staff/bookings", badge: "5" },
      { name: "Search Ticket", icon: Search, path: "/staff/search" },
      { name: "Check-In", icon: CircleCheck, path: "/staff/checkin" },
      { name: "Customers", icon: Users, path: "/staff/customers" },
    ],
  },
];

export default function StaffLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const dark = theme === "dark";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) =>
    location.pathname === path ||
    (path !== "/staff/dashboard" && location.pathname.startsWith(path));

  return (
    <div className="flex min-h-screen bg-[var(--app-page)] text-[var(--app-ink)]">
      {/* Sidebar */}
      <aside className="flex w-[260px] max-md:w-[220px] flex-col border-r border-[var(--app-edge)] bg-[var(--app-panel)] p-[24px_16px]">
        <div className="mb-6 flex cursor-pointer items-center gap-2.5 border-b border-[var(--app-edge)] pb-5" onClick={() => navigate("/staff/dashboard")}>
          <span className="text-brand"><Clapperboard size={26} /></span>
          <span className="text-[18px] font-extrabold tracking-[2px] text-[var(--app-ink)]">
            KHMER <span className="text-brand">CINEMA</span>
          </span>
        </div>

        <div className="mb-5 flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-3.5 py-2.5">
          <span className="text-brand"><Shield size={16} /></span>
          <span className="text-[13px] font-bold text-brand">Staff Panel</span>
        </div>

        <nav className="flex flex-1 flex-col gap-3 overflow-y-auto">
          {staffSections.map((section) => (
            <div key={section.label} className="flex flex-col gap-1">
              <div className="px-3 pb-1.5 pt-1 text-[11px] font-bold uppercase tracking-[1.2px] text-[var(--app-mute)]">
                {section.label}
              </div>
              {section.items.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`relative flex w-full cursor-pointer items-center gap-3 rounded-xl px-3.5 py-[11px] text-left text-[14px] font-semibold transition-all duration-200 ${
                    isActive(item.path)
                      ? "bg-brand text-white shadow-[0_4px_14px_rgba(229,9,20,0.35)]"
                      : "text-[var(--app-mute)] hover:bg-[var(--app-fill)] hover:text-[var(--app-ink)]"
                  }`}
                >
                  <span className="flex w-[22px] shrink-0 justify-center text-[18px]"><item.icon size={18} /></span>
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-black/10 px-1.5 text-[11px] font-bold text-[var(--app-ink2)] dark:bg-white/20 dark:text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="mb-3 flex items-center gap-3 rounded-xl border border-[var(--app-edge)] bg-[var(--app-panel2)] px-3 py-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand"><Shield size={18} /></span>
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-[13px] font-semibold text-[var(--app-ink)]">{user?.name || "Staff Member"}</span>
            <span className="text-[11px] text-[var(--app-mute)]">Ticket Officer</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[var(--app-edge2)] py-3 text-[13px] font-semibold text-[var(--app-mute)] transition-all duration-200 hover:border-brand/30 hover:bg-brand/10 hover:text-brand"
        >
          <LogOut size={16} /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--app-edge)] bg-[var(--app-header)] px-[30px] py-4 backdrop-blur-[12px]">
          <h2 className="text-[20px] font-extrabold">Staff Dashboard</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              title={dark ? "Switch to light mode" : "Switch to dark mode"}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[var(--app-edge2)] bg-[var(--app-fill)] text-[var(--app-ink2)] transition-all duration-200 hover:border-brand/50 hover:text-brand"
            >
              {dark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <span className="rounded-full border border-brand/30 bg-brand/10 px-3.5 py-1.5 text-[13px] font-bold text-brand">
              <Shield size={13} className="mr-1 inline" /> {user?.name || "Staff Member"}
            </span>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-[30px]">
          {children || (
            <h1 className="text-[24px] text-[var(--app-ink)]">Staff Dashboard</h1>
          )}
        </div>
      </main>
    </div>
  );
}