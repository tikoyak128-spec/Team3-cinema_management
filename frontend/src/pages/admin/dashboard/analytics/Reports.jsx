import { useState } from "react";
import {
  CalendarDays,
  Download,
  RotateCcw,
  Ticket,
  Users,
  Wallet,
} from "lucide-react";
import { usePrefs } from "../../../../context/PrefsContext";
import Select from "../../../../components/Select";
import { AreaChart, BarChart } from "./charts";

const periods = ["Last 7 days", "Last 30 days", "Last quarter", "This year"];

const periodKey = {
  "Last 7 days": "adminReports.period7",
  "Last 30 days": "adminReports.period30",
  "Last quarter": "adminReports.periodQuarter",
  "This year": "adminReports.periodYear",
};

const dailyRevenue = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  values: [4120, 5380, 4890, 6230, 7410, 8690, 9820],
};

const occupancyByCinema = {
  labels: ["J", "F", "M", "A", "M", "J"],
  values: [58, 64, 61, 71, 69, 78],
};

const summary = [
  { labelKey: "totalRevenue", value: "$46,540", icon: Wallet, color: "#22c55e", sub: "+11.2% vs previous" },
  { labelKey: "totalBookings", value: "1,181", icon: Ticket, color: "#e50914", sub: "+8.4% vs previous" },
  { labelKey: "ticketsSold", value: "1,694", icon: Users, color: "#60a5fa", sub: "+9.1% vs previous" },
  { labelKey: "refunds", value: "$680", icon: RotateCcw, color: "#eab308", sub: "-2.3% vs previous" },
];

