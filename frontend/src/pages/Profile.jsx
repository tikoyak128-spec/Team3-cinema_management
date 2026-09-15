import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePrefs } from "../context/PrefsContext";
import api, { buildFormData } from "../api/client";
import {
  User,
  Mail,
  Phone,
  Lock,
  Camera,
  Check,
  LogOut,
  Save,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";

const inputClass =
  "w-full bg-[var(--app-panel2)] border border-[var(--app-edge2)] rounded-xl py-3 pl-11 pr-4 text-[var(--app-ink)] text-sm outline-none transition-[border-color] duration-200 focus:border-brand/60";

function Field({ icon: Icon, label, name, value, onChange, type = "text", placeholder, disabled }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-[var(--app-mute)]">{label}</label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--app-mute)] pointer-events-none">
          <Icon size={16} />
        </span>
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={inputClass}
        />
      </div>
    </div>
  );
}

export default function Profile({ embedded = false }) {
  const navigate = useNavigate();
  const { user, isAuthenticated, updateUser, logout } = useAuth();
  const { t } = usePrefs();
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    avatar: user?.avatar || "",
  });
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: "", text: "" });

  const [password, setPassword] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ type: "", text: "" });

  const [activeTab, setActiveTab] = useState("profile");
  const [loadingMe, setLoadingMe] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    api
      .get("/me")
      .then(({ data }) => {
        const fresh = {
          name: data.name,
          email: data.email,
          phone: data.phone || "",
          avatar: data.avatar || "",
        };
        setProfile(fresh);
        setAvatarPreview(fresh.avatar || null);
        updateUser({ ...user, ...data });
      })
      .catch(() => {})
      .finally(() => setLoadingMe(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
    setProfileMsg({ type: "", text: "" });
  };

  const handlePasswordChange = (e) => {
    setPassword({ ...password, [e.target.name]: e.target.value });
    setPasswordMsg({ type: "", text: "" });
  };

  const handleAvatarPick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setProfileMsg({ type: "", text: "" });
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg({ type: "", text: "" });
    try {
      const payload = buildFormData({
        _method: "put",
        name: profile.name,
        email: profile.email,
        phone: profile.phone || null,
        avatar: profile.avatar || null,
        avatar_file: avatarFile,
      });
      if (avatarFile) payload.delete("avatar");
      const { data } = await api.post("/profile", payload);
      updateUser({ ...user, ...data.user });
      setAvatarFile(null);
      setProfileMsg({ type: "success", text: data.message });
    } catch (err) {
      const msg =
        err?.response?.data?.errors?.email?.[0] ||
        err?.response?.data?.message ||
        "Failed to update profile.";
      setProfileMsg({ type: "error", text: msg });
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (password.new_password !== password.new_password_confirmation) {
      setPasswordMsg({ type: "error", text: "Passwords do not match." });
      return;
    }
    if (password.new_password.length < 8) {
      setPasswordMsg({ type: "error", text: "New password must be at least 8 characters." });
      return;
    }
    setSavingPassword(true);
    setPasswordMsg({ type: "", text: "" });
    try {
      const { data } = await api.put("/profile", {
        name: profile.name,
        email: profile.email,
        phone: profile.phone || null,
        current_password: password.current_password,
        new_password: password.new_password,
        new_password_confirmation: password.new_password_confirmation,
      });
      updateUser({ ...user, ...data.user });
      setPasswordMsg({ type: "success", text: "Password updated successfully." });
      setPassword({ current_password: "", new_password: "", new_password_confirmation: "" });
    } catch (err) {
      const msg =
        err?.response?.data?.errors?.current_password?.[0] ||
        err?.response?.data?.message ||
        "Failed to update password.";
      setPasswordMsg({ type: "error", text: msg });
    } finally {
      setSavingPassword(false);
    }
  };

  const roleLabel = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : "Customer";

  const roleBadge =
    user?.role === "admin"
      ? "bg-violet-500/15 text-violet-400 border-violet-500/30"
      : user?.role === "staff"
        ? "bg-amber-400/15 text-amber-400 border-amber-400/30"
        : "bg-brand/15 text-brand border-brand/30";

  return (
    <div className={`max-w-[1080px] mx-auto ${embedded ? "px-0 pb-6 pt-1" : "px-5 sm:px-6 lg:px-8 pb-14 sm:pb-16 md:pb-20 pt-24 sm:pt-28 md:pt-32"}`}>
      {/* Header Card */}
      <div className="relative overflow-hidden rounded-2xl border border-[var(--app-edge)] bg-[linear-gradient(135deg,var(--app-panel),var(--app-panel2))] p-6 sm:p-8 mb-6">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[rgba(229,9,20,0.15)] blur-[70px]" />
        <div className="absolute -bottom-24 -left-16 w-64 h-64 rounded-full bg-[rgba(139,92,246,0.08)] blur-[70px]" />
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-gradient-to-br from-brand to-red-700 ring-4 ring-[var(--app-edge)] flex items-center justify-center">
              {avatarPreview ? (
                <img src={avatarPreview} alt={user?.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-black text-white">
                  {(user?.name || "U").charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-brand hover:bg-brand-hover flex items-center justify-center text-white shadow-[0_4px_14px_rgba(229,9,20,0.5)] cursor-pointer transition-all"
              title="Change photo"
            >
              <Camera size={16} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarPick}
            />
          </div>

          {/* Identity */}
          <div className="text-center sm:text-left flex-1 min-w-0">
            <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black truncate">
                {user?.name || "User"}
              </h1>
              <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${roleBadge}`}>
                {roleLabel}
              </span>
            </div>
            <p className="text-sm text-[var(--app-mute)] mt-1">{user?.email}</p>
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-3 text-[13px] text-[var(--app-mute)] flex-wrap">
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-brand">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                </svg>
                {t("profile.memberSince")}{" "}
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                    })
                  : "2026"}
              </span>
            </div>
          </div>

          <button
            onClick={() => { logout(); navigate("/"); }}
            className="inline-flex items-center gap-2 bg-[var(--app-fill)] hover:bg-[var(--app-fill2)] border border-[var(--app-edge)] text-[var(--app-ink)] text-sm font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer shrink-0"
          >
            <LogOut size={15} /> {t("profile.logOut")}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-[var(--app-panel2)] border border-[var(--app-edge)] rounded-full p-1 gap-1 mb-6 w-fit">
        <button
          className={`text-[13px] font-bold px-5 py-2.5 rounded-full transition-all cursor-pointer ${activeTab === "profile" ? "bg-brand text-white" : "text-[var(--app-mute)] hover:text-[var(--app-ink)]"}`}
          onClick={() => setActiveTab("profile")}
        >
          {t("profile.tabProfile")}
        </button>
        <button
          className={`text-[13px] font-bold px-5 py-2.5 rounded-full transition-all cursor-pointer ${activeTab === "password" ? "bg-brand text-white" : "text-[var(--app-mute)] hover:text-[var(--app-ink)]"}`}
          onClick={() => setActiveTab("password")}
        >
          {t("profile.tabSecurity")}
        </button>
      </div>

      {loadingMe ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={26} className="text-brand animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Forms */}
          <div>
            {activeTab === "profile" ? (
              <form onSubmit={saveProfile} className="bg-[linear-gradient(135deg,var(--app-panel),var(--app-panel2))] border border-[var(--app-edge)] rounded-2xl p-6 sm:p-8 flex flex-col gap-5">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold">{t("profile.personalInfo")}</h2>
                  <p className="text-xs text-[var(--app-mute)] mt-1">
                    {t("profile.personalInfoDesc")}
                  </p>
                </div>

                {profileMsg.text && (
                  <div className={`flex items-center gap-2 text-[12px] font-semibold p-3 rounded-xl border ${
                    profileMsg.type === "success"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : "bg-red-500/10 border-red-500/30 text-red-400"
                  }`}>
                    {profileMsg.type === "success" ? <Check size={14} /> : null}
                    {profileMsg.text}
                  </div>
                )}

                <Field
                  icon={User}
                  label={t("profile.fullName")}
                  name="name"
                  value={profile.name}
                  onChange={handleProfileChange}
                  placeholder="John Doe"
                />
                <Field
                  icon={Mail}
                  label={t("profile.emailAddress")}
                  name="email"
                  type="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                  placeholder="you@example.com"
                />
                <Field
                  icon={Phone}
                  label={t("profile.phoneOptional")}
                  name="phone"
                  type="tel"
                  value={profile.phone}
                  onChange={handleProfileChange}
                  placeholder="+855 12 345 678"
                />

                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-white text-sm font-bold px-6 py-3 rounded-full transition-all shadow-[0_4px_16px_rgba(229,9,20,0.35)] cursor-pointer disabled:opacity-50"
                  >
                    {savingProfile ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                    {savingProfile ? t("profile.saving") : t("profile.saveChanges")}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={savePassword} className="bg-[linear-gradient(135deg,var(--app-panel),var(--app-panel2))] border border-[var(--app-edge)] rounded-2xl p-6 sm:p-8 flex flex-col gap-5">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold">{t("profile.changePassword")}</h2>
                  <p className="text-xs text-[var(--app-mute)] mt-1">
                    {t("profile.changePasswordDesc")}
                  </p>
                </div>

                {passwordMsg.text && (
                  <div className={`flex items-center gap-2 text-[12px] font-semibold p-3 rounded-xl border ${
                    passwordMsg.type === "success"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : "bg-red-500/10 border-red-500/30 text-red-400"
                  }`}>
                    {passwordMsg.type === "success" ? <Check size={14} /> : null}
                    {passwordMsg.text}
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[var(--app-mute)]">{t("profile.currentPassword")}</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--app-mute)] pointer-events-none">
                      <Lock size={16} />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="current_password"
                      value={password.current_password}
                      onChange={handlePasswordChange}
                      placeholder="••••••••"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[var(--app-mute)]">{t("profile.newPassword")}</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--app-mute)] pointer-events-none">
                      <Lock size={16} />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="new_password"
                      value={password.new_password}
                      onChange={handlePasswordChange}
                      placeholder="••••••••"
                      className="w-full bg-[var(--app-panel2)] border border-[var(--app-edge2)] rounded-xl py-3 pl-11 pr-11 text-[var(--app-ink)] text-sm outline-none transition-[border-color] duration-200 focus:border-brand/60"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[var(--app-mute)]">{t("profile.confirmNewPassword")}</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--app-mute)] pointer-events-none">
                      <Lock size={16} />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="new_password_confirmation"
                      value={password.new_password_confirmation}
                      onChange={handlePasswordChange}
                      placeholder="••••••••"
                      className="w-full bg-[var(--app-panel2)] border border-[var(--app-edge2)] rounded-xl py-3 pl-11 pr-11 text-[var(--app-ink)] text-sm outline-none transition-[border-color] duration-200 focus:border-brand/60"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--app-mute)] hover:text-[var(--app-ink)] cursor-pointer"
                      title={showPassword ? "Hide passwords" : "Show passwords"}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-white text-sm font-bold px-6 py-3 rounded-full transition-all shadow-[0_4px_16px_rgba(229,9,20,0.35)] cursor-pointer disabled:opacity-50"
                  >
                    {savingPassword ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                    {savingPassword ? t("profile.updating") : t("profile.updatePassword")}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Sidebar summary */}
          <aside className="flex flex-col gap-6">
            <div className="bg-[linear-gradient(135deg,var(--app-panel),var(--app-panel2))] border border-[var(--app-edge)] rounded-2xl p-6">
              <h3 className="text-sm font-extrabold mb-4 uppercase tracking-wider text-[var(--app-mute)]">
                {t("profile.accountInfo")}
              </h3>
              <div className="flex flex-col gap-4 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-[var(--app-mute)]">{t("profile.email")}</span>
                  <span className="font-semibold text-right truncate max-w-[150px]">{user?.email}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-[var(--app-mute)]">{t("profile.phone")}</span>
                  <span className="font-semibold text-right">{profile.phone || "—"}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-[var(--app-mute)]">{t("profile.status")}</span>
                  <span className="font-semibold text-emerald-400">
                    {user?.email_verified_at ? t("profile.verified") : t("profile.unverified")}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-[linear-gradient(135deg,var(--app-panel),var(--app-panel2))] border border-[var(--app-edge)] rounded-2xl p-6">
              <h3 className="text-sm font-extrabold mb-4 uppercase tracking-wider text-[var(--app-mute)]">
                {t("profile.needHelp")}
              </h3>
              <p className="text-xs text-[var(--app-mute)] leading-relaxed mb-4">
                {t("profile.needHelpDesc")}
              </p>
              <button
                onClick={() => navigate("/now-showing")}
                className="w-full bg-[var(--app-fill)] hover:bg-[var(--app-fill2)] border border-[var(--app-edge)] text-[var(--app-ink)] text-sm font-bold py-2.5 rounded-xl transition-all cursor-pointer"
              >
                {t("profile.browseNowShowing")}
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}