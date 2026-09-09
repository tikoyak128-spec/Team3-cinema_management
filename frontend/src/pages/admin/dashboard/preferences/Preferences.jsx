import { useState } from "react";
import { Bell, Lock, Moon, Palette, Shield, Sun } from "lucide-react";
import { usePrefs } from "../../../../context/PrefsContext";
import "../admin.css";

const NOTIF_DEFAULTS = {
  newBooking: true,
  checkIn: true,
  lowSeats: false,
  dailyReport: true,
};

export default function Preferences() {
  const { prefs, setTheme, setLanguage, updatePrefs, resetPrefs, t } = usePrefs();
  const [saved, setSaved] = useState(false);

  const notifications = prefs.notifications || NOTIF_DEFAULTS;

  const toggleNotification = (key) =>
    updatePrefs({
      notifications: { ...NOTIF_DEFAULTS, ...notifications, [key]: !notifications[key] },
    });

  const handleSave = () => {
    updatePrefs({});
    setSaved(true);
    document.documentElement.classList.toggle("dark", prefs.theme === "dark");
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    resetPrefs();
    updatePrefs({ notifications: { ...NOTIF_DEFAULTS } });
  };

  const notifRows = [
    ["newBooking", t("prefs.newBooking"), t("prefs.newBookingDesc")],
    ["checkIn", t("prefs.checkIn"), t("prefs.checkInDesc")],
    ["lowSeats", t("prefs.lowSeats"), t("prefs.lowSeatsDesc")],
    ["dailyReport", t("prefs.dailyReport"), t("prefs.dailyReportDesc")],
  ];

  return (
    <div className="kc-page">
      <div className="kc-head">
        <div>
          <h1>{t("prefs.title")}</h1>
          <p className="kc-subtitle">{t("prefs.subtitle")}</p>
        </div>
      </div>

      <div className="kc-form-card">
        {/* Appearance */}
        <section style={styles.section}>
          <div style={styles.sectionTitle}>
            <Palette size={18} />
            <span>{t("prefs.appearance")}</span>
          </div>
          <div style={styles.fieldRow}>
            <div style={styles.fieldLabel}>
              <strong>{t("prefs.theme")}</strong>
              <span style={styles.hint}>{t("prefs.themeHint")}</span>
            </div>
            <div style={styles.segmented}>
              <button
                type="button"
                style={prefs.theme === "dark" ? styles.segActive : styles.seg}
                onClick={() => setTheme("dark")}
              >
                <Moon size={16} /> {t("prefs.dark")}
              </button>
              <button
                type="button"
                style={prefs.theme === "light" ? styles.segActive : styles.seg}
                onClick={() => setTheme("light")}
              >
                <Sun size={16} /> {t("prefs.light")}
              </button>
            </div>
          </div>
          <div style={styles.fieldRow}>
            <div style={styles.fieldLabel}>
              <strong>{t("prefs.language")}</strong>
              <span style={styles.hint}>{t("prefs.languageHint")}</span>
            </div>
            <select
              className="kc-select-lg"
              style={styles.select}
              value={prefs.language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="en">{t("prefs.english")}</option>
              <option value="km">{t("prefs.khmer")}</option>
            </select>
          </div>
        </section>

        {/* Notifications */}
        <section style={styles.section}>
          <div style={styles.sectionTitle}>
            <Bell size={18} />
            <span>{t("prefs.notifications")}</span>
          </div>
          {notifRows.map(([key, title, desc]) => (
            <div style={styles.fieldRow} key={key}>
              <div style={styles.fieldLabel}>
                <strong>{title}</strong>
                <span style={styles.hint}>{desc}</span>
              </div>
              <label className="kc-checkbox">
                <input
                  type="checkbox"
                  checked={notifications[key]}
                  onChange={() => toggleNotification(key)}
                />
                <span style={styles.switchText}>{notifications[key] ? t("common.on") : t("common.off")}</span>
              </label>
            </div>
          ))}
        </section>

        {/* Security */}
        <section style={styles.section}>
          <div style={styles.sectionTitle}>
            <Shield size={18} />
            <span>{t("prefs.security")}</span>
          </div>
          <div style={styles.fieldRow}>
            <div style={styles.fieldLabel}>
              <strong>{t("prefs.changePassword")}</strong>
              <span style={styles.hint}>{t("prefs.changePasswordDesc")}</span>
            </div>
            <div style={styles.action} onClick={() => setSaved(true)}>
              <Lock size={15} /> {t("prefs.password")}
            </div>
          </div>
        </section>

        {saved && <div style={styles.savedToast}>{t("prefs.savedToast")}</div>}

        <div className="kc-form-actions">
          <button type="button" className="kc-btn kc-btn-primary" onClick={handleSave}>
            {t("common.save")}
          </button>
          <button type="button" className="kc-btn kc-btn-ghost" onClick={handleReset}>
            {t("prefs.resetToDefaults")}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  section: {
    padding: "22px 0",
    borderBottom: "1px solid var(--border-color, #222)",
  },
  sectionTitle: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "15px",
    fontWeight: 700,
    color: "var(--text-main, #e0e0e0)",
    marginBottom: "16px",
  },
  fieldRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    padding: "12px 0",
  },
  fieldLabel: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    fontSize: "14px",
    color: "var(--text-heading, #f0f0f0)",
  },
  hint: {
    fontSize: "12px",
    color: "var(--text-faint, #707070)",
  },
  segmented: {
    display: "flex",
    gap: "8px",
    flexShrink: 0,
  },
  seg: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "transparent",
    border: "1px solid var(--border-color, #2a2a2a)",
    color: "var(--text-muted, #a0a0a0)",
    padding: "8px 14px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 600,
  },
  segActive: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "rgba(229,9,20,0.15)",
    color: "#e50914",
    padding: "8px 14px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 700,
  },
  select: { width: "200px", flexShrink: 0 },
  switchText: { fontSize: "13px", color: "var(--text-muted, #a0a0a0)", fontWeight: 600 },
  action: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "var(--hover-bg, rgba(255,255,255,0.05))",
    border: "1px solid var(--border-color, #2a2a2a)",
    color: "var(--text-main, #e0e0e0)",
    padding: "8px 14px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 600,
    flexShrink: 0,
  },
  savedToast: {
    backgroundColor: "rgba(34,197,94,0.14)",
    border: "1px solid rgba(34,197,94,0.4)",
    color: "#22c55e",
    fontSize: "13px",
    padding: "10px 14px",
    borderRadius: "10px",
    marginBottom: "16px",
    textAlign: "center",
    fontWeight: 600,
  },
}