const salesRows = [
  { date: "2026-08-30", bookings: 281, tickets: 405, revenue: "$5,240", refunds: "$45", status: "Closed" },
  { date: "2026-08-29", bookings: 257, tickets: 368, revenue: "$4,710", refunds: "$60", status: "Closed" },
  { date: "2026-08-28", bookings: 214, tickets: 302, revenue: "$3,860", refunds: "$35", status: "Closed" },
  { date: "2026-08-27", bookings: 229, tickets: 331, revenue: "$4,160", refunds: "$50", status: "Closed" },
  { date: "2026-08-26", bookings: 200, tickets: 288, revenue: "$3,540", refunds: "$30", status: "Open" },
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

export default function Reports() {
  const { t } = usePrefs();
  const [period, setPeriod] = useState("Last 7 days");

  const handleExportCsv = () => {
    downloadCsv(
      `sales-summary-${salesRows[0]?.date}.csv`,
      salesRows.map((r) => ({
        ...r,
        status: t(r.status === "Closed" ? "adminReports.closed" : "adminReports.open"),
      }))
    );
  };

  return (
    <div className="flex flex-col gap-6 text-[var(--app-ink)] [&_*]:box-border">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-[26px] font-extrabold tracking-wide">{t("admin.reports")}</h1>
          <p className="text-[14px] text-[var(--app-mute)] mt-1">{t("adminReports.subtitle")}</p>
        </div>
        <div className="flex gap-2.5 items-center flex-wrap">
          <button className="inline-flex items-center gap-2 border-none cursor-pointer font-inherit py-[11px] px-5 text-[14px] font-bold rounded-xl transition-all duration-200 bg-transparent text-[var(--app-ink2)] border border-[var(--app-edge2)] hover:bg-[var(--app-fill)] hover:border-[var(--app-edge2)]">
            <CalendarDays size={16} /> {t("adminReports.schedule")}
          </button>
          <button onClick={handleExportCsv} className="inline-flex items-center gap-2 border-none cursor-pointer font-inherit py-[11px] px-5 text-[14px] font-bold rounded-xl transition-all duration-200 bg-[#e50914] text-white shadow-[0_4px_14px_rgba(229,9,20,0.35)] hover:bg-[#f40612] hover:-translate-y-px">
            <Download size={16} /> {t("adminReports.exportCsv")}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 flex-wrap mb-1">
        <div className="flex gap-2.5 flex-wrap items-center">
          <Select containerClassName="relative w-auto" className="bg-[var(--app-panel)] border border-[var(--app-edge)] text-[var(--app-ink2)] font-inherit text-[13px] py-2.5 px-3 rounded-[10px] outline-none cursor-pointer" value={period} onChange={(e) => setPeriod(e.target.value)}>
            {periods.map((p) => (
              <option key={p} value={p}>{t(periodKey[p])}</option>
            ))}
          </Select>
          <span className="text-[14px] text-[var(--app-mute)]">{t("adminReports.periodLabel", { period: t(periodKey[period]) })}</span>
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-[18px]">
        {summary.map((s) => {
          const Icon = s.icon;
          return (
            <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl p-[18px_20px] transition-all duration-200 hover:-translate-y-[3px] hover:border-[rgba(229,9,20,0.4)]" key={s.labelKey}>
              <div className="flex items-center justify-between mb-[14px]">
                <span
                  className="w-[42px] h-[42px] rounded-xl flex items-center justify-center bg-[color-mix(in_srgb,var(--c)_12%,transparent)] text-[var(--c)]"
                  style={{ "--c": s.color }}
                >
                  <Icon size={20} />
                </span>
              </div>
              <div className="text-[26px] font-extrabold tracking-wide">{s.value}</div>
              <div className="text-[13px] text-[var(--app-mute)] mt-1">{t(`adminReports.${s.labelKey}`)}</div>
              <div className="text-[12px] text-[var(--app-mute)] mt-[6px]">{s.sub}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-[18px] max-[1100px]:grid-cols-1">
        <div className="flex flex-col gap-[18px] min-w-0">
          <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl p-5">
            <div className="flex items-center justify-between gap-2.5 flex-wrap mb-[18px]">
              <h3 className="text-[16px] font-extrabold">{t("adminReports.revenueTrend")}</h3>
              <span className="text-[12px] text-[var(--app-mute)] inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#e50914]" />
                {t(periodKey[period])}
              </span>
            </div>
            <div className="w-full">
              <AreaChart
                labels={dailyRevenue.labels}
                values={dailyRevenue.values}
                gradientId="an-rev-grad"
                format={(v) => `$${(v / 1000).toFixed(1)}k`}
              />
            </div>
          </div>

          <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl p-5">
            <div className="flex items-center justify-between gap-2.5 flex-wrap mb-[18px]">
              <h3 className="text-[16px] font-extrabold">{t("adminReports.occupancyByMonth")}</h3>
              <span className="text-[12px] text-[var(--app-mute)] inline-flex items-center gap-1.5">%</span>
            </div>
            <div className="w-full">
              <BarChart
                labels={occupancyByCinema.labels}
                values={occupancyByCinema.values}
                barColor="#60a5fa"
                format={(v) => `${v}%`}
              />
            </div>
          </div>
        </div>

        <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl p-5">
          <div className="flex items-center justify-between gap-2.5 flex-wrap mb-[18px]">
            <h3 className="text-[16px] font-extrabold">{t("adminReports.notes")}</h3>
          </div>
          <div className="flex flex-col gap-4">
            {[
              ["note1T", "note1D"],
              ["note2T", "note2D"],
              ["note3T", "note3D"],
              ["note4T", "note4D"],
            ].map(([titleKey, descKey]) => (
              <div
                key={titleKey}
                className="p-[14px] bg-[var(--app-panel2)] rounded-[12px] border border-[var(--app-edge)]"
              >
                <div className="font-bold text-[13px] text-[#e50914] mb-1">
                  {t(`adminReports.${titleKey}`)}
                </div>
                <div className="text-[13px] text-[var(--app-mute)] leading-[1.5]">{t(`adminReports.${descKey}`)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-2xl overflow-hidden">
        <div className="p-[20px_20px_0]">
          <div className="flex items-center justify-between gap-2.5 flex-wrap mb-0">
            <h3 className="text-[16px] font-extrabold">{t("adminReports.salesSummary")}</h3>
            <span className="text-[12px] text-[var(--app-mute)] inline-flex items-center gap-1.5">{t(periodKey[period])}</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[14px] [&>thead_th]:text-left [&>thead_th]:py-[14px] [&>thead_th]:px-[18px] [&>thead_th]:text-[var(--app-mute)] [&>thead_th]:text-[12px] [&>thead_th]:font-bold [&>thead_th]:uppercase [&>thead_th]:tracking-widest [&>thead_th]:border-b [&>thead_th]:border-[var(--app-edge)] [&>thead_th]:bg-[var(--app-fill)] [&>thead_th]:whitespace-nowrap [&>th]:sticky [&>th]:top-0 [&>th]:z-5 [&>th]:bg-[var(--app-panel)] [&>tbody_td]:py-[14px] [&>tbody_td]:px-[18px] [&>tbody_td]:border-b [&>tbody_td]:border-[var(--app-edge)] [&>tbody_td]:text-[var(--app-ink2)] [&>tbody_td]:align-middle [&>tbody>tr]:transition-colors [&>tbody>tr]:duration-150 [&>tbody>tr:hover]:bg-[var(--app-fill)] [&>tbody>tr:last-child>td]:border-b-0">
            <thead>
              <tr>
                <th>{t("adminReports.date")}</th>
                <th>{t("adminReports.bookings")}</th>
                <th>{t("adminReports.tickets")}</th>
                <th>{t("adminReports.revenue")}</th>
                <th>{t("adminReports.refunds")}</th>
                <th>{t("adminReports.status")}</th>
              </tr>
            </thead>
            <tbody>
              {salesRows.map((r) => (
                <tr key={r.date}>
                  <td>{r.date}</td>
                  <td>{r.bookings}</td>
                  <td>{r.tickets}</td>
                  <td>{r.revenue}</td>
                  <td>{r.refunds}</td>
                  <td>
                    <span className={`inline-flex items-center gap-1.5 py-[5px] px-3 text-[12px] font-bold rounded-[20px] whitespace-nowrap ${r.status === "Closed" ? "bg-[rgba(22,163,74,0.14)] text-[#22c55e] border border-[rgba(34,197,94,0.3)]" : "bg-[rgba(234,179,8,0.14)] text-[#eab308] border border-[rgba(234,179,8,0.3)]"}`}>
                      {t(r.status === "Closed" ? "adminReports.closed" : "adminReports.open")}
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
