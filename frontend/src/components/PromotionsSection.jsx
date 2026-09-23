import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BadgePercent,
  Check,
  Clock,
  Copy,
  Crown,
  Flame,
  Gift,
  GraduationCap,
  Loader2,
  Lock,
  Popcorn,
  Star,
  Ticket,
  Users,
} from "lucide-react";
import api from "../api/client";
import { usePrefs } from "../context/PrefsContext";
import { useAuth } from "../context/AuthContext";

const fallbackPromotions = [
  {
    icon: "faBowlFood",
    tagKey: "promo.fallback.f1Tag",
    titleKey: "promo.fallback.f1Title",
    textKey: "promo.fallback.f1Text",
    discount: "20%",
    type: "snacks",
    priceLabelKey: "promo.fallback.f1Price",
    price_amount: "$2.00",
    expires_days: 5,
    popular: false,
  },
  {
    icon: "faTicket",
    tagKey: "promo.fallback.f2Tag",
    titleKey: "promo.fallback.f2Title",
    textKey: "promo.fallback.f2Text",
    discount: "50%",
    type: "tickets",
    priceLabelKey: "promo.fallback.f2Price",
    price_amount: "$3.50",
    expires_days: 3,
    popular: true,
  },
  {
    icon: "faGraduationCap",
    tagKey: "promo.fallback.f3Tag",
    titleKey: "promo.fallback.f3Title",
    textKey: "promo.fallback.f3Text",
    discount: "30%",
    type: "tickets",
    priceLabelKey: "promo.fallback.f3Price",
    price_amount: "$2.50",
    expires_days: 7,
    popular: false,
  },
  {
    icon: "faTicket",
    tagKey: "promo.fallback.f4Tag",
    titleKey: "promo.fallback.f4Title",
    textKey: "promo.fallback.f4Text",
    discount: "FREE",
    type: "combo",
    priceLabelKey: "promo.fallback.f4Price",
    price_amount: "$12.00",
    expires_days: 6,
    popular: false,
  },
  {
    icon: "faBowlFood",
    tagKey: "promo.fallback.f5Tag",
    titleKey: "promo.fallback.f5Title",
    textKey: "promo.fallback.f5Text",
    discount: "25%",
    type: "combo",
    priceLabelKey: "promo.fallback.f5Price",
    price_amount: "$15.00",
    expires_days: 4,
    popular: false,
  },
  {
    icon: "faTicket",
    tagKey: "promo.fallback.f6Tag",
    titleKey: "promo.fallback.f6Title",
    textKey: "promo.fallback.f6Text",
    discount: "2X",
    type: "loyalty",
    priceLabelKey: "promo.fallback.f6Price",
    price_amount: "2X",
    expires_days: 8,
    popular: false,
  },
];

const ICON_BY_TAG = {
  "Food & Beverage": Popcorn,
  "Launch Special": Flame,
  Student: GraduationCap,
  "Combo Deal": Gift,
  "Family Bundle": Users,
  "Members Only": Crown,
};

const ICON_BY_TYPE = {
  tickets: Ticket,
  snacks: Popcorn,
  combo: Gift,
  loyalty: Crown,
  other: BadgePercent,
};

function PromoIcon({ promo, size = 20, className }) {
  const Icon = ICON_BY_TAG[promo.tag] || ICON_BY_TYPE[promo.type] || BadgePercent;
  return <Icon size={size} strokeWidth={2} className={className} />;
}

const claimDestination = (promo) => {
  if (promo.type === "loyalty" && !promo.discount_code) return "/services";
  return null; // discount promos reveal a code you can use at checkout
};

function RequirementRows({ info }) {
  const { t } = usePrefs();
  const rows = [];

  if (info?.required_bookings > 0) {
    rows.push(
      <span key="bookings" className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[var(--app-mute)]">
        <Ticket size={12} className="shrink-0" />
        {t("promo.reqBookings", { n: info.required_bookings })}
        <b className="text-[var(--app-ink)]">{info.completed_bookings}/{info.required_bookings}</b>
      </span>
    );
  }
  if (info?.required_spent > 0) {
    rows.push(
      <span key="spent" className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[var(--app-mute)]">
        <BadgePercent size={12} className="shrink-0" />
        {t("promo.reqSpend", { amount: Number(info.required_spent).toFixed(0) })}
        <b className="text-[var(--app-ink)]">
          ${Number(info.total_spent).toFixed(2)} / ${Number(info.required_spent).toFixed(2)}
        </b>
      </span>
    );
  }
  if (info?.requires_verified_email) {
    rows.push(
      <span key="email" className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[var(--app-mute)]">
        <Check size={12} className="shrink-0 text-emerald-500" />
        {info.email_verified ? t("promo.reqEmailDone") : t("promo.reqEmail")}
      </span>
    );
  }

  return <div className="flex flex-col items-start gap-1">{rows}</div>;
}

