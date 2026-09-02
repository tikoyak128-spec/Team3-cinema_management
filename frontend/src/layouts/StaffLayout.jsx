import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ChartColumn,
  CircleCheck,
  Clapperboard,
  LogOut,
  Search,
  Shield,
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

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) =>
    location.pathname === path ||
    (path !== "/staff/dashboard" && location.pathname.startsWith(path));

  return (
    <div style={styles.container}>
      <style>{css}</style>

      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.brandLogo} onClick={() => navigate("/staff/dashboard")}>
          <span style={styles.logoIcon}><Clapperboard size={26} /></span>
          <span style={styles.logoPrimary}>KHMER <span style={{ color: "#e50914" }}>CINEMA</span></span>
        </div>

        <div style={styles.staffBadge}>
          <span style={styles.badgeIcon}><Shield size={16} /></span>
          <span style={styles.badgeText}>Staff Panel</span>
        </div>

        <nav style={styles.nav}>
          {staffSections.map((section) => (
            <div key={section.label} style={styles.navSection}>
              <div style={styles.sectionLabel}>{section.label}</div>
              {section.items.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  style={{
                    ...styles.navItem,
                    ...(isActive(item.path) ? styles.navItemActive : {}),
                  }}
                >
                  <span style={styles.navIcon}><item.icon size={18} /></span>
                  <span style={styles.navText}>{item.name}</span>
                  {item.badge && <span style={styles.navBadge}>{item.badge}</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div style={styles.staffCard}>
          <span style={styles.staffAvatar}><Shield size={18} /></span>
          <div style={styles.staffInfo}>
            <span style={styles.staffName}>{user?.name || "Staff Member"}</span>
            <span style={styles.staffRole}>Ticket Officer</span>
          </div>
        </div>

        <button onClick={handleLogout} style={styles.logoutBtn}>
          <LogOut size={16} /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main style={styles.main}>
        <header style={styles.header}>
          <h2 style={styles.headerTitle}>Staff Dashboard</h2>
          <span style={styles.headerUser}><Shield size={13} /> {user?.name || "Staff Member"}</span>
        </header>
        <div style={styles.content}>
          {children || (
            <h1 style={{ color: "#ffffff", fontSize: "24px" }}>Staff Dashboard</h1>
          )}
        </div>
      </main>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#050505",
    color: "#ffffff",
    fontFamily: "'Mulish', 'Kantumruy Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  sidebar: {
    width: "260px",
    backgroundColor: "#111111",
    borderRight: "1px solid #1f1f1f",
    display: "flex",
    flexDirection: "column",
    padding: "24px 16px",
  },
  brandLogo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "24px",
    
    paddingBottom: "20px",
    borderBottom: "1px solid #1f1f1f",
    cursor: "pointer",
  },
  logoIcon: { fontSize: "26px" },
  logoPrimary: {
    display: "block",
    fontSize: "18px",
    fontWeight: "800",
    letterSpacing: "2px",
    color: "#ffffff",
  },
  staffBadge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 14px",
    backgroundColor: "rgba(229, 9, 20, 0.1)",
    border: "1px solid rgba(229, 9, 20, 0.3)",
    borderRadius: "12px",
    marginBottom: "20px",
  },
  badgeIcon: { fontSize: "16px" },
  badgeText: { fontSize: "13px", fontWeight: "700", color: "#e50914" },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    flex: 1,
    overflowY: "auto",
  },
  navSection: { display: "flex", flexDirection: "column", gap: "4px" },
  sectionLabel: {
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "1.2px",
    color: "#8a8a8a",
    fontWeight: "700",
    padding: "4px 12px 6px",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "none",
    border: "none",
    color: "#a0a0a0",
    padding: "11px 14px",
    fontSize: "14px",
    fontWeight: "600",
    borderRadius: "12px",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.2s",
    position: "relative",
  },
  navItemActive: {
    backgroundColor: "#e50914",
    color: "#ffffff",
    boxShadow: "0 4px 14px rgba(229, 9, 20, 0.35)",
  },
  navIcon: { fontSize: "18px", width: "22px", textAlign: "center", flexShrink: 0 },
  navText: { flex: 1 },
  navBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "20px",
    height: "20px",
    padding: "0 6px",
    background: "#ffffff20",
    color: "#ffffff",
    fontSize: "11px",
    fontWeight: "700",
    borderRadius: "20px",
  },
  staffCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 12px",
    background: "#161616",
    border: "1px solid #262626",
    borderRadius: "12px",
    marginBottom: "12px",
  },
  staffAvatar: {
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(229, 9, 20, 0.12)",
    borderRadius: "50%",
    flexShrink: 0,
  },
  staffInfo: { display: "flex", flexDirection: "column", overflow: "hidden" },
  staffName: { fontSize: "13px", fontWeight: "600", color: "#f5f5f5" },
  staffRole: { fontSize: "11px", color: "#a0a0a0" },
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    background: "none",
    border: "1px solid #2a2a2a",
    color: "#a0a0a0",
    padding: "12px",
    borderRadius: "12px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  main: { flex: 1, display: "flex", flexDirection: "column", minWidth: 0 },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 30px",
    backgroundColor: "rgba(5, 5, 5, 0.85)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid #1f1f1f",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  headerTitle: { fontSize: "20px", fontWeight: "800" },
  headerUser: {
    fontSize: "13px",
    color: "#e50914",
    background: "rgba(229, 9, 20, 0.1)",
    border: "1px solid rgba(229, 9, 20, 0.3)",
    padding: "6px 14px",
    borderRadius: "20px",
    fontWeight: "700",
  },
  content: { flex: 1, padding: "30px", overflowY: "auto" },
};

const css = `
  .staff-layout-logoutbutton { cursor: pointer; }
  @media (max-width: 768px) {
    .sidebar { width: 220px; }
  }
`;
