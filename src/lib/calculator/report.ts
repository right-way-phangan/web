/**
 * Branded, self-contained investment-analysis report for the ROI calculator.
 *
 * Returns a full standalone HTML document (inline styles + inline SVG chart) so
 * it can be opened in a new window and printed to PDF, or saved/shared as-is —
 * no app CSS, no dependencies. Figures are rendered in the currency the user is
 * viewing; all maths stays in THB upstream. Localised (EN/RU) to match the
 * calculator's language toggle.
 */
import { formatMoney, type Currency } from "@/lib/calculator/currency";
import type { RoiInputs, RoiResult } from "@/lib/calculator/roi";
import { calcDict, type CalcLocale } from "@/lib/i18n/calculator";

interface ReportArgs {
  inputs: RoiInputs;
  result: RoiResult;
  currency: Currency;
  rates: Record<Currency, number>;
  rwNumber?: string;
  /** "My own property" context (bedrooms · district · Airbnb link) if entered. */
  contextLabel?: string;
  locale?: CalcLocale;
}

// Report-only strings not present in the calculator dictionary.
const REPORT_STRINGS = {
  en: {
    analysisTitle: "Investment analysis",
    saveBtn: "Save as PDF / Print",
    assumptions: "Assumptions",
    yearByYear: "Year by year",
    tenure: "Tenure",
    strategy: "Strategy",
    construction: "Construction",
    paymentPlan: "Payment plan",
    postHandover: " (post-handover)",
    highSeason: "High season",
    lowSeason: "Low season",
    horizon: "Horizon",
    more: "more than the bank",
    less: "less than the bank",
    months: "months",
    years: "years",
    planDown: "down",
    planBuild: "build",
    planHandover: "handover",
    rate: "rate",
    occupancyWord: "occupancy",
    perMonth: "/mo",
    indexedYr: "indexed",
  },
  ru: {
    analysisTitle: "Инвестиционный анализ",
    saveBtn: "Сохранить в PDF / Печать",
    assumptions: "Параметры",
    yearByYear: "По годам",
    tenure: "Вид владения",
    strategy: "Стратегия",
    construction: "Строительство",
    paymentPlan: "План оплаты",
    postHandover: " (после сдачи)",
    highSeason: "Высокий сезон",
    lowSeason: "Низкий сезон",
    horizon: "Горизонт",
    more: "больше банка",
    less: "меньше банка",
    months: "мес",
    years: "лет",
    planDown: "взнос",
    planBuild: "стройка",
    planHandover: "сдача",
    rate: "ставка",
    occupancyWord: "загрузка",
    perMonth: "/мес",
    indexedYr: "индексация",
  },
} as const;

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

function pct(n: number): string {
  if (!isFinite(n)) return "—";
  return `${n >= 0 ? "+" : ""}${n.toLocaleString("en-US", { maximumFractionDigits: 1 })}%`;
}

