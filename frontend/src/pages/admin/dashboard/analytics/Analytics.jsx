import { useState } from "react";
import {
  Clapperboard,
  Download,
  Ticket,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { usePrefs } from "../../../../context/PrefsContext";
import { AreaChart, DonutChart } from "./charts";

const periods = ["This Week", "This Month", "This Year"];

const periodKey = {
  "This Week": "adminAnalytics.periodWeek",
  "This Month": "adminAnalytics.periodMonth",
  "This Year": "adminAnalytics.periodYear",
};

const revenueSeries = {
  "This Week": {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    values: [34, 42, 38, 51, 60, 74, 86],
  },
  "This Month": {
    labels: ["Wk 1", "Wk 2", "Wk 3", "Wk 4", "Wk 5", "Wk 6", "Wk 7"],
    values: [152, 184, 221, 199, 264, 301, 348],
  },
  "This Year": {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    values: [1210, 1330, 1160, 1420, 1560, 1690, 1830],
  },
};

const kpis = [
  { labelKey: "totalRevenue", value: "$48,290", delta: "+12.4%", up: true, icon: Wallet, color: "#22c55e" },
  { labelKey: "ticketsSold", value: "3,842", delta: "+8.1%", up: true, icon: Ticket, color: "#60a5fa" },
  { labelKey: "avgOccupancy", value: "72%", delta: "+3.2%", up: true, icon: Users, color: "#eab308" },
  { labelKey: "avgTicketPrice", value: "$12.57", delta: "-1.8%", up: false, icon: Clapperboard, color: "#e50914" },
];

const genres = [
  { name: "Action", value: 480, color: "#e50914" },
  { name: "Drama", value: 320, color: "#60a5fa" },
  { name: "Comedy", value: 210, color: "#eab308" },
  { name: "Romance", value: 140, color: "#22c55e" },
  { name: "Sci-Fi", value: 90, color: "#a78bfa" },
];

const cinemaBars = [
  { name: "Phnom Penh", value: 1240, color: "#e50914" },
  { name: "Riverside", value: 980, color: "#60a5fa" },
  { name: "Olympia", value: 820, color: "#eab308" },
  { name: "Siem Reap", value: 610, color: "#22c55e" },
];

const topFilms = [
  { rank: 1, title: "The Last Emperor", genre: "Action", revenue: "$12.8k", occ: 92, color: "#e50914" },
  { rank: 2, title: "City of Shadows", genre: "Thriller", revenue: "$9.6k", occ: 84, color: "#60a5fa" },
  { rank: 3, title: "Golden Dawn", genre: "Drama", revenue: "$7.6k", occ: 78, color: "#eab308" },
  { rank: 4, title: "Age of Wonders", genre: "Sci-Fi", revenue: "$5.9k", occ: 71, color: "#22c55e" },
  { rank: 5, title: "Midnight Express", genre: "Mystery", revenue: "$4.5k", occ: 64, color: "#a78bfa" },
];

const dailyBookings = [
  { date: "2026-08-28", bookings: 214, tickets: 302, occupancy: "68%", revenue: "$3,860", status: "Completed" },
  { date: "2026-08-29", bookings: 257, tickets: 368, occupancy: "74%", revenue: "$4,710", status: "Completed" },
  { date: "2026-08-30", bookings: 281, tickets: 405, occupancy: "79%", revenue: "$5,240", status: "Completed" },
  { date: "2026-08-31", bookings: 233, tickets: 341, occupancy: "71%", revenue: "$4,390", status: "Completed" },
  { date: "2026-09-01", bookings: 196, tickets: 278, occupancy: "63%", revenue: "$3,610", status: "Pending" },
];

function downloadCsv(fileName, rows) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((r) =>
      headers.map((h) => `"${String(r[h]).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function Analytics() {
  const { t } = usePrefs();
  const [period, setPeriod] = useState("This Week");
  const series = revenueSeries[period];
  const total = 100;
  const maxBar = Math.max(...cinemaBars.map((c) => c.value));

  const handleExportCsv = () => {
    downloadCsv(
      `analytics-${period.toLowerCase().replace(/\s+/g, "-")}.csv`,
      dailyBookings.map((r) => ({
        ...r,
        status: t(r.status === "Completed" ? "adminAnalytics.completed" : "adminAnalytics.pending"),
      }))
    );
  };

  return (
    <div className="flex flex-col gap-6 text-[var(--app-ink)] [&_*]:box-border">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-[26px] font-extrabold tracking-wide">{t("admin.analytics")}</h1>
          <p className="text-[14px] text-[var(--app-mute)] mt-1">{t("adminAnalytics.subtitle")}</p>
        </div>
        <div className="flex gap-2.5 items-center flex-wrap">
          <div className="inline-flex bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-xl p-1 gap-1">
            {periods.map((p) => (
              <button
                key={p}
                className={`border-none bg-transparent font-inherit text-[13px] font-semibold py-2 px-3.5 rounded-[9px] cursor-pointer transition-all duration-200 ${
                  period === p
                    ? "bg-[#e50914] text-gray-800 dark:text-white shadow-[0_4px_12px_rgba(229,9,20,0.35)]"
                    : "text-[var(--app-mute)] hover:text-[var(--app-ink)]"
                }`}
                onClick={() => setPeriod(p)}
              >
                {t(periodKey[p])}
              </button>
            ))}
          </div>
          <button onClick={handleExportCsv} className="inline-flex items-center gap-2 border-none cursor-pointer font-inherit py-[11px] px-5 text-[14px] font-bold rounded-xl transition-all duration-200 bg-[#e50914] text-white shadow-[0_4px_14px_rgba(229,9,20,0.35)] hover:bg-[#f40612] hover:-translate-y-px">
            <Download size={16} /> {t("adminAnalytics.export")}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-[18px]">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl p-[18px_20px] transition-all duration-200 hover:-translate-y-[3px] hover:border-[rgba(229,9,20,0.4)]" key={k.labelKey}>
              <div className="flex items-center justify-between mb-[14px]">
                <span
                  className="w-[42px] h-[42px] rounded-xl flex items-center justify-center bg-[color-mix(in_srgb,var(--c)_12%,transparent)] text-[var(--c)]"
                  style={{ "--c": k.color }}
                >
                  <Icon size={20} />
                </span>
                <span className={`inline-flex items-center gap-1 text-[12px] font-bold py-[5px] px-2.5 rounded-full ${k.up ? "text-[#22c55e] bg-[rgba(34,197,94,0.12)]" : "text-[#ef4444] bg-[rgba(239,68,68,0.12)]"}`}>
                  {k.up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {k.delta}
                </span>
              </div>
              <div className="text-[26px] font-extrabold tracking-wide">{k.value}</div>
              <div className="text-[13px] text-[var(--app-mute)] mt-1">{t(`adminAnalytics.${k.labelKey}`)}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-[18px] max-[1100px]:grid-cols-1">
        <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl p-5">
          <div className="flex items-center justify-between gap-2.5 flex-wrap mb-[18px]">
            <h3 className="text-[16px] font-extrabold">{t("adminAnalytics.revenueOverview")}</h3>
            <span className="text-[12px] text-[var(--app-mute)] inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#e50914]" />
              {t(periodKey[period])} · USD
            </span>
          </div>
          <div className="w-full">
            <AreaChart labels={series.labels} values={series.values} format={(v) => `$${v.toFixed(1)}k`} />
          </div>
        </div>

        <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl p-5">
          <div className="flex items-center justify-between gap-2.5 flex-wrap mb-[18px]">
            <h3 className="text-[16px] font-extrabold">{t("adminAnalytics.genreShare")}</h3>
          </div>
          <div className="flex items-center gap-6 flex-wrap">
            <DonutChart data={genres} centerValue="1,240" centerLabel={t("adminAnalytics.tickets")} />
            <div className="flex flex-col gap-2.5 flex-1 min-w-[150px]">
              {genres.map((g) => (
                <div className="flex items-center gap-2.5 text-[13px]" key={g.name}>
                  <span className="w-3 h-3 rounded shrink-0 bg-[var(--c)]" style={{ "--c": g.color }} />
                  <span className="text-[var(--app-ink2)] flex-1">{g.name}</span>
                  <span className="text-[var(--app-mute)] text-[12px]">{Math.round((g.value / total) * 100)}%</span>
                  <span className="font-bold">{g.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-[18px] max-[1100px]:grid-cols-1">
        <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl p-5">
          <div className="flex items-center justify-between gap-2.5 flex-wrap mb-[18px]">
            <h3 className="text-[16px] font-extrabold">{t("adminAnalytics.ticketsByCinema")}</h3>
            <span className="text-[12px] text-[var(--app-mute)] inline-flex items-center gap-1.5">{t(periodKey[period])}</span>
          </div>
          <div className="flex flex-col gap-4">
            {cinemaBars.map((c) => (
              <div className="flex items-center gap-3" key={c.name}>
                <span className="w-[148px] text-[13px] text-[var(--app-ink2)] shrink-0 whitespace-nowrap overflow-hidden text-ellipsis">{c.name}</span>
                <div className="flex-1 h-[10px] bg-[var(--app-panel2)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-[400ms] ease-in-out w-[var(--w)] bg-[var(--c)]"
                    style={{ "--w": `${(c.value / maxBar) * 100}%`, "--c": c.color }}
                  />
                </div>
                <span className="w-14 text-right text-[13px] font-bold text-[var(--app-mute)]">{c.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl p-5">
          <div className="flex items-center justify-between gap-2.5 flex-wrap mb-[18px]">
            <h3 className="text-[16px] font-extrabold">{t("adminAnalytics.topFilms")}</h3>
            <span className="text-[12px] text-[var(--app-mute)] inline-flex items-center gap-1.5">{t("adminAnalytics.byRevenue")}</span>
          </div>
          <div className="flex flex-col gap-[14px]">
            {topFilms.map((f) => (
              <div className="flex items-center gap-3" key={f.title}>
                <span className="w-7 h-7 rounded-[9px] bg-[rgba(229,9,20,0.12)] text-[#e50914] text-[12px] font-extrabold flex items-center justify-center shrink-0">{f.rank}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-bold whitespace-nowrap overflow-hidden text-ellipsis">{f.title}</div>
                  <div className="text-[12px] text-[var(--app-mute)] mt-[2px]">
                    {f.genre} · {f.revenue}
                  </div>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="w-24 h-[7px] bg-[var(--app-panel2)] rounded-full overflow-hidden">
                    <span
                      className="h-full rounded-full block w-[var(--w)] bg-[var(--c)]"
                      style={{ "--w": `${f.occ}%`, "--c": f.color }}
                    />
                  </span>
                  <span className="w-[42px] text-right text-[12px] font-bold text-[var(--app-mute)]">{f.occ}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[14px] [&>thead_th]:text-left [&>thead_th]:py-[14px] [&>thead_th]:px-[18px] [&>thead_th]:text-[var(--app-mute)] [&>thead_th]:text-[12px] [&>thead_th]:font-bold [&>thead_th]:uppercase [&>thead_th]:tracking-widest [&>thead_th]:border-b [&>thead_th]:border-[var(--app-edge)] [&>thead_th]:bg-[var(--app-fill)] [&>thead_th]:whitespace-nowrap [&>th]:sticky [&>th]:top-0 [&>th]:z-5 [&>th]:bg-[var(--app-panel)] [&>tbody_td]:py-[14px] [&>tbody_td]:px-[18px] [&>tbody_td]:border-b [&>tbody_td]:border-[var(--app-edge)] [&>tbody_td]:text-[var(--app-ink2)] [&>tbody_td]:align-middle [&>tbody>tr]:transition-colors [&>tbody>tr]:duration-150 [&>tbody>tr:hover]:bg-[var(--app-fill)] [&>tbody>tr:last-child>td]:border-b-0">
            <thead>
              <tr>
                <th>{t("adminAnalytics.date")}</th>
                <th>{t("adminAnalytics.bookings")}</th>
                <th>{t("adminAnalytics.tickets")}</th>
                <th>{t("adminAnalytics.occupancy")}</th>
                <th>{t("adminAnalytics.revenue")}</th>
                <th>{t("adminAnalytics.status")}</th>
              </tr>
            </thead>
            <tbody>
              {dailyBookings.map((d) => (
                <tr key={d.date}>
                  <td>{d.date}</td>
                  <td>{d.bookings}</td>
                  <td>{d.tickets}</td>
                  <td>{d.occupancy}</td>
                  <td>{d.revenue}</td>
                  <td>
                    <span className={`inline-flex items-center gap-1.5 py-[5px] px-3 text-[12px] font-bold rounded-[20px] whitespace-nowrap ${d.status === "Completed" ? "bg-[rgba(22,163,74,0.14)] text-[#22c55e] border border-[rgba(34,197,94,0.3)]" : "bg-[rgba(234,179,8,0.14)] text-[#eab308] border border-[rgba(234,179,8,0.3)]"}`}>
                      {t(d.status === "Completed" ? "adminAnalytics.completed" : "adminAnalytics.pending")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