function ClaimButton({ promo, onClaim, claimed, info, claiming, claimError }) {
  const { t } = usePrefs();
  const { isAuthenticated } = useAuth();
  const [copied, setCopied] = useState(false);

  const copyCode = async (e) => {
    e.stopPropagation();
    if (!claimed) return;
    try {
      await navigator.clipboard.writeText(claimed);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard unavailable — leave code visible to copy manually
    }
  };

  if (claimed) {
    return (
      <div className="flex flex-col items-center sm:items-end gap-1.5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 text-white text-xs sm:text-[13px] font-bold px-4 py-2.5">
          <Check size={13} /> {t("promo.claimed")}
        </span>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-black tracking-widest uppercase text-emerald-600 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
          {claimed}
          <button
            type="button"
            onClick={copyCode}
            title={t("promo.copyCode")}
            className="text-emerald-600 hover:text-emerald-400 transition-colors cursor-pointer inline-flex items-center no-underline"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
          </button>
        </span>
        <span className="text-[10px] text-[var(--app-mute)] font-semibold text-center sm:text-right">
          {t("promo.useCodeHint")}
        </span>
      </div>
    );
  }

  if (claiming) {
    return (
      <button
        type="button"
        disabled
        className="inline-flex items-center gap-1.5 bg-brand/80 text-white text-xs sm:text-[13px] font-bold px-4 py-2.5 rounded-full transition-all no-underline cursor-default opacity-80"
      >
        <Loader2 size={13} className="animate-spin" /> {t("promo.claiming")}
      </button>
    );
  }

  const needsLogin = !isAuthenticated;
  const isLocked = !needsLogin && info && !info.eligible;

  if (isLocked) {
    return (
      <div className="flex flex-col items-center sm:items-end gap-1.5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--app-fill)] border border-[var(--app-edge)] text-[var(--app-mute)] text-xs sm:text-[13px] font-bold px-4 py-2.5">
          <Lock size={12} /> {t("promo.locked")}
        </span>
        <RequirementRows info={info} />
        {claimError && (
          <span className="text-[10px] text-brand font-semibold text-center sm:text-right max-w-[220px]">{claimError}</span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center sm:items-end gap-1.5">
      <button
        type="button"
        onClick={() => onClaim(promo)}
        className="inline-flex items-center gap-1.5 bg-brand hover:bg-brand-hover text-white text-xs sm:text-[13px] font-bold px-4 py-2.5 rounded-full transition-all no-underline cursor-pointer"
      >
        {needsLogin ? t("promo.loginToClaim") : t("promo.claimNow")} <ArrowRight size={13} />
      </button>
      {claimError && (
        <span className="text-[10px] text-brand font-semibold text-center sm:text-right max-w-[220px]">{claimError}</span>
      )}
    </div>
  );
}

function PromoCountdown({ days }) {
  const { t } = usePrefs();
  const [timeLeft, setTimeLeft] = useState({ d: days, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const target = Date.now() + days * 24 * 60 * 60 * 1000;
    const interval = setInterval(() => {
      const diff = target - Date.now();
      if (diff <= 0) {
        clearInterval(interval);
        return;
      }
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setTimeLeft({ d, h, m, s });
    }, 1000);
    return () => clearInterval(interval);
  }, [days]);

  return (
    <div className="flex items-center gap-1.5">
      {[
        { val: timeLeft.d, labelKey: "promo.daysLbl" },
        { val: timeLeft.h, labelKey: "promo.hrsLbl" },
        { val: timeLeft.m, labelKey: "promo.minLbl" },
      ].map(({ val, labelKey }) => (
        <div key={labelKey} className="flex items-center gap-1.5">
          <div className="bg-[var(--app-fill)] border border-[var(--app-edge)] rounded-lg px-2 py-1 text-center min-w-[42px]">
            <span className="text-sm font-black text-[var(--app-ink)] tabular-nums block leading-none">
              {String(val).padStart(2, "0")}
            </span>
          </div>
          <span className="text-[9px] text-[var(--app-mute)] font-semibold uppercase tracking-wider">{t(labelKey)}</span>
        </div>
      ))}
    </div>
  );
}

export default function PromotionsSection() {
  const { t } = usePrefs();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { isAuthenticated } = useAuth();
  const [promotions, setPromotions] = useState(fallbackPromotions);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [claimed, setClaimed] = useState({});
  const [claimInfo, setClaimInfo] = useState({});
  const [claimingKey, setClaimingKey] = useState(null);
  const [claimErrors, setClaimErrors] = useState({});

  const keyOf = (promo) => String(promo.id || promo.title);

  const handleClaim = async (promo) => {
    const dest = claimDestination(promo);
    if (dest) {
      navigate(dest);
      return;
    }

    const key = keyOf(promo);

    if (!isAuthenticated || !promo.id) {
      navigate("/login");
      return;
    }

    setClaimingKey(key);
    setClaimErrors((prev) => ({ ...prev, [key]: null }));
    try {
      const res = await api.post(`/promotions/${promo.id}/claim`);
      const code = res.data?.discount_code;
      setClaimed((prev) => ({ ...prev, [key]: code }));
      setClaimInfo((prev) => ({
        ...prev,
        [key]: { ...(prev[key] || {}), eligible: true, claimed: true, claimed_code: code },
      }));
    } catch (err) {
      const data = err?.response?.data || {};
      const claim = data.claim;
      setClaimErrors((prev) => ({
        ...prev,
        [key]: data.message || "Unable to claim this promotion.",
      }));
      if (claim) {
        setClaimInfo((prev) => ({ ...prev, [key]: claim }));
      }
    } finally {
      setClaimingKey(null);
    }
  };

  useEffect(() => {
    let cancelled = false;
    api
      .get("/promotions")
      .then((res) => {
        if (cancelled) return;
        const list = res.data;
        if (Array.isArray(list) && list.length > 0) {
          setPromotions(list);
          setLoadError(false);

          const nextClaimed = {};
          const nextInfo = {};
          list.forEach((p) => {
            const key = String(p.id || p.title);
            nextInfo[key] = p.claim;
            if (p.claim?.claimed && p.discount_code) {
              nextClaimed[key] = p.discount_code;
            }
          });
          setClaimed(nextClaimed);
          setClaimInfo(nextInfo);
        }
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const featured = promotions.filter((p) => p.popular);
  const regular = promotions.filter((p) => !p.popular);
  const fallbackKeyByTag = {
    "Food & Beverage": "f1",
    "Launch Special": "f2",
    Student: "f3",
    "Combo Deal": "f4",
    "Family Bundle": "f5",
    "Members Only": "f6",
  };
  const fallbackFieldKey = (p, base) => {
    const prefix = fallbackKeyByTag[p.tag];
    if (!prefix) return null;
    const suffix = { tag: "Tag", title: "Title", text: "Text", price_label: "Price" }[base];
    return suffix ? prefix + suffix : null;
  };
  const field = (p, base) => {
    if (p[base + "Key"]) return t(p[base + "Key"]);
    const fk = fallbackFieldKey(p, base);
    return fk ? t(`promo.fallback.${fk}`) : p[base];
  };

  return (
    <section className="max-w-[1024px] mx-auto px-5 sm:px-6 lg:px-8 py-14 sm:py-16 md:py-20 scroll-mt-20" id="promotions">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 mb-8 sm:mb-12 flex-wrap">
        <div>
          <span className="inline-flex items-center gap-2 bg-brand/15 text-brand text-xs font-bold tracking-[2px] uppercase px-3.5 py-1.5 rounded-full mb-3">
            <BadgePercent size={14} /> {t("promo.limitedTime")}
          </span>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold mb-1.5">{t("promo.dealsTitle")}</h2>
          <p className="text-sm sm:text-[15px] text-[var(--app-mute)] leading-relaxed max-w-[520px]">
            {t("promo.dealsSubtitle")}
          </p>
        </div>
        {pathname !== "/promotions" && (
          <Link to="/promotions" className="inline-flex items-center gap-1.5 text-brand text-sm font-bold hover:underline no-underline shrink-0">
            {t("promo.viewAll")} <ArrowRight size={14} />
          </Link>
        )}
      </div>

      {loading && (
        <div className="text-[var(--app-mute)] text-sm font-semibold py-10 text-center">{t("promo.loading")}</div>
      )}
      {!loading && loadError && promotions.length === 0 && (
        <div className="text-[var(--app-mute)] text-sm font-semibold py-10 text-center">
          {t("promo.error")}
        </div>
      )}

      {promotions.length > 0 && (
        <>
          {/* Featured Promotion */}
          {featured.map((promo) => (
            <div
              key={promo.id || promo.title}
              className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-[var(--app-edge)] bg-[linear-gradient(135deg,var(--app-panel),var(--app-panel2))] mb-5 sm:mb-6"
            >
              <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[rgba(229,9,20,0.14)] blur-[90px]" />
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 md:gap-12 items-center p-7 sm:p-10">
                <div>
                  <div className="flex items-center flex-wrap gap-3 mb-5">
                    <span className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand to-[#ff5f6d] text-white flex items-center justify-center shadow-[0_6px_18px_rgba(229,9,20,0.38)]">
                      <PromoIcon promo={promo} size={20} />
                    </span>
                    <span className="inline-flex items-center gap-1.5 bg-brand text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
                      <Star size={12} fill="white" /> {t("promo.featured")}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-[var(--app-mute)] bg-[var(--app-fill)] border border-[var(--app-edge)] px-3 py-1.5 rounded-full">
                      <Clock size={13} className="text-brand" /> {t("promo.hurry")}
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-black mb-3">{field(promo, "title")}</h3>
                  <p className="text-sm sm:text-[15px] text-[var(--app-mute)] leading-relaxed max-w-[560px] mb-6">{field(promo, "text")}</p>
                  <PromoCountdown days={promo.expires_days} />
                </div>
                <div className="flex md:flex-col items-center md:items-stretch gap-4 md:gap-5">
                  <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-gradient-to-br from-brand/15 to-[#ff5f6d]/10 border border-brand/20 flex flex-col items-center justify-center">
                    <span className="text-[28px] md:text-[32px] font-black text-brand leading-none">{promo.discount}</span>
                    <span className="text-[10px] text-[var(--app-mute)] font-semibold uppercase tracking-wider mt-1">{t("promo.off")}</span>
                  </div>
                  <div className="flex flex-col md:items-center gap-1">
                    <span className="text-[11px] text-[var(--app-mute)] font-semibold uppercase tracking-wider">{field(promo, "price_label")}</span>
                    <span className="text-2xl font-black text-brand">{promo.price_amount}</span>
                  </div>
                  <div className="w-full flex justify-center md:justify-end">
                    <ClaimButton
                        promo={promo}
                        onClaim={handleClaim}
                        claimed={claimed[keyOf(promo)]}
                        info={claimInfo[keyOf(promo)]}
                        claiming={claimingKey === keyOf(promo)}
                        claimError={claimErrors[keyOf(promo)]}
                      />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Promotion Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-4">
            {regular.map((promo) => {
              const isPlainDiscount = ["FREE", "2X"].includes(promo.discount);
              return (
                <div
                  className="relative flex flex-col bg-[linear-gradient(135deg,var(--app-panel),var(--app-panel2))] border border-[var(--app-edge)] rounded-xl sm:rounded-2xl p-5 sm:p-6 transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-[0_18px_44px_-24px_rgba(229,9,20,0.4)]"
                  key={promo.id || promo.title}
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-brand to-[#ff5f6d] text-white flex items-center justify-center shadow-[0_6px_16px_rgba(229,9,20,0.3)]">
                      <PromoIcon promo={promo} size={22} />
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${promo.discount === "FREE" ? "bg-emerald-600 text-white" : "bg-brand text-white"}`}>
                      {promo.discount} {isPlainDiscount ? "" : t("promo.off")}
                    </span>
                  </div>
                  <span className="self-start text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-2.5 bg-brand/10 text-brand border border-brand/15">
                    {field(promo, "tag")}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold mb-2">{field(promo, "title")}</h3>
                  <p className="text-xs sm:text-sm text-[var(--app-mute)] leading-relaxed mb-5">{field(promo, "text")}</p>

                  <div className="mt-auto">
                    <div className="flex items-baseline justify-between gap-2 mb-4">
                      <span className="text-[11px] text-[var(--app-mute)] font-semibold uppercase tracking-wide">{field(promo, "price_label")}</span>
                      <span className="text-xl font-black text-brand">
                        {promo.price_amount}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 border-t border-[var(--app-edge)] pt-4">
                      <div className="flex items-center gap-1.5 text-[var(--app-mute)]">
                        <Clock size={13} className="text-brand shrink-0" />
                        <span className="text-[11px] font-semibold whitespace-nowrap">
                          {t("promo.endsIn")} {promo.expires_days} {t("promo.days")}
                        </span>
                      </div>
<ClaimButton
                      promo={promo}
                      onClaim={handleClaim}
                      claimed={claimed[keyOf(promo)]}
                      info={claimInfo[keyOf(promo)]}
                      claiming={claimingKey === keyOf(promo)}
                      claimError={claimErrors[keyOf(promo)]}
                    />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}