function chartSvg(
  result: RoiResult,
  money: (thb: number) => string,
  mode: "owner" | "asset",
  nowLabel: string,
  yearLabel: (n: number) => string,
): string {
  const W = 720;
  const H = 240;
  const pad = { l: 8, r: 8, t: 14, b: 26 };
  const pts = result.series;
  // "owner" (hold/rent): total return if sold that year (= profit + initial), so
  // it agrees with the "vs bank" figures. "asset" (off-plan): the value ramp.
  const valueOf = (p: (typeof pts)[number]) =>
    mode === "owner" ? p.profit + result.initialInvestment : p.propertyValue;
  const maxV = Math.max(...pts.map((p) => Math.max(valueOf(p), p.bankValue)), 1);
  const n = pts.length - 1 || 1;
  const x = (i: number) => pad.l + (i / n) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - v / maxV) * (H - pad.t - pad.b);
  const propLine = pts.map((p, i) => `${x(i)},${y(valueOf(p))}`).join(" ");
  const bankLine = pts.map((p, i) => `${x(i)},${y(p.bankValue)}`).join(" ");
  const area = `${pad.l},${y(0)} ${propLine} ${x(n)},${y(0)}`;
  const grid = [0.25, 0.5, 0.75]
    .map((f) => `<line x1="${pad.l}" y1="${y(maxV * f)}" x2="${W - pad.r}" y2="${y(maxV * f)}" stroke="#3f4a40" stroke-opacity="0.08" stroke-width="1"/>`)
    .join("");
  return `
    <svg viewBox="0 0 ${W} ${H}" width="100%" preserveAspectRatio="xMidYMid meet" style="height:200px">
      <defs>
        <linearGradient id="pf" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#B5651D" stop-opacity="0.18"/>
          <stop offset="100%" stop-color="#B5651D" stop-opacity="0"/>
        </linearGradient>
      </defs>
      ${grid}
      <polygon points="${area}" fill="url(#pf)"/>
      <polyline points="${bankLine}" fill="none" stroke="#3f4a40" stroke-opacity="0.35" stroke-width="2" stroke-dasharray="5 4"/>
      <polyline points="${propLine}" fill="none" stroke="#B5651D" stroke-width="2.5"/>
    </svg>
    <div style="display:flex;justify-content:space-between;font-size:11px;color:#6b7a6e;margin-top:6px">
      <span>${esc(nowLabel)} · ${money(valueOf(pts[0]))}</span>
      <span style="color:#B5651D">${esc(yearLabel(n))} · ${money(valueOf(pts[n]))}</span>
    </div>`;
}

