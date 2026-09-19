import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { usePrefs } from "../context/PrefsContext";
import LangSwitch from "../components/LangSwitch";
import StaffFooter from "../components/StaffFooter";
import {
  CalendarDays,
  ChartColumn,
  CircleCheck,
  CircleUser,
  LogOut,
  PanelLeft,
  Search,
  Shield,
  Sun,
  Moon,
  ShoppingCart,
  Ticket,
  UserRound,
} from "lucide-react";

const staffSections = [
  {
    labelKey: "main",
    items: [
      { nameKey: "dashboard", icon: ChartColumn, path: "/staff/dashboard" },
      { nameKey: "profile", icon: UserRound, path: "/staff/profile" },
    ],
  },
  {
    labelKey: "ticketing",
    items: [
      { nameKey: "sellTicket", icon: ShoppingCart, path: "/staff/sell" },
      { nameKey: "searchTicket", icon: Search, path: "/staff/search" },
      { nameKey: "checkIn", icon: CircleCheck, path: "/staff/checkin" },
    ],
  },
  {
    labelKey: "management",
    items: [
      { nameKey: "bookings", icon: CalendarDays, path: "/staff/bookings" },
      { nameKey: "tickets", icon: Ticket, path: "/staff/tickets" },
    ],
  },
];

