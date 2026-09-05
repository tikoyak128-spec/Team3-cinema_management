import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Pencil, Phone, Search, Shield, Trash2, UserPlus, Users } from "lucide-react";
import api from "../../../../api/client";
import { usePrefs } from "../../../../context/PrefsContext";
import "../admin.css";

const ROLE_KEYS = { admin: "users.admins", staff: "users.staff", customer: "users.customers" };
const ROLE_BADGES = { admin: "kc-badge-red", staff: "kc-badge-yellow", customer: "kc-badge-green" };

export default function UsersList() {
  const navigate = useNavigate();
  const { t } = usePrefs();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [confirmId, setConfirmId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { data } = await api.get("/users");
        if (!cancelled) setUsers(data);
      } catch (err) {
        if (!cancelled) setError(err?.response?.data?.message || t("users.failedLoad"));
      }
      if (!cancelled) setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [t]);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setConfirmId(null);
    } catch (err) {
      setError(err?.response?.data?.message || t("users.failedDelete"));
    }
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch =
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.phone || "").toLowerCase().includes(q);
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="kc-page">
      <div className="kc-head">
        <div>
          <h1>{t("users.user")}</h1>
          <p className="kc-subtitle">{t("users.subtitle")}</p>
        </div>
        <div className="kc-actions">
          <button className="kc-btn kc-btn-primary" onClick={() => navigate("/admin/users/create")}>
            <UserPlus size={16} /> {t("users.addUser")}
          </button>
        </div>
      </div>

      {error && (
        <div className="kc-error-banner" style={styles.banner}>
          {error}
          <button onClick={() => { setError(""); }} style={styles.bannerClose}>×</button>
        </div>
      )}

      <div className="kc-toolbar">
        <div className="kc-search">
          <span><Search size={16} /></span>
          <input placeholder={t("users.searchPlaceholder")} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="kc-filters">
          <select className="kc-select-lg" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="all">{t("users.allRoles")}</option>
            <option value="admin">{t("users.admins")}</option>
            <option value="staff">{t("users.staff")}</option>
            <option value="customer">{t("users.customers")}</option>
          </select>
        </div>
      </div>

      <div className="kc-stats">
        <div className="kc-stat">
          <div className="kc-stat-icon"><Users size={22} /></div>
          <div className="kc-stat-label">{t("users.totalUsers")}</div>
          <div className="kc-stat-value">{users.length}</div>
        </div>
        <div className="kc-stat">
          <div className="kc-stat-icon"><Shield size={22} /></div>
          <div className="kc-stat-label">{t("users.admins")}</div>
          <div className="kc-stat-value">{users.filter((u) => u.role === "admin").length}</div>
        </div>
        <div className="kc-stat">
          <div className="kc-stat-icon"><Shield size={22} /></div>
          <div className="kc-stat-label">{t("users.staff")}</div>
          <div className="kc-stat-value">{users.filter((u) => u.role === "staff").length}</div>
        </div>
        <div className="kc-stat">
          <div className="kc-stat-icon"><Users size={22} /></div>
          <div className="kc-stat-label">{t("users.customers")}</div>
          <div className="kc-stat-value">{users.filter((u) => u.role === "customer").length}</div>
        </div>
      </div>

      <div className="kc-card">
        {loading ? (
          <div className="kc-empty" style={{ padding: "40px" }}>
            <p>{t("users.loading")}</p>
          </div>
        ) : (
          <div className="kc-table-wrap">
            <table className="kc-table">
              <thead>
                <tr>
                  <th>{t("users.user")}</th>
                  <th>{t("users.contact")}</th>
                  <th>{t("users.role")}</th>
                  <th>{t("users.bookings")}</th>
                  <th>{t("users.provider")}</th>
                  <th>{t("users.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="kc-cell-user">
                        <div className="kc-avatar">{u.avatar ? <img src={u.avatar} alt="" style={styles.avatarImg} /> : (u.name || "?").charAt(0).toUpperCase()}</div>
                        <div>
                          <div className="kc-cell-main">{u.name}</div>
                          <div className="kc-cell-sub">ID #{u.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="kc-detail">
                        <Mail size={12} /> {u.email}
                        {u.phone && <span style={styles.phone}><Phone size={12} /> {u.phone}</span>}
                      </div>
                    </td>
                    <td>
                      <span className={`kc-badge ${ROLE_BADGES[u.role] || "kc-badge-gray"}`}>
                        {t(ROLE_KEYS[u.role] || "common.user")}
                      </span>
                    </td>
                    <td>{u.bookings_count ?? 0}</td>
                    <td>
                      <span className="kc-cell-sub">
                        {u.auth_provider === "google" ? t("users.google") : t("users.email")}
                      </span>
                    </td>
                    <td>
                      <div className="kc-actions-cell">
                        <button className="kc-icon-btn edit" title={t("common.edit")} onClick={() => navigate(`/admin/users/${u.id}/edit`)}>
                          <Pencil size={16} />
                        </button>
                        {confirmId === u.id ? (
                          <div className="kc-actions-cell">
                            <button className="kc-btn kc-btn-danger kc-btn-sm" onClick={() => handleDelete(u.id)}>{t("common.confirm")}</button>
                            <button className="kc-btn kc-btn-ghost kc-btn-sm" onClick={() => setConfirmId(null)}>{t("common.cancel")}</button>
                          </div>
                        ) : (
                          <button className="kc-icon-btn delete" title={t("common.delete")} onClick={() => setConfirmId(u.id)}>
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6}>
                      <div className="kc-empty">
                        <div className="kc-empty-icon"><Users size={32} /></div>
                        <p>{t("users.noUsers")}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  banner: {
    backgroundColor: "rgba(229,9,20,0.12)",
    border: "1px solid rgba(229,9,20,0.4)",
    color: "#ff6b6b",
    fontSize: "13px",
    padding: "10px 14px",
    borderRadius: "10px",
    marginBottom: "16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bannerClose: {
    background: "none",
    border: "none",
    color: "#ff6b6b",
    fontSize: "18px",
    cursor: "pointer",
    lineHeight: "1",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "50%",
  },
  phone: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    color: "var(--text-muted, #a0a0a0)",
    marginLeft: "8px",
  },
}