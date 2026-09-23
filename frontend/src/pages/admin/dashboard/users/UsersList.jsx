import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Pencil, Phone, RefreshCw, Search, Shield, Trash2, UserPlus, Users } from "lucide-react";
import api from "../../../../api/client";
import Select from "../../../../components/Select";
import { usePrefs } from "../../../../context/PrefsContext";

const ROLE_KEYS = { admin: "users.admins", staff: "users.staff", customer: "users.customers" };
const ROLE_BADGES = { admin: "bg-[rgba(229,9,20,0.14)] text-[#e50914] border border-[rgba(229,9,20,0.3)]", staff: "bg-[rgba(234,179,8,0.14)] text-[#eab308] border border-[rgba(234,179,8,0.3)]", customer: "bg-[rgba(22,163,74,0.14)] text-[#22c55e] border border-[rgba(34,197,94,0.3)]" };

export default function UsersList() {
  const navigate = useNavigate();
  const { t } = usePrefs();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [confirmId, setConfirmId] = useState(null);

  const load = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const { data } = await api.get("/users");
      setError("");
      setUsers(data);
    } catch (err) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        setError(err?.response?.data?.message || "Your session may have expired. Please sign in again.");
      } else {
        setError(err?.response?.data?.message || t("users.failedLoad"));
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const { data } = await api.get("/users");
        if (!cancelled) { setError(""); setUsers(data); }
      } catch (err) {
        if (!cancelled) setError(err?.response?.data?.message || t("users.failedLoad"));
      }
      if (!cancelled) setLoading(false);
    };
    run();
    return () => { cancelled = true; };
  }, [t]);

  useEffect(() => {
    const onFocus = () => document.visibilityState === "visible" && load({ silent: true });
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const deleteButtons = (u) => (
    <div className="flex gap-2 items-center">
      <button className="bg-[var(--app-panel)] border border-[var(--app-edge2)] text-[var(--app-ink2)] w-[34px] h-[34px] rounded-[10px] cursor-pointer flex items-center justify-center text-[15px] transition-all duration-200 hover:bg-[var(--app-fill)] hover:text-[var(--app-ink)] [&.edit:hover]:bg-[rgba(229,9,20,0.15)] [&.edit:hover]:text-[#e50914] [&.edit:hover]:border-[rgba(229,9,20,0.3)]" title={t("common.edit")} onClick={() => navigate(`/admin/users/${u.id}/edit`)}><Pencil size={16} /></button>
      {confirmId === u.id ? (
        <div className="flex gap-2 items-center">
          <button className="inline-flex items-center gap-2 border-none cursor-pointer font-inherit py-2 px-3.5 text-[13px] font-bold rounded-[10px] transition-all duration-200 bg-[rgba(229,9,20,0.12)] text-[#e50914] border border-[rgba(229,9,20,0.35)] hover:bg-[rgba(229,9,20,0.2)]" onClick={() => handleDelete(u.id)}>{t("common.confirm")}</button>
          <button className="inline-flex items-center gap-2 border-none cursor-pointer font-inherit py-2 px-3.5 text-[13px] font-bold rounded-[10px] transition-all duration-200 bg-transparent text-[var(--app-ink2)] border border-[var(--app-edge2)] hover:bg-[var(--app-fill)]" onClick={() => setConfirmId(null)}>{t("common.cancel")}</button>
        </div>
      ) : (
        <button className="bg-[var(--app-panel)] border border-[var(--app-edge2)] text-[var(--app-ink2)] w-[34px] h-[34px] rounded-[10px] cursor-pointer flex items-center justify-center text-[15px] transition-all duration-200 hover:bg-[var(--app-fill)] hover:text-[var(--app-ink)] [&.delete:hover]:bg-[rgba(229,9,20,0.15)] [&.delete:hover]:text-[#e50914] [&.delete:hover]:border-[rgba(229,9,20,0.3)]" title={t("common.delete")} onClick={() => setConfirmId(u.id)}><Trash2 size={16} /></button>
      )}
    </div>
  );

  const avatar = (u, size = "w-[38px] h-[38px]") => (
    <div className={`${size} rounded-full bg-[rgba(229,9,20,0.12)] flex items-center justify-center text-[16px] shrink-0 overflow-hidden`}>
      {u.avatar ? <img src={u.avatar} alt="" className="w-full h-full object-cover rounded-full" /> : (u.name || "?").charAt(0).toUpperCase()}
    </div>
  );

  return (
    <div className="flex flex-col gap-6 text-[var(--app-ink)] [&_*]:box-border">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[22px] sm:text-[26px] font-extrabold tracking-wide">{t("users.user")}</h1>
          <p className="text-[14px] text-[var(--app-mute)] mt-1">{t("users.subtitle")}</p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <button
            className="inline-flex items-center justify-center gap-2 border cursor-pointer font-inherit py-[11px] px-5 text-[14px] font-bold rounded-xl transition-all duration-200 bg-[var(--app-panel)] text-[var(--app-ink2)] border-[var(--app-edge2)] hover:bg-[var(--app-fill)] hover:text-[var(--app-ink)] w-full sm:w-auto"
            onClick={() => load({ silent: true })}
            disabled={refreshing}
            title={t("users.searchPlaceholder")}
          >
            <RefreshCw size={16} className={`${refreshing ? "animate-spin" : ""}`} /> {t("common.refresh") || "Refresh"}
          </button>
          <button className="inline-flex items-center justify-center gap-2 border-none cursor-pointer font-inherit py-[11px] px-5 text-[14px] font-bold rounded-xl transition-all duration-200 bg-[#e50914] text-white shadow-[0_4px_14px_rgba(229,9,20,0.35)] hover:bg-[#f40612] hover:-translate-y-px w-full sm:w-auto" onClick={() => navigate("/admin/users/create")}>
            <UserPlus size={16} /> {t("users.addUser")}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-[rgba(229,9,20,0.12)] border border-[rgba(229,9,20,0.4)] text-[#ff6b6b] text-[13px] p-[10px_14px] rounded-[10px] flex justify-between items-center">
          {error}
          <button onClick={() => { setError(""); }} className="bg-transparent border-none text-[#ff6b6b] text-[18px] cursor-pointer leading-none">×</button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2.5 bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-xl py-2.5 px-3.5 text-[var(--app-mute)] w-full sm:max-w-xs">
          <span className="shrink-0"><Search size={16} /></span>
          <input className="bg-transparent border-none outline-none text-[var(--app-ink)] font-inherit text-[14px] w-full" placeholder={t("users.searchPlaceholder")} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select containerClassName="relative w-full sm:w-auto" className="bg-[var(--app-panel2)] border border-[var(--app-edge)] text-[var(--app-ink2)] font-inherit text-[13px] py-2.5 px-3 rounded-[10px] outline-none cursor-pointer appearance-none w-full sm:w-auto" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="all">{t("users.allRoles")}</option>
          <option value="admin">{t("users.admins")}</option>
          <option value="staff">{t("users.staff")}</option>
          <option value="customer">{t("users.customers")}</option>
        </Select>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-5 max-sm:grid-cols-[repeat(auto-fill,minmax(150px,1fr))]">
        <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl p-5 transition-all duration-200 hover:-translate-y-[3px] hover:border-[rgba(229,9,20,0.4)]">
          <div className="text-[24px] float-right opacity-80"><Users size={22} /></div>
          <div className="text-[13px] text-[var(--app-mute)] font-semibold">{t("users.totalUsers")}</div>
          <div className="text-[28px] font-extrabold mt-1.5">{users.length}</div>
        </div>
        <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl p-5 transition-all duration-200 hover:-translate-y-[3px] hover:border-[rgba(229,9,20,0.4)]">
          <div className="text-[24px] float-right opacity-80"><Shield size={22} /></div>
          <div className="text-[13px] text-[var(--app-mute)] font-semibold">{t("users.admins")}</div>
          <div className="text-[28px] font-extrabold mt-1.5">{users.filter((u) => u.role === "admin").length}</div>
        </div>
        <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl p-5 transition-all duration-200 hover:-translate-y-[3px] hover:border-[rgba(229,9,20,0.4)]">
          <div className="text-[24px] float-right opacity-80"><Shield size={22} /></div>
          <div className="text-[13px] text-[var(--app-mute)] font-semibold">{t("users.staff")}</div>
          <div className="text-[28px] font-extrabold mt-1.5">{users.filter((u) => u.role === "staff").length}</div>
        </div>
        <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl p-5 transition-all duration-200 hover:-translate-y-[3px] hover:border-[rgba(229,9,20,0.4)]">
          <div className="text-[24px] float-right opacity-80"><Users size={22} /></div>
          <div className="text-[13px] text-[var(--app-mute)] font-semibold">{t("users.customers")}</div>
          <div className="text-[28px] font-extrabold mt-1.5">{users.filter((u) => u.role === "customer").length}</div>
        </div>
      </div>

      <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 px-5 text-center text-[var(--app-mute)]">
            <p>{t("users.loading")}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-[60px] px-5 text-center text-[var(--app-mute)]">
            <div className="text-[44px] mb-3"><Users size={32} /></div>
            <p>{t("users.noUsers")}</p>
          </div>
        ) : (
          <>
            {/* Mobile / tablet card list */}
            <div className="md:hidden flex flex-col gap-3 p-4 sm:p-5">
              {filtered.map((u) => (
                <div key={u.id} className="bg-[var(--app-panel2)] border border-[var(--app-edge2)] rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    {avatar(u)}
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-[var(--app-ink)] leading-snug">{u.name}</div>
                      <div className="text-[12px] text-[var(--app-mute)] mt-0.5">ID #{u.id}</div>
                    </div>
                    <div className="shrink-0">{deleteButtons(u)}</div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-[var(--app-edge)] flex flex-col gap-2 text-[13px]">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[var(--app-mute)]">
                      <span className="inline-flex items-center gap-1.5"><Mail size={13} /> {u.email}</span>
                      {u.phone && <span className="inline-flex items-center gap-1.5"><Phone size={13} /> {u.phone}</span>}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 py-[4px] px-2.5 text-[12px] font-bold rounded-[16px] whitespace-nowrap ${ROLE_BADGES[u.role] || "bg-[var(--app-fill)] text-[var(--app-mute)] border border-[var(--app-edge2)]"}`}>
                        {t(ROLE_KEYS[u.role] || "common.user")}
                      </span>
                      <span className="text-[var(--app-mute)]">{u.bookings_count ?? 0} {t("users.bookings")}</span>
                      <span className="ml-auto text-[12px] text-[var(--app-mute)]">{u.auth_provider === "google" ? t("users.google") : t("users.email")}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse text-[14px] [&>thead_th]:text-left [&>thead_th]:py-[14px] [&>thead_th]:px-[18px] [&>thead_th]:text-[var(--app-mute)] [&>thead_th]:text-[12px] [&>thead_th]:font-bold [&>thead_th]:uppercase [&>thead_th]:tracking-widest [&>thead_th]:border-b [&>thead_th]:border-[var(--app-edge)] [&>thead_th]:bg-[var(--app-fill)] [&>thead_th]:whitespace-nowrap [&>th]:sticky [&>th]:top-0 [&>th]:z-5 [&>th]:bg-[var(--app-panel)] [&>tbody_td]:py-[14px] [&>tbody_td]:px-[18px] [&>tbody_td]:border-b [&>tbody_td]:border-[var(--app-edge)] [&>tbody_td]:text-[var(--app-ink2)] [&>tbody_td]:align-middle [&>tbody>tr]:transition-colors [&>tbody>tr]:duration-150 [&>tbody>tr:hover]:bg-[var(--app-fill)] [&>tbody>tr:last-child>td]:border-b-0">
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
                        <div className="flex items-center gap-3">
                          {avatar(u)}
                          <div>
                            <div className="font-bold text-[var(--app-ink)]">{u.name}</div>
                            <div className="text-[12px] text-[var(--app-mute)]">ID #{u.id}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="inline-flex items-center gap-1.5"><Mail size={12} /> {u.email}</span>
                          {u.phone && <span className="inline-flex items-center gap-1 text-[var(--text-muted,#a0a0a0)]"><Phone size={12} /> {u.phone}</span>}
                        </div>
                      </td>
                      <td>
                        <span className={`inline-flex items-center gap-1.5 py-[5px] px-3 text-[12px] font-bold rounded-[20px] whitespace-nowrap bg-[var(--app-fill)] text-[var(--app-mute)] border border-[var(--app-edge2)] ${ROLE_BADGES[u.role] || ""}`}>
                          {t(ROLE_KEYS[u.role] || "common.user")}
                        </span>
                      </td>
                      <td>{u.bookings_count ?? 0}</td>
                      <td>
                        <span className="text-[12px] text-[var(--app-mute)]">
                          {u.auth_provider === "google" ? t("users.google") : t("users.email")}
                        </span>
                      </td>
                      <td>{deleteButtons(u)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}