export default function StaffLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t } = usePrefs();
  const dark = theme === "dark";

  const [collapsed, setCollapsed] = useState(
    () => typeof window !== "undefined" && window.innerWidth >= 1024
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 1024
  );

  const compact = collapsed && !isMobile;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleSidebar = () => {
    if (isMobile) setSidebarOpen((prev) => !prev);
    else setCollapsed((prev) => !prev);
  };

  const handleNav = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const isActive = (path) =>
    location.pathname === path ||
    (path !== "/staff/dashboard" && location.pathname.startsWith(path));

  return (
    <div className="flex min-h-screen bg-[var(--app-page)] text-[var(--app-ink)]">
      {/* Overlay (mobile only) */}
      <div
        className={`pointer-events-none fixed inset-0 z-[90] bg-black/50 opacity-0 backdrop-blur-[5px] transition-opacity duration-300 ${
          !isMobile || !sidebarOpen ? "" : "pointer-events-auto opacity-100"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isMobile
            ? `fixed top-0 left-0 z-[100] h-screen w-[270px] transform ${
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
              }`
            : `shrink-0 border-r bg-gradient-to-b from-white to-[#f1f1f1] dark:from-[#111111] dark:to-[#0a0a0a] border-[rgba(0,0,0,0.1)] dark:border-dark-border ${
                compact ? "w-[94px]" : "w-[270px]"
              }`
        }`}
      >
        <div className="flex min-h-full flex-col overflow-y-auto overflow-x-hidden">
          {/* Logo / Header */}
          <div
            className={`flex min-h-[70px] items-center gap-2 border-b px-[18px] border-[rgba(0,0,0,0.1)] dark:border-dark-border ${
              compact ? "justify-center" : "justify-between"
            }`}
          >
            <div
              className="flex cursor-pointer items-center gap-3 overflow-hidden whitespace-nowrap"
              onClick={() => handleNav("/staff/dashboard")}
            >
              {!compact && (
                <span className="text-[18px] font-extrabold tracking-[2px] text-[#1a1a1a] dark:text-[#f5f5f5]">
                  KHMER <b className="font-extrabold text-brand">CINEMA</b>
                </span>
              )}
            </div>
            {!compact && (
              <div className="flex shrink-0 gap-1.5">
                {isMobile ? (
                  <button
                    className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border text-[14px] text-muted transition-all duration-200 dark:bg-[rgba(255,255,255,0.03)] dark:border-dark-border bg-[rgba(0,0,0,0.03)] border-[rgba(0,0,0,0.1)] hover:border-[rgba(229,9,20,0.3)] hover:bg-[rgba(229,9,20,0.1)] hover:text-brand"
                    onClick={() => setSidebarOpen(false)}
                    title={t("staff.closeSidebar")}
                  >
                    ✕
                  </button>
                ) : (
                  <button
                    className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border text-[14px] text-muted transition-all duration-200 dark:bg-[rgba(255,255,255,0.03)] dark:border-dark-border bg-[rgba(0,0,0,0.03)] border-[rgba(0,0,0,0.1)] hover:border-[rgba(229,9,20,0.3)] hover:bg-[rgba(229,9,20,0.1)] hover:text-brand"
                    onClick={() => setCollapsed(true)}
                    title={t("staff.collapseSidebar")}
                  >
                    «
                  </button>
                )}
              </div>
            )}
            {compact && (
              <button
                className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border text-[14px] text-muted transition-all duration-200 dark:bg-[rgba(255,255,255,0.03)] dark:border-dark-border bg-[rgba(0,0,0,0.03)] border-[rgba(0,0,0,0.1)] hover:border-[rgba(229,9,20,0.3)] hover:bg-[rgba(229,9,20,0.1)] hover:text-brand"
                onClick={toggleSidebar}
                title={t("staff.expandSidebar")}
              >
                »
              </button>
            )}
          </div>

          <nav className={`flex flex-1 flex-col gap-1.5 px-2.5 py-4 ${compact ? "items-center" : ""}`}>
            {staffSections.map((section) => (
              <div key={section.labelKey} className="mb-3">
                <div
                  className={`flex items-center gap-2 px-3 pb-2 pt-1.5 text-[11px] font-bold uppercase tracking-[1.2px] text-muted ${
                    compact ? "justify-center !px-0 !py-2" : ""
                  }`}
                >
                  {compact ? (
                    <span className="h-px w-8 bg-black/10 dark:bg-white/10" />
                  ) : (
                    <span className="text-muted">{t(`staff.${section.labelKey}`)}</span>
                  )}
                </div>
                {section.items.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNav(item.path)}
                      title={compact ? t(`staff.${item.nameKey}`) : undefined}
                      className={`group relative flex w-full cursor-pointer items-center whitespace-nowrap rounded-[10px] px-3.5 py-[11px] text-left text-[14px] font-medium transition-all duration-200 ${
                        compact ? "justify-center !gap-0 !px-0 py-3" : "gap-3.5"
                      } ${
                        active
                          ? compact
                            ? "font-semibold text-brand"
                            : "bg-gradient-to-br from-[rgba(229,9,20,0.15)] to-[rgba(229,9,20,0.05)] font-semibold text-brand before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-[3px] before:rounded-r before:bg-brand"
                          : compact
                            ? "text-muted hover:text-[#1a1a1a] dark:hover:text-[#f5f5f5]"
                            : "text-muted hover:bg-black/5 hover:text-[#1a1a1a] dark:hover:bg-white/5 dark:hover:text-[#f5f5f5]"
                      }`}
                    >
                      <span
                        className={`shrink-0 ${
                          compact
                            ? `flex h-10 w-10 items-center justify-center rounded-lg border transition-all duration-200 ${
                                active
                                  ? "border-brand/50 text-brand"
                                  : "border-transparent text-current group-hover:border-brand/40 group-hover:text-brand group-hover:bg-black/5 dark:group-hover:bg-white/10"
                              }`
                            : "flex w-[26px] justify-center"
                        }`}
                      >
                        <item.icon size={22} strokeWidth={2} />
                      </span>
                      {!compact && <span className="flex-1">{t(`staff.${item.nameKey}`)}</span>}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Bottom profile + logout */}
          <div className="relative border-t border-[rgba(0,0,0,0.1)] p-3.5 dark:border-dark-border">
            <div
              className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors duration-200 bg-[rgba(0,0,0,0.03)] dark:bg-[rgba(255,255,255,0.03)] border-[rgba(0,0,0,0.1)] dark:border-dark-border hover:border-[rgba(229,9,20,0.3)] ${
                compact ? "justify-center" : ""
              }`}
              onClick={() => handleNav("/staff/profile")}
              title={t("staff.profile")}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand/10 text-[13px] font-bold text-brand">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user?.name} className="h-full w-full object-cover" />
                ) : (
                  <CircleUser size={20} />
                )}
              </span>
              {!compact && (
                <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                  <span className="truncate text-[13px] font-semibold text-[#1a1a1a] dark:text-[#f5f5f5]">
                    {user?.name || t("staff.staffMember")}
                  </span>
                  <span className="truncate text-[11px] text-muted">{t("staff.ticketOfficer")}</span>
                </div>
              )}
              {!compact && <span className="shrink-0 text-[14px] text-muted">▾</span>}
            </div>
            <button
              onClick={handleLogout}
              title={compact ? t("staff.logout") : undefined}
              className={`mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] border py-2.5 text-[13px] font-semibold text-muted transition-all duration-200 bg-transparent dark:border-dark-border border-[rgba(0,0,0,0.1)] hover:border-[rgba(229,9,20,0.3)] hover:bg-[rgba(229,9,20,0.1)] hover:text-brand ${
                compact ? "px-3" : ""
              }`}
            >
              <LogOut size={16} />
              {!compact && <span>{t("staff.logout")}</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--app-edge)] bg-[var(--app-header)] px-[30px] py-4 backdrop-blur-[12px]">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              title={t(isMobile ? "staff.openSidebar" : compact ? "staff.expandSidebar" : "staff.collapseSidebar")}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[var(--app-edge2)] bg-[var(--app-fill)] text-[var(--app-ink2)] transition-all duration-200 hover:border-brand/50 hover:text-brand"
            >
              <PanelLeft size={18} />
            </button>
            <h2 className="text-[20px] font-extrabold">{t("staff.staffDashboard")}</h2>
          </div>
          <div className="flex items-center gap-3">
            <LangSwitch size="sm" />
            <button
              onClick={toggleTheme}
              title={dark ? "Switch to light mode" : "Switch to dark mode"}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[var(--app-edge2)] bg-[var(--app-fill)] text-[var(--app-ink2)] transition-all duration-200 hover:border-brand/50 hover:text-brand"
            >
              {dark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <span className="rounded-full border border-brand/30 bg-brand/10 px-3.5 py-1.5 text-[13px] font-bold text-brand">
              <Shield size={13} className="mr-1 inline" /> {user?.name || t("staff.staffMember")}
            </span>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-[30px]">
          {children || (
            <h1 className="text-[24px] text-[var(--app-ink)]">{t("staff.staffDashboard")}</h1>
          )}
        </div>
        <StaffFooter />
      </main>
    </div>
  );
}