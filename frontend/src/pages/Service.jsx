import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import HeroBanner from "../components/HeroBanner";
import Select from "../components/Select";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { usePrefs } from "../context/PrefsContext";
import useHeroImage from "../hooks/useHeroImage";
import {
  Ticket,
  Smartphone,
  Users,
  Gift,
  Briefcase,
  Headphones,
  Accessibility,
  Crown,
  Phone,
  Mail,
  MapPin,
  Clock,
  ChevronDown,
  Send,
  Check,
} from "lucide-react";

const services = [
  {
    icon: Ticket,
    titleKey: "service.serviceOnlineBooking",
    descKey: "service.serviceOnlineBookingDesc",
  },
  {
    icon: Crown,
    titleKey: "service.serviceLoyalty",
    descKey: "service.serviceLoyaltyDesc",
  },
  {
    icon: Smartphone,
    titleKey: "service.serviceMobileApp",
    descKey: "service.serviceMobileAppDesc",
  },
  {
    icon: Users,
    titleKey: "service.servicePrivate",
    descKey: "service.servicePrivateDesc",
  },
  {
    icon: Gift,
    titleKey: "service.serviceGiftCards",
    descKey: "service.serviceGiftCardsDesc",
  },
  {
    icon: Briefcase,
    titleKey: "service.serviceGroupCorporate",
    descKey: "service.serviceGroupCorporateDesc",
  },
  {
    icon: Accessibility,
    titleKey: "service.serviceAccessibility",
    descKey: "service.serviceAccessibilityDesc",
  },
  {
    icon: Headphones,
    titleKey: "service.serviceCustomerCare",
    descKey: "service.serviceCustomerCareDesc",
  },
];

const faqs = [
  { qKey: "service.faq1Q", aKey: "service.faq1A" },
  { qKey: "service.faq2Q", aKey: "service.faq2A" },
  { qKey: "service.faq3Q", aKey: "service.faq3A" },
  { qKey: "service.faq4Q", aKey: "service.faq4A" },
  { qKey: "service.faq5Q", aKey: "service.faq5A" },
];

const topicOptions = [
  { value: "general", key: "service.topicGeneral" },
  { value: "booking", key: "service.topicBooking" },
  { value: "refund", key: "service.topicRefund" },
  { value: "private", key: "service.topicPrivate" },
  { value: "membership", key: "service.topicMembership" },
  { value: "other", key: "service.topicOther" },
];

