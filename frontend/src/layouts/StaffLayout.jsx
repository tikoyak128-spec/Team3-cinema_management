import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { usePrefs } from "../context/PrefsContext";
import LangSwitch from "../components/LangSwitch";
import StaffFooter from "../components/StaffFooter";
import {
  ChartColumn,
  CircleCheck,
  Clapperboard,
  LogOut,
  PanelLeft,
  Search,
  Shield,
  Sun,
  Moon,
  ShoppingCart,
  UserRound,
  X,
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
        className={`flex flex-col border-r border-[var(--app-edge)] bg-[var(--app-panel)] transition-all duration-300 ${
          isMobile
            ? `fixed top-0 left-0 z-[100] h-screen w-[270px] p-[24px_16px] transform ${
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
              }`
            : `shrink-0 self-stretch sticky top-0 ${compact ? "w-[96px] items-center p-[24px_10px]" : "w-[270px] p-[24px_16px]"}`
        }`}
      >
        {/* Logo / Header */}
        <div
          className={`mb-6 flex items-center gap-2.5 border-b border-[var(--app-edge)] pb-5 ${
            compact ? "justify-center" : "justify-between"
          }`}
        >
          <div
            className="flex cursor-pointer items-center gap-2.5"
            onClick={() => handleNav("/staff/dashboard")}
          >
            {!compact && (
              <span className="text-[18px] font-extrabold tracking-[2px] text-[var(--app-ink)]">
                KHMER <span className="text-brand">CINEMA</span>
              </span>
            )}
            {compact && (
              <span className="text-brand"><Clapperboard size={26} /></span>
            )}
          </div>
          {isMobile ? (
            <button
              onClick={() => setSidebarOpen(false)}
              title={t("staff.closeSidebar")}
              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-[var(--app-edge2)] text-[var(--app-mute)] transition-colors duration-200 hover:text-brand"
            >
              <X size={16} />
            </button>
          ) : (
            !compact && (
              <button
                onClick={() => setCollapsed(true)}
                title={t("staff.collapseSidebar")}
                className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-[var(--app-edge2)] text-[var(--app-mute)] transition-colors duration-200 hover:text-brand"
              >
                «
              </button>
            )
          )}
        </div>

        <div
          className={`mb-5 flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-3.5 py-2.5 ${
            compact ? "justify-center" : ""
          }`}
        >
          <span className="text-brand"><Shield size={16} /></span>
          {!compact && <span className="text-[13px] font-bold text-brand">{t("staff.staffPanel")}</span>}
        </div>

        <nav className="flex flex-1 flex-col gap-3 overflow-y-auto">
          {staffSections.map((section) => (
            <div key={section.labelKey} className="flex flex-col gap-1">
              {compact ? (
                <div className="mx-2 my-1 h-px bg-[var(--app-edge)]" />
              ) : (
                <div className="px-3 pb-1.5 pt-1 text-[11px] font-bold uppercase tracking-[1.2px] text-[var(--app-mute)]">
                  {t(`staff.${section.labelKey}`)}
                </div>
              )}
              {section.items.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNav(item.path)}
                  title={compact ? t(`staff.${item.nameKey}`) : undefined}
                  className={`relative flex w-full cursor-pointer items-center rounded-xl text-left text-[14px] font-semibold transition-all duration-200 ${
                    compact ? "justify-center py-3" : "gap-3 px-3.5 py-[11px]"
                  } ${
                    isActive(item.path)
                      ? "bg-brand text-white shadow-[0_4px_14px_rgba(229,9,20,0.35)]"
                      : "text-[var(--app-mute)] hover:bg-[var(--app-fill)] hover:text-[var(--app-ink)]"
                  }`}
                >
                  <span className="flex w-[22px] shrink-0 justify-center text-[18px]"><item.icon size={18} /></span>
                  {!compact && <span className="flex-1">{t(`staff.${item.nameKey}`)}</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div
          className={`mb-3 flex items-center gap-3 rounded-xl border border-[var(--app-edge)] bg-[var(--app-panel2)] px-3 py-2.5 ${
            compact ? "justify-center" : ""
          }`}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand"><Shield size={18} /></span>
          {!compact && (
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-[13px] font-semibold text-[var(--app-ink)]">{user?.name || t("staff.staffMember")}</span>
              <span className="text-[11px] text-[var(--app-mute)]">{t("staff.ticketOfficer")}</span>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          title={compact ? t("staff.logout") : undefined}
          className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[var(--app-edge2)] py-3 text-[13px] font-semibold text-[var(--app-mute)] transition-all duration-200 hover:border-brand/30 hover:bg-brand/10 hover:text-brand ${
            compact ? "px-3" : ""
          }`}
        >
          <LogOut size={16} /> {!compact && t("staff.logout")}
        </button>
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