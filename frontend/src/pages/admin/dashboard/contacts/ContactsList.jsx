import { useEffect, useState } from "react";
import {
  Check,
  ChevronDown,
  Inbox,
  Mail,
  MailOpen,
  Search,
  Send,
} from "lucide-react";
import api from "../../../../api/client";
import { usePrefs } from "../../../../context/PrefsContext";

const statusStyles = {
  new: "bg-brand/10 border-brand/30 text-brand",
  read: "bg-amber-500/10 border-amber-500/30 text-amber-400",
  replied: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
};

export default function ContactsList() {
  const { t } = usePrefs();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const [replyTexts, setReplyTexts] = useState({});
  const [sendingId, setSendingId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get("/contacts")
      .then(({ data }) => {
        if (!cancelled) setContacts(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err?.response?.data?.message || t("adminMessages.failedLoad"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const statusLabel = (status) => {
    if (status === "replied") return t("adminMessages.statusReplied");
    if (status === "read") return t("adminMessages.statusRead");
    return t("adminMessages.statusNew");
  };

  const handleRead = async (id) => {
    try {
      const { data } = await api.post(`/contacts/${id}/read`);
      setContacts((prev) => prev.map((c) => (c.id === id ? data : c)));
    } catch (err) {
      setError(err?.response?.data?.message || t("adminMessages.failedUpdate"));
    }
  };

  const toggleExpand = (contact) => {
    const next = expandedId === contact.id ? null : contact.id;
    setExpandedId(next);
    if (next && contact.status === "new") handleRead(contact.id);
  };

  const handleReply = async (id) => {
    const text = (replyTexts[id] || "").trim();
    if (!text) return;
    setSendingId(id);
    try {
      const { data } = await api.post(`/contacts/${id}/reply`, { reply: text });
      setContacts((prev) => prev.map((c) => (c.id === id ? data : c)));
      setReplyTexts((prev) => ({ ...prev, [id]: "" }));
    } catch (err) {
      setError(err?.response?.data?.message || t("adminMessages.failedReply"));
    } finally {
      setSendingId(null);
    }
  };

  const filtered = contacts.filter((c) => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    const q = search.toLowerCase();
    return (
      (c.name || "").toLowerCase().includes(q) ||
      (c.email || "").toLowerCase().includes(q) ||
      (c.subject || "").toLowerCase().includes(q) ||
      (c.message || "").toLowerCase().includes(q)
    );
  });

  const newCount = contacts.filter((c) => c.status === "new").length;

  return (
    <div className="flex flex-col gap-6 text-[var(--app-ink)] [&_*]:box-border">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[22px] sm:text-[26px] font-extrabold tracking-wide flex items-center gap-2">
            <Inbox size={24} /> {t("admin.messages")}
          </h1>
          <p className="text-[14px] text-[var(--app-mute)] mt-1">{t("adminMessages.subtitle")}</p>
        </div>
        <span className="text-[14px] text-[var(--app-mute)]">
          {t("adminMessages.totalLabel")} <b className="text-[var(--app-ink)]">{contacts.length}</b>
          {newCount > 0 && (
            <span className="ml-3 text-[12px] font-bold px-2.5 py-1 rounded-full bg-brand/10 border border-brand/30 text-brand">
              {newCount} {t("adminMessages.statusNew")}
            </span>
          )}
        </span>
      </div>

      {error && (
        <div className="bg-[rgba(229,9,20,0.12)] border border-[rgba(229,9,20,0.4)] text-[#ff6b6b] text-[13px] p-[10px_14px] rounded-[10px] flex justify-between items-center">
          {error}
          <button
            onClick={() => setError("")}
            className="bg-transparent border-none text-[#ff6b6b] text-[18px] cursor-pointer leading-none"
          >
            ×
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2.5 bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-xl py-2.5 px-3.5 text-[var(--app-mute)] w-full sm:max-w-xs">
          <span className="shrink-0">
            <Search size={16} />
          </span>
          <input
            className="bg-transparent border-none outline-none text-[var(--app-ink)] font-inherit text-[14px] w-full"
            placeholder={t("adminMessages.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {["all", "new", "read", "replied"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`cursor-pointer py-2 px-4 rounded-xl text-[13px] font-bold border transition-all duration-200 ${
                statusFilter === s
                  ? "bg-brand text-white border-brand"
                  : "bg-[var(--app-panel)] text-[var(--app-mute)] border-[var(--app-edge)] hover:text-[var(--app-ink)]"
              }`}
            >
              {s === "all" ? t("adminMessages.filterAll") : statusLabel(s)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl flex items-center justify-center py-10 px-5 text-[var(--app-mute)]">
          {t("adminMessages.loading")}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl flex flex-col items-center justify-center py-[60px] px-5 text-center text-[var(--app-mute)]">
          <Inbox size={32} className="mb-3" />
          <p>{t("adminMessages.noData")}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((c) => {
            const expanded = expandedId === c.id;
            return (
              <div
                key={c.id}
                className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => toggleExpand(c)}
                  className="w-full flex items-center gap-3.5 p-4 text-left cursor-pointer hover:bg-[var(--app-fill)] transition-colors"
                >
                  <div className="w-[42px] h-[42px] rounded-full bg-[rgba(229,9,20,0.12)] flex items-center justify-center font-bold text-brand shrink-0">
                    {(c.name || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold">{c.name || "—"}</span>
                      <span className="text-[12px] text-[var(--app-mute)]">&lt;{c.email}&gt;</span>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusStyles[c.status] || statusStyles.new}`}
                      >
                        {statusLabel(c.status)}
                      </span>
                    </div>
                    <div className="text-[13px] text-[var(--app-mute)] mt-0.5 truncate">
                      <span className="capitalize font-semibold text-[var(--app-ink2)]">{c.subject}</span>
                      {" · "}
                      {c.message}
                    </div>
                  </div>
                  <span className="hidden sm:block text-[12px] text-[var(--app-mute)] shrink-0">
                    {new Date(c.created_at).toLocaleDateString()}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-[var(--app-mute)] transition-transform ${expanded ? "rotate-180" : ""}`}
                  />
                </button>

                {expanded && (
                  <div className="border-t border-[var(--app-edge)] p-4 sm:p-5 bg-[var(--app-panel2)]">
                    <p className="text-[14px] text-[var(--app-ink2)] leading-relaxed whitespace-pre-line">
                      {c.message}
                    </p>
                    <p className="text-[11px] text-[var(--app-mute)] mt-2">
                      {new Date(c.created_at).toLocaleString()}
                    </p>

                    {c.reply && (
                      <div className="mt-4 bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-xl p-3.5">
                        <div className="text-[11px] font-bold text-emerald-400 mb-1.5 flex items-center gap-1.5">
                          <Check size={12} /> {t("adminMessages.replyLabel")}
                          {c.replied_at && (
                            <span className="text-[var(--app-mute)] font-semibold">
                              · {new Date(c.replied_at).toLocaleString()}
                            </span>
                          )}
                        </div>
                        <p className="text-[13px] text-[var(--app-ink2)] leading-relaxed whitespace-pre-line">
                          {c.reply}
                        </p>
                      </div>
                    )}

                    <div className="mt-4 flex flex-col gap-2">
                      <textarea
                        rows="3"
                        value={replyTexts[c.id] || ""}
                        onChange={(e) =>
                          setReplyTexts((prev) => ({ ...prev, [c.id]: e.target.value }))
                        }
                        placeholder={t("adminMessages.replyPlaceholder")}
                        className="w-full bg-[var(--app-panel)] border border-[var(--app-edge2)] rounded-xl px-4 py-3 text-[var(--app-ink)] text-sm outline-none transition-[border-color] duration-200 focus:border-brand/60 resize-none"
                      />
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <button
                          onClick={() => handleReply(c.id)}
                          disabled={sendingId === c.id || !(replyTexts[c.id] || "").trim()}
                          className="inline-flex items-center gap-2 cursor-pointer py-2.5 px-5 text-[13px] font-bold rounded-xl transition-all duration-200 bg-brand hover:bg-brand-hover text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Send size={15} />
                          {sendingId === c.id ? t("adminMessages.sending") : t("adminMessages.sendReply")}
                        </button>
                        {c.status !== "read" && c.status !== "replied" && (
                          <button
                            onClick={() => handleRead(c.id)}
                            className="inline-flex items-center gap-2 cursor-pointer py-2.5 px-5 text-[13px] font-bold rounded-xl transition-all duration-200 bg-[var(--app-fill)] border border-[var(--app-edge2)] text-[var(--app-mute)] hover:text-[var(--app-ink)]"
                          >
                            <MailOpen size={15} /> {t("adminMessages.markRead")}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!loading && contacts.length > 0 && (
        <p className="text-[12px] text-[var(--app-mute)] flex items-center gap-2">
          <Mail size={14} /> {t("adminMessages.footerHint")}
        </p>
      )}
    </div>
  );
}