export default function Service() {
  const { t } = usePrefs();
  const heroImage = useHeroImage(
    "services",
    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=1200&fit=crop"
  );
  const { user, isAuthenticated } = useAuth();
  const [openFaq, setOpenFaq] = useState(0);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", topic: "general", message: "" });
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    let cancelled = false;
    api
      .get("/contacts/mine")
      .then(({ data }) => {
        if (!cancelled) setMessages(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setMessages([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingMessages(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSent(false);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    setSubmitting(true);
    setSent(false);
    setError("");
    try {
      const { data } = await api.post("/contacts", {
        subject: form.topic,
        message: form.message,
      });
      setMessages((prev) => [data, ...prev]);
      setSent(true);
      setForm({ name: "", email: "", topic: "general", message: "" });
    } catch (err) {
      setError(err?.response?.data?.message || t("service.sendFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  const statusLabel = (status) => {
    if (status === "replied") return t("service.statusReplied");
    if (status === "read") return t("service.statusRead");
    return t("service.statusNew");
  };

  const inputClass =
    "w-full bg-[var(--app-panel2)] border border-[var(--app-edge2)] rounded-xl px-4 py-3 text-[var(--app-ink)] text-sm outline-none transition-[border-color] duration-200 focus:border-brand/60";

  return (
    <>
      <HeroBanner
        split
        badge={t("service.heroBadge")}
        title={t("service.heroTitle")}
        desc={t("service.heroDesc")}
        image={heroImage}
      />

      {/* Services Grid */}
      <section className="max-w-[1024px] mx-auto px-6 md:px-12 py-8 md:py-10">
        <div className="text-center mb-12">
          <h2 className="text-[28px] md:text-[42px] font-black leading-[1.15] mb-3">
            {t("service.introTitle")}
          </h2>
          <p className="text-[15px] text-[var(--app-mute)] max-w-[620px] mx-auto leading-relaxed">
            {t("service.introText")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.titleKey}
                className="bg-[linear-gradient(135deg,var(--app-panel),var(--app-panel2))] border border-[var(--app-edge)] rounded-2xl p-6 flex flex-col transition-all hover:-translate-y-1 hover:border-brand/40 group"
              >
                <div className="w-13 h-13 w-[52px] h-[52px] rounded-2xl bg-brand/15 flex items-center justify-center mb-4 group-hover:bg-brand group-hover:ring-4 group-hover:ring-brand/20 transition-all">
                  <Icon className="text-brand group-hover:text-white transition-colors" size={24} />
                </div>
                <h3 className="text-[15px] font-bold mb-2">{t(service.titleKey)}</h3>
                <p className="text-[13px] text-[var(--app-mute)] leading-relaxed">
                  {t(service.descKey)}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Help / FAQ */}
      <section className="bg-[var(--app-deep)] border-y border-[var(--app-edge)]">
        <div className="max-w-[1024px] mx-auto px-6 md:px-12 py-16 md:py-20 grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-12">
          <div>
            <h2 className="text-[28px] md:text-[42px] font-black leading-[1.15] mb-4">
              {t("service.faqTitle")}
            </h2>
            <p className="text-[15px] text-[var(--app-mute)] leading-relaxed mb-6">
              {t("service.faqText")}
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="tel:+85523000000"
                className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-white text-sm font-bold px-5 py-3 rounded-full transition-all shadow-[0_4px_16px_rgba(229,9,20,0.35)]"
              >
                <Phone size={15} /> {t("service.callSupport")}
              </a>
              <a
                href="mailto:info@khmercinema.com"
                className="inline-flex items-center gap-2 bg-[var(--app-fill)] hover:bg-[var(--app-fill2)] border border-[var(--app-edge)] text-[var(--app-ink)] text-sm font-bold px-5 py-3 rounded-full transition-all"
              >
                <Mail size={15} /> {t("footer.emailUs")}
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {faqs.map((faq, idx) => {
              const open = openFaq === idx;
              return (
                <div
                  key={faq.qKey}
                  className="bg-[linear-gradient(135deg,var(--app-panel),var(--app-panel2))] border border-[var(--app-edge)] rounded-2xl overflow-hidden transition-all"
                >
                  <button
                    className="w-full flex items-center justify-between gap-4 text-left p-5 cursor-pointer"
                    onClick={() => setOpenFaq(open ? null : idx)}
                  >
                    <span className="text-[15px] font-bold">{t(faq.qKey)}</span>
                    <span
                      className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center transition-all ${open ? "bg-brand rotate-180" : "bg-[var(--app-fill)]"}`}
                    >
                      <ChevronDown size={16} className={open ? "text-white" : "text-[var(--app-mute)]"} />
                    </span>
                  </button>
                  <div
                    className={`grid transition-all duration-300 ${open ? "grid-rows-[1fr] pb-5 opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                  >
                    <div className="overflow-hidden px-5">
                      <p className="text-[13px] text-[var(--app-mute)] leading-relaxed">{t(faq.aKey)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact / Help Form */}
      <section className="max-w-[1024px] mx-auto px-6 md:px-12 py-16 md:py-20">
        <div className="relative overflow-hidden rounded-3xl border border-[var(--app-edge)] bg-[linear-gradient(135deg,var(--app-panel),var(--app-panel2))]">
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[rgba(229,9,20,0.14)] blur-[80px]" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-[rgba(237,195,143,0.08)] blur-[80px]" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 p-7 sm:p-10 md:p-14">
            {/* Contact info */}
            <div>
              <h2 className="text-[26px] md:text-[36px] font-black leading-[1.15] mb-4">
                {t("service.contactTitle")}
              </h2>
              <p className="text-[15px] text-[var(--app-mute)] leading-relaxed mb-8">
                {t("service.contactText")}
              </p>
              <div className="flex flex-col gap-5">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-brand/15 flex items-center justify-center shrink-0">
                    <Phone size={18} className="text-brand" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold mb-0.5">{t("footer.hotline")}</h4>
                    <p className="text-[13px] text-[var(--app-mute)]">+855 23 000 000</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-brand/15 flex items-center justify-center shrink-0">
                    <Mail size={18} className="text-brand" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold mb-0.5">{t("service.emailLabel")}</h4>
                    <p className="text-[13px] text-[var(--app-mute)]">info@khmercinema.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-brand/15 flex items-center justify-center shrink-0">
                    <MapPin size={18} className="text-brand" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold mb-0.5">{t("footer.headOffice")}</h4>
                    <p className="text-[13px] text-[var(--app-mute)]">Chip Mong Mega Mall, Phnom Penh, Cambodia</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-brand/15 flex items-center justify-center shrink-0">
                    <Clock size={18} className="text-brand" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold mb-0.5">{t("footer.openHours")}</h4>
                    <p className="text-[13px] text-[var(--app-mute)]">Mon – Sun, 09:00 – 21:00</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Help form */}
            <div className="flex flex-col gap-6">
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {!isAuthenticated && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 text-[13px] font-semibold p-3 rounded-xl border bg-amber-500/10 border-amber-500/30 text-amber-400">
                    <span>{t("service.loginToContact")}</span>
                    <Link to="/login" className="underline font-bold hover:opacity-80">
                      {t("nav.signIn")}
                    </Link>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[var(--app-mute)]">{t("service.yourName")}</label>
                    <input
                      name="name"
                      value={isAuthenticated ? user?.name || "" : form.name}
                      onChange={handleChange}
                      readOnly={isAuthenticated}
                      required
                      placeholder="John Doe"
                      className={`${inputClass} ${isAuthenticated ? "opacity-70 cursor-default" : ""}`}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[var(--app-mute)]">{t("service.yourEmail")}</label>
                    <input
                      name="email"
                      type="email"
                      value={isAuthenticated ? user?.email || "" : form.email}
                      onChange={handleChange}
                      readOnly={isAuthenticated}
                      required
                      placeholder="you@example.com"
                      className={`${inputClass} ${isAuthenticated ? "opacity-70 cursor-default" : ""}`}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[var(--app-mute)]">{t("service.topic")}</label>
                  <Select name="topic" value={form.topic} onChange={handleChange} className={`${inputClass} cursor-pointer`}>
                    {topicOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{t(opt.key)}</option>
                    ))}
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[var(--app-mute)]">{t("service.message")}</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows="5"
                    placeholder={t("service.messagePlaceholder")}
                    className={`${inputClass} resize-none`}
                  />
                </div>

                {sent && (
                  <div className="flex items-center gap-2 text-[12px] font-semibold p-3 rounded-xl border bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
                    <Check size={14} /> {t("service.sentSuccess")}
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 text-[12px] font-semibold p-3 rounded-xl border bg-red-500/10 border-red-500/30 text-red-400">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || !isAuthenticated}
                  className="inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-white text-sm font-bold px-6 py-3.5 rounded-full transition-all shadow-[0_4px_16px_rgba(229,9,20,0.35)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                >
                  {submitting ? t("service.sending") : t("service.sendMessage")} <Send size={15} />
                </button>
              </form>

              {isAuthenticated && (
                <div className="flex flex-col gap-3">
                  <h3 className="text-[15px] font-bold flex items-center gap-2">
                    <Mail size={16} className="text-brand" /> {t("service.myMessages")}
                  </h3>
                  {loadingMessages ? (
                    <p className="text-[13px] text-[var(--app-mute)]">{t("common.loading")}</p>
                  ) : messages.length === 0 ? (
                    <p className="text-[13px] text-[var(--app-mute)]">{t("service.noMessages")}</p>
                  ) : (
                    messages.map((m) => (
                      <div key={m.id} className="bg-[var(--app-panel2)] border border-[var(--app-edge2)] rounded-2xl p-4">
                        <div className="flex items-center justify-between gap-3 flex-wrap mb-1.5">
                          <span className="text-[13px] font-bold capitalize">{m.subject}</span>
                          <span
                            className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                              m.status === "replied"
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                : m.status === "read"
                                  ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                                  : "bg-brand/10 border-brand/30 text-brand"
                            }`}
                          >
                            {statusLabel(m.status)}
                          </span>
                        </div>
                        <p className="text-[13px] text-[var(--app-ink2)] leading-relaxed whitespace-pre-line">{m.message}</p>
                        <p className="text-[11px] text-[var(--app-mute)] mt-2">
                          {new Date(m.created_at).toLocaleString()}
                        </p>
                        {m.reply && (
                          <div className="mt-3 pt-3 border-t border-[var(--app-edge)]">
                            <div className="text-[11px] font-bold text-brand mb-1 flex items-center gap-1.5">
                              <Check size={12} /> {t("service.replyFromAdmin")}
                            </div>
                            <p className="text-[13px] text-[var(--app-ink2)] leading-relaxed whitespace-pre-line">{m.reply}</p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}