export function buildCalcReportHtml({ inputs, result, currency, rates, rwNumber, contextLabel, locale = "en" }: ReportArgs): string {
  const t = calcDict(locale);
  const R = REPORT_STRINGS[locale];
  const money = (thb: number, full = false) => formatMoney(thb, currency, rates, { compact: !full });
  const isOffplan = inputs.offplan;
  const isRent = (inputs.mode === "rent" && !isOffplan) || (isOffplan && inputs.rentAfterHandover);
  const isLeasehold = inputs.tenure === "leasehold";
  const installmentPct = Math.max(0, 100 - inputs.downPaymentPct - inputs.handoverPaymentPct);
  const today = new Date().toLocaleDateString(locale === "ru" ? "ru-RU" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const row = (label: string, value: string) =>
    `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #ece7da"><span style="color:#6b7a6e">${esc(label)}</span><span style="color:#172534;font-weight:500">${esc(value)}</span></div>`;

  const kpi = (label: string, value: string, accent = false) =>
    `<div><div style="font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#8a978c">${esc(label)}</div><div style="font-family:Georgia,serif;font-size:22px;margin-top:4px;color:${accent ? "#B5651D" : "#172534"}">${esc(value)}</div></div>`;

  const tenureValue = isLeasehold
    ? `${t.leasehold} · ${inputs.leaseTermYears} ${R.years}${inputs.leaseRenewable ? " (+)" : ""}`
    : t.freehold;
  const strategyValue = isOffplan ? t.offplan : inputs.mode === "rent" ? t.buyRent : t.buyHold;

  const isLtRent = isRent && inputs.longTermRent;
  const assumptions = [
    row(R.tenure, tenureValue),
    isLeasehold && inputs.leaseMonthly
      ? row(t.leaseMonthlyRate, `${money(inputs.leaseMonthlyThb, true)}${R.perMonth} · +${inputs.leaseIndexationPct}% ${R.indexedYr}`)
      : "",
    row(R.strategy, strategyValue),
    row(isOffplan ? t.contractPrice : t.purchasePrice, money(inputs.purchasePriceThb, true)),
    isOffplan ? row(R.construction, `${inputs.constructionMonths} ${R.months}`) : "",
    isOffplan
      ? row(R.paymentPlan, `${inputs.downPaymentPct}% ${R.planDown} · ${installmentPct.toFixed(0)}% ${R.planBuild} · ${inputs.handoverPaymentPct}% ${R.planHandover}`)
      : "",
    isOffplan ? row(t.valueAtHandover, `${money(result.handoverValue, true)} (+${inputs.handoverUpliftPct}%)`) : "",
    row(t.growthLabel, `${inputs.annualGrowthPct}%${isOffplan ? R.postHandover : ""}`),
    row(isOffplan ? R.horizon : t.holdingPeriod, `${inputs.years} ${R.years}`),
    isLtRent ? row(t.monthlyRent, `${money(inputs.monthlyRentThb, true)}${R.perMonth}`) : "",
    isRent && !isLtRent ? row(t.nightlyRate, money(inputs.nightlyRateThb, true)) : "",
    isRent && (isLtRent || !inputs.seasonality) ? row(t.occupancy, `${inputs.occupancyPct}%`) : "",
    isRent && !isLtRent && inputs.seasonality
      ? row(R.highSeason, `${inputs.highSeasonMonths}${R.months} @ ${inputs.highSeasonOccupancyPct}% · +${inputs.highSeasonRateUpliftPct}% ${R.rate}`)
      : "",
    isRent && !isLtRent && inputs.seasonality ? row(R.lowSeason, `${inputs.lowSeasonOccupancyPct}% ${R.occupancyWord}`) : "",
    isRent ? row(t.mgmtFee, `${inputs.mgmtFeePct}%`) : "",
  ].join("");

  const yearRows = result.series
    .slice(1)
    .map(
      (p) =>
        `<tr><td style="padding:5px 8px;color:#6b7a6e">${p.year}</td><td style="padding:5px 8px;text-align:right;color:#172534">${esc(money(p.propertyValue))}</td>${
          isRent ? `<td style="padding:5px 8px;text-align:right;color:#172534">${esc(money(p.rentNet))}</td>` : ""
        }<td style="padding:5px 8px;text-align:right;color:#172534">${esc(money(p.profit))}</td></tr>`,
    )
    .join("");

  const extraKpis = isOffplan
    ? `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:14px;padding-top:14px;border-top:1px solid #ece7da">
         ${kpi(t.valueAtHandover, money(result.handoverValue))}
         ${kpi(t.irrYear, pct(result.irrPct), true)}
         ${kpi(t.totalInvested, money(result.initialInvestment))}
       </div>`
    : isRent
      ? `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:18px;margin-top:14px;padding-top:14px;border-top:1px solid #ece7da">
           ${kpi(t.capRate, pct(result.capRatePct))}
           ${kpi(t.cashOnCash, pct(result.cashOnCashPct))}
           ${kpi(t.grossYield, pct(result.grossYieldPct))}
           ${kpi(t.irrYear, pct(result.irrPct))}
         </div>`
      : "";

  const leaseNote = isLeasehold && !inputs.leaseRenewable ? ` ${t.disclaimerLease}` : "";

  return `<!doctype html><html lang="${locale}"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Right Way — ${esc(R.analysisTitle)}${rwNumber ? ` · ${esc(rwNumber)}` : ""}</title>
<style>
  @page { margin: 18mm; }
  * { box-sizing: border-box; }
  body { margin:0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color:#172534; background:#fffdf8; }
  .wrap { max-width: 820px; margin: 0 auto; padding: 32px 28px; }
  .brand { font-family: Georgia, serif; font-size: 20px; letter-spacing:.02em; }
  .brand span { color:#B5651D; }
  .muted { color:#8a978c; }
  h2 { font-family: Georgia, serif; font-weight: normal; color:#172534; }
  .card { border:1px solid #ece7da; border-radius:6px; padding:20px; margin-top:20px; }
  table { width:100%; border-collapse:collapse; font-size:13px; margin-top:10px; }
  thead td { font-size:10px; text-transform:uppercase; letter-spacing:.06em; color:#8a978c; border-bottom:1px solid #ece7da; padding:5px 8px; }
  tbody tr { border-bottom:1px solid #f3efe4; }
  .print-hint { text-align:center; margin:20px 0; }
  .print-hint button { background:#172534; color:#fffdf8; border:none; border-radius:5px; padding:10px 20px; font-size:14px; cursor:pointer; }
  @media print { .print-hint { display:none; } body { background:#fff; } }
</style></head>
<body><div class="wrap">

  <div class="print-hint"><button onclick="window.print()">${esc(R.saveBtn)}</button></div>

  <div style="display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid #172534;padding-bottom:12px">
    <div>
      <div class="brand">Right Way <span>Phangan</span></div>
      <div class="muted" style="font-size:12px;margin-top:2px">${esc(R.analysisTitle)}${rwNumber ? ` · ${esc(rwNumber)}` : ""}</div>
      ${contextLabel ? `<div class="muted" style="font-size:12px;margin-top:2px">${esc(contextLabel)}</div>` : ""}
    </div>
    <div class="muted" style="font-size:12px">${esc(today)}</div>
  </div>

  <div class="card" style="margin-top:24px">
    <div style="font-size:10px;text-transform:uppercase;letter-spacing:.12em;color:#B5651D">${esc(t.projectedValueIn(inputs.years))}</div>
    <div style="font-family:Georgia,serif;font-size:40px;margin-top:6px">${esc(money(result.projectedValue, true))}</div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:16px;padding-top:16px;border-top:1px solid #ece7da">
      ${kpi(t.totalRoi, pct(result.roiPct), true)}
      ${kpi(t.cagrYear, pct(result.cagrPct))}
      ${kpi(t.netProfit, money(result.netProfit))}
    </div>
    ${extraKpis}
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:20px">
    <div class="card" style="margin-top:0">
      <h2 style="font-size:16px;margin:0 0 8px">${esc(R.assumptions)}</h2>
      <div style="font-size:13px">${assumptions}</div>
    </div>
    <div class="card" style="margin-top:0">
      <h2 style="font-size:16px;margin:0 0 8px">${esc(t.vsBank)} (${inputs.bankRatePct}%)</h2>
      <div style="font-size:13px">
        ${row(t.legendBank, money(result.bankFinal, true))}
        ${row(t.thisProperty, money(result.totalReturn, true))}
      </div>
      <div style="font-family:Georgia,serif;font-size:17px;margin-top:12px;color:#172534">
        <span style="color:#B5651D">${esc(money(result.vsBankThb))}</span> ${esc(result.vsBankThb >= 0 ? R.more : R.less)}
      </div>
    </div>
  </div>

  <div class="card">
    <h2 style="font-size:16px;margin:0 0 4px">${esc(isOffplan && !inputs.rentAfterHandover ? t.capitalGrowth : t.returnVsBankTitle)}</h2>
    ${chartSvg(result, (thb) => money(thb), isOffplan && !inputs.rentAfterHandover ? "asset" : "owner", t.now, t.yearN)}
  </div>

  <div class="card">
    <h2 style="font-size:16px;margin:0 0 4px">${esc(R.yearByYear)}</h2>
    <table>
      <thead><tr><td>${esc(t.thYear)}</td><td style="text-align:right">${esc(t.thValue)}</td>${isRent ? `<td style="text-align:right">${esc(t.thNetRent)}</td>` : ""}<td style="text-align:right">${esc(t.thCumProfit)}</td></tr></thead>
      <tbody>${yearRows}</tbody>
    </table>
  </div>

  <div style="margin-top:28px;padding-top:16px;border-top:1px solid #ece7da;font-size:11px;color:#8a978c;line-height:1.6">
    <strong style="color:#172534">Right Way Phangan</strong> · hello@rightwaygroup.co · rightwaygroup.co<br>
    ${esc(t.disclaimerMain)}${esc(leaseNote)} ${esc(t.disclaimerCurrency)}
  </div>

</div></body></html>`;
}
