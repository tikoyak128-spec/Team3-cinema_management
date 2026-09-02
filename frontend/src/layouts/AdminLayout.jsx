import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Armchair,
  Bell,
  Building2,
  ChartColumn,
  CircleUser,
  Clapperboard,
  ClipboardList,
  Clock,
  Compass,
  DoorOpen,
  FolderOpen,
  House,
  LogOut,
  Moon,
  Palette,
  PanelLeft,
  Settings,
  Sun,
  Tag,
  Ticket,
  TrendingUp,
  Users,
  Wrench,
} from "lucide-react";

const navSections = [
  {
    label: "Overview",
    icon: Compass,
    items: [
      { name: "Dashboard", icon: ChartColumn, path: "/admin/dashboard", badge: "5" },
      { name: "Analytics", icon: TrendingUp, path: "/admin/analytics" },
    ],
  },
  {
    label: "Management",
    icon: FolderOpen,
    items: [
      { 
        name: "Movies", 
        icon: Clapperboard, 
        path: "/admin/movies", 
        badge: "12",
        children: [
          { name: "All Movies", path: "/admin/movies" },
          { name: "Add Movie", path: "/admin/movies/create" },
        ]
      },
      { 
        name: "Cinemas", 
        icon: Building2, 
        path: "/admin/cinemas", 
        children: [
          { name: "All Cinemas", path: "/admin/cinemas" },
          { name: "Add Cinema", path: "/admin/cinemas/create" },
        ]
      },
      { 
        name: "Rooms", 
        icon: DoorOpen, 
        path: "/admin/rooms", 
        badge: "4",
        children: [
          { name: "All Rooms", path: "/admin/rooms" },
          { name: "Add Room", path: "/admin/rooms/create" },
        ]
      },
      { 
        name: "Seats", 
        icon: Armchair, 
        path: "/admin/seats", 
        children: [
          { name: "All Seats", path: "/admin/seats" },
          { name: "Add Seat", path: "/admin/seats/create" },
        ]
      },
      { 
        name: "Showtimes", 
        icon: Clock, 
        path: "/admin/showtimes", 
        children: [
          { name: "All Showtimes", path: "/admin/showtimes" },
          { name: "Add Showtime", path: "/admin/showtimes/create" },
        ]
      },
      { 
        name: "Categories", 
        icon: Tag, 
        path: "/admin/categories", 
        children: [
          { name: "All Categories", path: "/admin/categories" },
          { name: "Add Category", path: "/admin/categories/create" },
        ]
      },
    ],
  },
  {
    label: "Operations",
    icon: Settings,
    items: [
      { name: "Bookings", icon: Ticket, path: "/admin/bookings", badge: "3" },
      { name: "Reports", icon: ClipboardList, path: "/admin/reports" },
    ],
  },
  {
    label: "Settings",
    icon: Wrench,
    items: [
      { name: "Users", icon: Users, path: "/admin/users" },
      { name: "Preferences", icon: Palette, path: "/admin/preferences" },
    ],
  },
];

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});
  const [activePath, setActivePath] = useState(location.pathname);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    navSections.forEach((section) => {
      section.items.forEach((item) => {
        if (item.children && item.children.some((c) => c.path === activePath)) {
          setExpandedMenus((prev) => ({ ...prev, [item.name]: true }));
        }
      });
    });
  }, [activePath]);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const toggleTheme = () => setIsDarkMode((prev) => !prev);
  const toggleCollapse = () => {
    setCollapsed((prev) => !prev);
    setProfileOpen(false);
  };

  const toggleMenu = (name) => {
    setExpandedMenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleNav = (path) => {
    setActivePath(path);
    navigate(path);
    setProfileOpen(false);
    setSidebarOpen(false);
  };

  useEffect(() => {
    setActivePath(location.pathname);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className={`admin-layout ${isDarkMode ? "dark" : "light"}`}>
      <style>{styles}</style>

      {/* Overlay with background blur when sidebar is open */}
      <div className={`sidebar-overlay ${sidebarOpen ? "active" : ""}`} onClick={toggleSidebar} />

      {/* Sidebar Drawer */}
      <aside className={`sidebar ${sidebarOpen ? "open" : "closed"} ${collapsed ? "collapsed" : "expanded"}`}>
        <div className="sidebar-header">
          <div className="logo" onClick={() => navigate("/")}>
            <span className="logo-icon"><Clapperboard size={26} /></span>
            <span className="logo-text">KHMER <b>CINEMA</b></span>
          </div>
          <div className="header-btn-group">
            <button className="sidebar-toggle collapse-toggle" onClick={toggleCollapse} title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}>
              {collapsed ? "»" : "«"}
            </button>
            <button className="sidebar-toggle close-toggle" onClick={toggleSidebar} title="Close Sidebar">
              ✕
            </button>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navSections.map((section) => (
            <div key={section.label} className="nav-section">
              <div className="nav-section-label">
                <span className="section-icon"><section.icon size={15} /></span>
                <span className="section-label-text">{section.label}</span>
              </div>
              {section.items.map((item) => {
                const isActive =
                  activePath === item.path ||
                  (item.children && item.children.some((c) => activePath === c.path));
                const isExpanded = expandedMenus[item.name];

                return (
                  <div key={item.name} className="nav-item-wrapper">
                    <button
                      className={`nav-item ${isActive ? "active" : ""}`}
                      title={collapsed ? item.name : undefined}
                      onClick={() => {
                        if (item.children) {
                          toggleMenu(item.name);
                        } else {
                          handleNav(item.path);
                        }
                      }}
                    >
                      <span className="nav-icon"><item.icon size={18} /></span>
                      <span className="nav-label">{item.name}</span>
                      {item.badge && <span className="nav-badge">{item.badge}</span>}
                      {item.children && (
                        <span className={`nav-chevron ${isExpanded ? "expanded" : ""}`}>
                          ›
                        </span>
                      )}
                    </button>

                    {item.children && (
                      <div className={`nav-submenu-container ${isExpanded ? "expanded" : ""}`}>
                        <div className="nav-submenu">
                          {item.children.map((child) => (
                            <button
                              key={child.path}
                              className={`nav-subitem ${activePath === child.path ? "active" : ""}`}
                              onClick={() => handleNav(child.path)}
                            >
                              <span className="subitem-bullet"></span>
                              {child.name}
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

        <div className="sidebar-footer">
          <div className="admin-card" onClick={() => setProfileOpen((p) => !p)}>
            <span className="admin-avatar"><CircleUser size={20} /></span>
            {!collapsed && (
              <div className="admin-info">
                <span className="admin-name">{user?.name || "Admin User"}</span>
                <span className="admin-role">Administrator</span>
              </div>
            )}
            {!collapsed && (
              <span className={`admin-chevron ${profileOpen ? "up" : "down"}`}>▾</span>
            )}
          </div>

          {!collapsed && profileOpen && (
            <div className="profile-menu">
              <button className="profile-item" onClick={() => navigate("/admin/preferences")}>
                <CircleUser size={16} /> My Profile
              </button>
              <button className="profile-item" onClick={() => navigate("/admin/preferences")}>
                <Palette size={16} /> Preferences
              </button>
              <button className="profile-item danger" onClick={handleLogout}>
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}

          {!collapsed && (
            <button className="logout-btn" onClick={handleLogout} title="Logout">
              <LogOut size={16} /> Logout
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-wrapper">
        {/* Top Header */}
        <header className="top-header">
          <div className="header-left">
            <button className="menu-btn" onClick={toggleSidebar} title="Toggle Sidebar">
              <PanelLeft size={18} />
            </button>
            <div className="breadcrumb">
              
              <span className="breadcrumb-current">
                {navSections
                  .flatMap((s) => s.items)
                  .flatMap((item) => [
                    item, 
                    ...(item.children || [])
                  ])
                  .find((i) => i.path === activePath)?.name || "Dashboard"}
              </span>
            </div>
          </div>
          <div className="header-right">
            {/* Theme switcher toggle button */}
            <button className="header-btn" onClick={toggleTheme} title="Toggle Theme Background">
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="header-btn" title="Notifications">
              <Bell size={18} />
              <span className="notification-dot"></span>
            </button>
            <button className="header-btn" title="Settings"><Settings size={18} /></button>
            <div className="header-user">
              <span className="header-avatar"><CircleUser size={18} /></span>
              <span className="header-username">{user?.name || "Admin User"}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-content">
          {children || (
            <div className="placeholder-content">
              <div className="placeholder-icon"><Clapperboard size={48} /></div>
              <h2>Welcome to Cinema Management</h2>
              <p>Select an option from the sidebar navigation menu to start managing your theater system.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

const styles = `
  /* ===== THEME VARIABLES ===== */
  .admin-layout.dark {
    --bg-main: #050505;
    --bg-sidebar: linear-gradient(180deg, #111111 0%, #0a0a0a 100%);
    --bg-header: rgba(5, 5, 5, 0.85);
    --border-color: #1f1f1f;
    --border-hover: rgba(255, 255, 255, 0.12);
    --text-main: #e2e8f0;
    --text-muted: #a0a0a0;
    --text-heading: #f5f5f5;
    --card-bg: #111111;
    --card-border: #1f1f1f;
    --nav-hover: rgba(255, 255, 255, 0.05);
    --badge-bg: rgba(255, 255, 255, 0.03);
    --accent: #e50914;
  }

  .admin-layout.light {
    --bg-main: #f6f6f6;
    --bg-sidebar: linear-gradient(180deg, #ffffff 0%, #f1f1f1 100%);
    --bg-header: rgba(255, 255, 255, 0.85);
    --border-color: rgba(0, 0, 0, 0.1);
    --border-hover: rgba(0, 0, 0, 0.15);
    --text-main: #4a4a4a;
    --text-muted: #8a8a8a;
    --text-heading: #1a1a1a;
    --card-bg: #ffffff;
    --card-border: rgba(0, 0, 0, 0.1);
    --nav-hover: rgba(0, 0, 0, 0.05);
    --badge-bg: rgba(0, 0, 0, 0.03);
    --accent: #e50914;
  }

  /* ===== RESET & FULL SCREEN FIX ===== */
  html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
  }

  .admin-layout {
    margin: 0;
    padding: 0;
    width: 100vw;
    min-height: 100vh;
    font-family: 'Mulish', 'Kantumruy Pro', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
    background: var(--bg-main);
    color: var(--text-main);
    display: flex;
    box-sizing: border-box;
    overflow-x: hidden;
    transition: background 0.3s ease, color 0.3s ease;
  }

  .admin-layout * {
    box-sizing: border-box;
  }

  /* ===== SIDEBAR DRAWER ===== */
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 270px;
    background: var(--bg-sidebar);
    border-right: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    z-index: 100;
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s ease;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .sidebar.open {
    transform: translateX(0);
  }

  /* Collapsed (mini) mode */
  .sidebar.collapsed {
    width: 94px;
  }

  .sidebar.collapsed .logo-text {
    display: none;
  }

  .sidebar.collapsed .logo {
    justify-content: center;
    gap: 0;
  }

  .sidebar.collapsed .logo-icon {
    transform: scale(1.15);
  }

  .sidebar.collapsed .sidebar-nav {
    padding: 16px 10px;
    align-items: center;
  }

  .sidebar.collapsed .nav-section-label {
    text-align: center;
    padding: 8px 0;
  }

  .sidebar.collapsed .section-label-text {
    display: none;
  }

  .sidebar.collapsed .nav-item {
    justify-content: center;
    padding: 12px 0;
    gap: 0;
  }

  .sidebar.collapsed .nav-label,
  .sidebar.collapsed .nav-badge,
  .sidebar.collapsed .nav-chevron,
  .sidebar.collapsed .nav-submenu-container {
    display: none;
  }

  .sidebar.collapsed .section-icon {
    font-size: 15px;
  }

  .sidebar.collapsed .sidebar-toggle.collapse-toggle {
    margin: 0 auto;
  }

  .sidebar.collapsed .close-toggle {
    display: none;
  }

  .sidebar.collapsed .admin-chevron {
    display: none;
  }

  .sidebar.collapsed .admin-card {
    justify-content: center;
  }

  .sidebar.collapsed .logout-btn {
    font-size: 0;
    padding: 12px;
    display: flex;
    justify-content: center;
  }

  .sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 18px;
    border-bottom: 1px solid var(--border-color);
    min-height: 70px;
    gap: 8px;
  }

  .header-btn-group {
    display: flex;
    gap: 6px;
    flex-shrink: 0;
  }

  .sidebar.collapsed .sidebar-header {
    justify-content: center;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 12px;
    overflow: hidden;
    white-space: nowrap;
  }

  .logo-icon {
    font-size: 26px;
    flex-shrink: 0;
  }

  .logo-text {
    font-size: 18px;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: 2px;
    background: none;
    -webkit-background-clip: unset;
    -webkit-text-fill-color: unset;
  }

  .logo-text b {
    color: var(--accent);
    font-weight: 800;
  }

  .sidebar-toggle {
    background: var(--badge-bg);
    border: 1px solid var(--border-color);
    color: var(--text-muted);
    width: 32px;
    height: 32px;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    transition: all 0.2s ease;
    flex-shrink: 0;
  }

  .sidebar-toggle:hover {
    background: rgba(229, 9, 20, 0.1);
    color: var(--accent);
    border-color: rgba(229, 9, 20, 0.3);
  }

  /* ===== NAVIGATION ===== */
  .sidebar-nav {
    flex: 1;
    padding: 16px 10px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .nav-section {
    margin-bottom: 12px;
  }

  .nav-section-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    color: var(--text-muted);
    padding: 6px 12px 8px;
    font-weight: 700;
  }

  .section-icon {
    font-size: 13px;
    opacity: 0.8;
  }

  .nav-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    background: var(--accent);
    color: #ffffff;
    font-size: 11px;
    font-weight: 700;
    border-radius: 20px;
    flex-shrink: 0;
  }

  .nav-item-wrapper {
    display: flex;
    flex-direction: column;
    margin-bottom: 2px;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 11px 14px;
    border: none;
    background: transparent;
    color: var(--text-muted);
    font-size: 14px;
    font-weight: 500;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    width: 100%;
    text-align: left;
    position: relative;
  }

  .nav-item:hover {
    background: var(--nav-hover);
    color: var(--text-heading);
  }

  .nav-item.active {
    background: linear-gradient(135deg, rgba(229, 9, 20, 0.15), rgba(229, 9, 20, 0.05));
    color: var(--accent);
    font-weight: 600;
  }

  .nav-item.active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 6px;
    bottom: 6px;
    width: 3px;
    background: var(--accent);
    border-radius: 0 4px 4px 0;
  }

  .nav-icon {
    font-size: 18px;
    flex-shrink: 0;
    width: 22px;
    text-align: center;
  }

  .nav-label {
    flex: 1;
  }

  .nav-chevron {
    font-size: 16px;
    font-weight: bold;
    color: var(--text-muted);
    transition: transform 0.25s ease;
    display: inline-block;
    transform: rotate(0deg);
  }

  .nav-chevron.expanded {
    transform: rotate(90deg);
  }

  .nav-submenu-container {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 0.25s ease-in-out;
    overflow: hidden;
  }

  .nav-submenu-container.expanded {
    grid-template-rows: 1fr;
  }

  .nav-submenu {
    min-height: 0;
    padding-left: 36px;
    padding-right: 8px;
    padding-top: 4px;
    padding-bottom: 4px;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .nav-subitem {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    border: none;
    background: transparent;
    color: var(--text-muted);
    font-size: 13px;
    font-weight: 500;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s ease;
    text-align: left;
    width: 100%;
  }

  .subitem-bullet {
    width: 4px;
    height: 4px;
    background: currentColor;
    border-radius: 50%;
    opacity: 0.5;
  }

  .nav-subitem:hover {
    background: var(--nav-hover);
    color: var(--text-heading);
  }

  .nav-subitem.active {
    color: var(--accent);
    font-weight: 600;
    background: rgba(229, 9, 20, 0.08);
  }

  .nav-subitem.active .subitem-bullet {
    opacity: 1;
  }

  /* ===== SIDEBAR FOOTER ===== */
  .sidebar-footer {
    position: relative;
    border-top: 1px solid var(--border-color);
    padding: 14px;
  }

  .admin-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    background: var(--badge-bg);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s;
  }

  .admin-card:hover {
    background: var(--nav-hover);
    border-color: rgba(229, 9, 20, 0.3);
  }

  .admin-avatar {
    font-size: 20px;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(229, 9, 20, 0.12);
    border-radius: 50%;
    flex-shrink: 0;
  }

  .admin-name {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-heading);
  }

  .admin-role {
    font-size: 11px;
    color: var(--text-muted);
  }

  .admin-info {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    flex: 1;
  }

  .admin-chevron {
    font-size: 14px;
    color: var(--text-muted);
    transition: transform 0.2s;
    flex-shrink: 0;
  }

  .admin-chevron.up {
    transform: rotate(180deg);
  }

  .profile-menu {
    position: absolute;
    bottom: 100%;
    left: 14px;
    right: 14px;
    background: #161616;
    border: 1px solid #262626;
    border-radius: 12px;
    padding: 6px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.5);
    z-index: 10;
    margin-bottom: 8px;
  }

  .profile-item {
    display: flex;
    align-items: center;
    gap: 10px;
    background: none;
    border: none;
    color: #d0d0d0;
    padding: 10px 12px;
    font-size: 13px;
    font-weight: 600;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.15s;
    text-align: left;
  }

  .profile-item:hover {
    background: rgba(255, 255, 255, 0.06);
    color: #ffffff;
  }

  .profile-item.danger:hover {
    background: rgba(229, 9, 20, 0.12);
    color: var(--accent);
  }

  .logout-btn {
    display: block;
    width: 100%;
    margin-top: 12px;
    padding: 10px;
    background: none;
    border: 1px solid var(--border-color);
    color: var(--text-muted);
    font-size: 13px;
    font-weight: 600;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .logout-btn:hover {
    background: rgba(229, 9, 20, 0.1);
    color: var(--accent);
    border-color: rgba(229, 9, 20, 0.3);
  }

  /* ===== MAIN WRAPPER ===== */
  .main-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    width: 100%;
  }

  /* ===== TOP HEADER ===== */
  .top-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 28px;
    height: 70px;
    background: var(--bg-header);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border-color);
    position: sticky;
    top: 0;
    z-index: 50;
    transition: background 0.3s ease, border-color 0.3s ease;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .menu-btn {
    display: flex;
    background: var(--badge-bg);
    border: 1px solid var(--border-color);
    color: var(--text-muted);
    font-size: 15px;
    width: 38px;
    height: 38px;
    border-radius: 10px;
    cursor: pointer;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .menu-btn:hover {
    background: rgba(229, 9, 20, 0.1);
    color: var(--accent);
    border-color: rgba(229, 9, 20, 0.3);
  }

  .breadcrumb {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
  }

  .breadcrumb-home {
    display: flex;
    align-items: center;
  }

  .breadcrumb-current {
    color: var(--text-heading);
    font-weight: 600;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .header-btn {
    position: relative;
    background: var(--badge-bg);
    border: 1px solid var(--border-color);
    color: var(--text-muted);
    font-size: 16px;
    width: 38px;
    height: 38px;
    border-radius: 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .header-btn:hover {
    background: var(--nav-hover);
    color: var(--text-heading);
  }

  .notification-dot {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 7px;
    height: 7px;
    background: var(--accent);
    border-radius: 50%;
    border: 2px solid var(--bg-main);
  }

  .header-user {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 12px;
    background: var(--badge-bg);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    cursor: pointer;
    transition: background 0.2s ease;
    margin-left: 6px;
  }

  .header-user:hover {
    background: var(--nav-hover);
  }

  .header-avatar {
    font-size: 16px;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(229, 9, 20, 0.12);
    border-radius: 50%;
  }

  .header-username {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-main);
  }

  /* ===== PAGE CONTENT ===== */
  .page-content {
    flex: 1;
    padding: 28px;
    background: var(--bg-main);
    transition: background 0.3s ease;
  }

  .placeholder-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 450px;
    text-align: center;
    gap: 12px;
    background: var(--card-bg);
    border: 1px dashed var(--card-border);
    border-radius: 16px;
    padding: 40px;
    transition: background 0.3s ease, border-color 0.3s ease;
  }

  .placeholder-icon {
    font-size: 48px;
    margin-bottom: 4px;
  }

  .placeholder-content h2 {
    font-size: 22px;
    color: var(--text-heading);
    font-weight: 600;
  }

  .placeholder-content p {
    color: var(--text-muted);
    font-size: 14px;
    max-width: 400px;
    line-height: 1.5;
  }

  /* ===== BACKDROP BLUR OVERLAY ===== */
  .sidebar-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    z-index: 90;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
  }

  .sidebar-overlay.active {
    opacity: 1;
    pointer-events: auto;
  }

  /* ===== SCROLLBAR ===== */
  .sidebar::-webkit-scrollbar {
    width: 4px;
  }

  .sidebar::-webkit-scrollbar-track {
    background: transparent;
  }

  .sidebar::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 4px;
  }

  /* ===== RESPONSIVE ===== */
  @media (max-width: 768px) {
    .header-username {
      display: none;
    }
  }
`;