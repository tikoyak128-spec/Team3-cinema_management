import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { usePrefs } from "../context/PrefsContext";
import AdminFooter from "../components/AdminFooter";
import LangSwitch from "../components/LangSwitch";
import { adminNavSections } from "../config/adminNav";
import {
  CircleUser,
  Clapperboard,
  House,
  LogOut,
  Moon,
  PanelLeft,
  Sun,
} from "lucide-react";

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t } = usePrefs();
  const isDarkMode = theme === "dark";
  const [collapsed, setCollapsed] = useState(() => typeof window !== "undefined" && window.innerWidth >= 1024);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 1024);
  const [expandedMenus, setExpandedMenus] = useState({});
  const [profileOpen, setProfileOpen] = useState(false);

  const activePath = location.pathname;
  const compact = collapsed && !isMobile;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    adminNavSections.forEach((section) => {
      section.items.forEach((item) => {
        if (item.children && item.children.some((c) => c.path === activePath)) {
          setExpandedMenus((prev) => ({ ...prev, [item.name]: true }));
        }
      });
    });
  }, [activePath]);

  const toggleSidebar = () => {
    if (isMobile) setSidebarOpen((prev) => !prev);
    else {
      setCollapsed((prev) => !prev);
      setProfileOpen(false);
    }
  };
  const toggleCollapse = () => {
    setCollapsed((prev) => !prev);
    setProfileOpen(false);
  };

  const toggleMenu = (name) => {
    setExpandedMenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleNav = (path) => {
    navigate(path);
    setProfileOpen(false);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const btnBase = "flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-[10px] border text-[15px] text-muted transition-all duration-200 dark:bg-[rgba(255,255,255,0.03)] dark:border-dark-border bg-[rgba(0,0,0,0.03)] border-[rgba(0,0,0,0.1)] hover:border-[rgba(229,9,20,0.3)] hover:bg-[rgba(229,9,20,0.1)] hover:text-brand";

  return (
    <div
      className={`flex h-screen w-full overflow-hidden transition-colors duration-300 bg-[#f6f6f6] text-[#4a4a4a] dark:bg-dark dark:text-[#e2e8f0]`}
    >
      {/* Overlay with background blur when sidebar is open (mobile only) */}
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
            ? `fixed top-0 left-0 z-[100] h-screen w-[270px] transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`
            : `shrink-0 h-full border-r bg-gradient-to-b from-white to-[#f1f1f1] dark:from-[#111111] dark:to-[#0a0a0a] border-[rgba(0,0,0,0.1)] dark:border-dark-border ${compact ? "w-[94px]" : "w-[270px]"}`
        }`}
      >
        <div className="flex h-full flex-col overflow-hidden">
        <div className={`flex min-h-[70px] items-center gap-2 border-b px-[18px] border-[rgba(0,0,0,0.1)] dark:border-dark-border ${compact ? "justify-center" : "justify-between"}`}>
          <div className="flex cursor-pointer items-center gap-3 overflow-hidden whitespace-nowrap" onClick={() => navigate("/")}>
            {!compact && (
              <span className="text-[18px] font-extrabold tracking-[2px] text-[#1a1a1a] dark:text-[#f5f5f5]">
                KHMER <b className="font-extrabold text-brand">CINEMA</b>
              </span>
            )}
          </div>
          {!compact && (
            <div className="flex shrink-0 gap-1.5">
              {!isMobile && (
                <button
                  className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border text-[14px] text-muted transition-all duration-200 dark:bg-[rgba(255,255,255,0.03)] dark:border-dark-border bg-[rgba(0,0,0,0.03)] border-[rgba(0,0,0,0.1)] hover:border-[rgba(229,9,20,0.3)] hover:bg-[rgba(229,9,20,0.1)] hover:text-brand"
                  onClick={toggleCollapse}
                  title={t("admin.collapseSidebar")}
                >
                  «
                </button>
              )}
              {isMobile && (
                <button
                  className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border text-[14px] text-muted transition-all duration-200 dark:bg-[rgba(255,255,255,0.03)] dark:border-dark-border bg-[rgba(0,0,0,0.03)] border-[rgba(0,0,0,0.1)] hover:border-[rgba(229,9,20,0.3)] hover:bg-[rgba(229,9,20,0.1)] hover:text-brand"
                  onClick={() => setSidebarOpen(false)}
                  title={t("admin.closeSidebar")}
                >
                  ✕
                </button>
              )}
            </div>
          )}
          {compact && (
            <button
              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border text-[14px] text-muted transition-all duration-200 dark:bg-[rgba(255,255,255,0.03)] dark:border-dark-border bg-[rgba(0,0,0,0.03)] border-[rgba(0,0,0,0.1)] hover:border-[rgba(229,9,20,0.3)] hover:bg-[rgba(229,9,20,0.1)] hover:text-brand"
              onClick={toggleCollapse}
              title={t("admin.expandSidebar")}
            >
              »
            </button>
          )}
        </div>

        <nav className={`flex flex-1 min-h-0 flex-col gap-1.5 px-2.5 py-4 overflow-y-auto overflow-x-hidden ${compact ? "items-center" : ""}`}>
          {adminNavSections.map((section) => (
            <div key={section.label} className="mb-3">
              <div className={`flex items-center gap-2 px-3 pb-2 pt-1.5 text-[11px] font-bold uppercase tracking-[1.2px] text-muted ${compact ? "justify-center !px-0 !py-2" : ""}`}>
                  {compact ? (
                    <span className="h-px w-8 bg-black/10 dark:bg-white/10" />
                  ) : (
                    <span className="text-muted">{t(section.labelKey || section.label)}</span>
                  )}
                </div>
              {section.items.map((item) => {
                const isActive =
                  activePath === item.path ||
                  (item.children && item.children.some((c) => activePath === c.path));
                const isExpanded = expandedMenus[item.name];

                return (
                  <div key={item.name} className="mb-0.5 flex flex-col">
                    <button
                      className={`group relative flex w-full cursor-pointer items-center whitespace-nowrap rounded-[10px] px-3.5 py-[11px] text-left text-[14px] font-medium transition-all duration-200 ${
                        compact ? "justify-center !gap-0 !px-0 py-3" : "gap-3.5"
                      } ${
                        isActive
                          ? compact
                            ? "font-semibold text-brand"
                            : "bg-gradient-to-br from-[rgba(229,9,20,0.15)] to-[rgba(229,9,20,0.05)] font-semibold text-brand before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-[3px] before:rounded-r before:bg-brand"
                          : compact
                            ? "text-muted hover:text-[#1a1a1a] dark:hover:text-[#f5f5f5]"
                            : "text-muted hover:bg-black/5 hover:text-[#1a1a1a] dark:hover:bg-white/5 dark:hover:text-[#f5f5f5]"
                      }`}
                      title={compact ? t(item.nameKey || item.name) : undefined}
                      onClick={() => {
                        if (item.children) {
                          toggleMenu(item.name);
                        } else {
                          handleNav(item.path);
                        }
                      }}
                    >
                      <span
                        className={`shrink-0 ${
                          compact
                            ? `flex h-10 w-10 items-center justify-center rounded-lg border transition-all duration-200 ${
                                isActive
                                  ? "border-brand/50 text-brand"
                                  : "border-transparent text-current group-hover:border-brand/40 group-hover:text-brand group-hover:bg-black/5 dark:group-hover:bg-white/10"
                              }`
                            : "flex w-[26px] justify-center"
                        }`}
                      >
                        <item.icon size={22} strokeWidth={2} />
                      </span>
                      {!compact && <span className="flex-1">{t(item.nameKey || item.name)}</span>}
                      {!compact && item.children && (
                        <span className={`inline-block text-[16px] font-bold text-muted transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}>
                          ›
                        </span>
                      )}
                    </button>

                    {item.children && (
                      <div
                        className={`grid overflow-hidden transition-[grid-template-rows] duration-[250ms] ease-in-out grid-rows-[var(--sub-rows)] ${compact ? "hidden" : ""}`}
                        style={{ "--sub-rows": isExpanded ? "1fr" : "0fr" }}
                      >
                        <div className="flex min-h-0 flex-col gap-[3px] py-1 pl-9 pr-2">
                          {item.children.map((child) => (
                            <button
                              key={child.path}
                              className={`flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-medium transition-all duration-150 ${
                                activePath === child.path
                                  ? "bg-[rgba(229,9,20,0.08)] font-semibold text-brand"
                                  : "text-muted hover:bg-black/5 hover:text-[#1a1a1a] dark:hover:bg-white/5 dark:hover:text-[#f5f5f5]"
                              }`}
                              onClick={() => handleNav(child.path)}
                            >
                              <span className={`h-1 w-1 rounded-full bg-current ${activePath === child.path ? "opacity-100" : "opacity-50"}`}></span>
                              {t(child.nameKey || child.name)}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="relative border-t border-[rgba(0,0,0,0.1)] p-3.5 dark:border-dark-border">
          <div
            className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors duration-200 bg-[rgba(0,0,0,0.03)] dark:bg-[rgba(255,255,255,0.03)] border-[rgba(0,0,0,0.1)] dark:border-dark-border hover:border-[rgba(229,9,20,0.3)] ${compact ? "justify-center" : ""}`}
            onClick={() => setProfileOpen((p) => !p)}
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
                <span className="truncate text-[13px] font-semibold text-[#1a1a1a] dark:text-[#f5f5f5]">{user?.name || t("admin.adminUser")}</span>
                <span className="truncate text-[11px] text-muted">{user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : t("admin.administrator")}</span>
              </div>
            )}
            {!compact && (
              <span className={`shrink-0 text-[14px] text-muted transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`}>▾</span>
            )}
          </div>

          {!compact && profileOpen && (
            <div className="absolute bottom-full left-3.5 right-3.5 z-10 mb-2 flex flex-col gap-0.5 rounded-xl border border-[var(--app-edge2)] bg-[var(--app-panel2)] p-1.5 shadow-[0_-8px_24px_rgba(0,0,0,0.5)]">
              <button className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[13px] font-semibold text-[var(--app-ink2)] transition-colors duration-150 hover:bg-white/5 hover:text-white" onClick={() => navigate("/admin/profile")}>
                <CircleUser size={16} /> {t("admin.myProfile")}
              </button>
              <button className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[13px] font-semibold text-[var(--app-ink2)] transition-colors duration-150 hover:bg-brand/10 hover:text-brand" onClick={handleLogout}>
                <LogOut size={16} /> {t("common.logout")}
              </button>
            </div>
          )}

          <button
            className={`mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] border py-2.5 text-[13px] font-semibold text-muted transition-all duration-200 bg-transparent dark:border-dark-border border-[rgba(0,0,0,0.1)] hover:border-[rgba(229,9,20,0.3)] hover:bg-[rgba(229,9,20,0.1)] hover:text-brand ${compact ? "px-3" : ""}`}
            onClick={handleLogout}
            title={t("common.logout")}
          >
            <LogOut size={16} />
            {!compact && <span>{t("common.logout")}</span>}
          </button>
        </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
        {/* Top Header */}
        <header className="z-[50] flex h-[70px] shrink-0 items-center justify-between border-b px-7 backdrop-blur-[12px] bg-[rgba(255,255,255,0.85)] dark:bg-[var(--app-header)] border-[rgba(0,0,0,0.1)] dark:border-dark-border transition-colors duration-300">
          <div className="flex items-center gap-2">
            <button className={btnBase} onClick={toggleSidebar} title={t(isMobile ? "admin.openSidebar" : compact ? "admin.expandSidebar" : "admin.collapseSidebar")}>
              <PanelLeft size={18} />
            </button>
            <div className="flex items-center gap-2 text-[14px]">
              <span className="hidden text-muted"><House size={14} className="inline" /></span>
              <span className="font-semibold text-[#1a1a1a] dark:text-[#f5f5f5]">
                {(() => {
                  const active = adminNavSections
                    .flatMap((s) => s.items)
                    .flatMap((item) => [item, ...(item.children || [])])
                    .find((i) => i.path === activePath);
                  return t(active?.nameKey || active?.name || "admin.dashboard");
                })()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <LangSwitch size="sm" />
            {/* Theme switcher toggle button */}
            <button className={btnBase} onClick={toggleTheme} title={t("admin.toggleTheme")}>
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div onClick={() => handleNav("/admin/profile")} className="ml-1.5 flex cursor-pointer items-center gap-2.5 rounded-[10px] border px-3 py-1.5 transition-colors duration-200 bg-[rgba(0,0,0,0.03)] dark:bg-[rgba(255,255,255,0.03)] border-[rgba(0,0,0,0.1)] dark:border-dark-border hover:bg-black/5 dark:hover:bg-white/5" title={t("admin.myProfile")}>
              <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-lg bg-brand/10 text-[11px] font-bold text-brand">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user?.name} className="h-full w-full object-cover" />
                ) : (
                  <CircleUser size={18} />
                )}
              </span>
              <span className="max-md:hidden text-[13px] font-semibold">{user?.name || t("admin.adminUser")}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 min-h-0 overflow-y-auto p-7">
          {children || (
            <div className="flex min-h-[450px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed p-10 text-center bg-white border-[rgba(0,0,0,0.1)] dark:bg-dark-card dark:border-dark-border">
              <div className="mb-1 text-brand"><Clapperboard size={48} /></div>
              <h2 className="text-[22px] font-semibold text-[#1a1a1a] dark:text-[#f5f5f5]">{t("admin.welcomePlaceholder")}</h2>
              <p className="max-w-[400px] text-[14px] leading-[1.5] text-muted">
                {t("admin.placeholderText")}
              </p>
            </div>
          )}
        </main>

        <AdminFooter />
      </div>
    </div>
  );
}