/**
 * Branded, self-contained investment-analysis report for the ROI calculator.
 *
 * Returns a full standalone HTML document (inline styles + inline SVG chart) so
 * it can be opened in a new window and printed to PDF, or saved/shared as-is —
 * no app CSS, no dependencies. Figures are rendered in the currency the user is
 * viewing; all maths stays in THB upstream.
 */
import { formatMoney, type Currency } from "@/lib/calculator/currency";
import type { RoiInputs, RoiResult } from "@/lib/calculator/roi";

interface ReportArgs {
  inputs: RoiInputs;
  result: RoiResult;
  currency: Currency;
  rates: Record<Currency, number>;
  rwNumber?: string;
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

function pct(n: number): string {
  if (!isFinite(n)) return "—";
  return `${n >= 0 ? "+" : ""}${n.toLocaleString("en-US", { maximumFractionDigits: 1 })}%`;
}

function chartSvg(result: RoiResult, money: (thb: number) => string): string {
  const W = 720;
  const H = 240;
  const pad = { l: 8, r: 8, t: 14, b: 26 };
  const pts = result.series;
  const maxV = Math.max(...pts.map((p) => Math.max(p.propertyValue, p.bankValue)), 1);
  const n = pts.length - 1 || 1;
  const x = (i: number) => pad.l + (i / n) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - v / maxV) * (H - pad.t - pad.b);
  const line = (sel: (p: (typeof pts)[number]) => number) => pts.map((p, i) => `${x(i)},${y(sel(p))}`).join(" ");
  const propLine = line((p) => p.propertyValue);
  const area = `${pad.l},${y(0)} ${propLine} ${x(n)},${y(0)}`;
  return `
    <svg viewBox="0 0 ${W} ${H}" width="100%" preserveAspectRatio="none" style="height:200px">
      <defs>
        <linearGradient id="pf" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#B5651D" stop-opacity="0.18"/>
          <stop offset="100%" stop-color="#B5651D" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <polygon points="${area}" fill="url(#pf)"/>
      <polyline points="${line((p) => p.bankValue)}" fill="none" stroke="#3f4a40" stroke-opacity="0.35" stroke-width="2" stroke-dasharray="5 4"/>
      <polyline points="${propLine}" fill="none" stroke="#B5651D" stroke-width="2.5"/>
    </svg>
    <div style="display:flex;justify-content:space-between;font-size:11px;color:#6b7a6e;margin-top:6px">
      <span>Now · ${money(pts[0].propertyValue)}</span>
      <span style="color:#B5651D">Year ${n} · ${money(pts[n].propertyValue)}</span>
    </div>`;
}

export function buildCalcReportHtml({ inputs, result, currency, rates, rwNumber }: ReportArgs): string {
  const money = (thb: number, full = false) => formatMoney(thb, currency, rates, { compact: !full });
  const isRent = inputs.mode === "rent";
  const isLeasehold = inputs.tenure === "leasehold";
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  const row = (label: string, value: string) =>
    `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #ece7da"><span style="color:#6b7a6e">${esc(label)}</span><span style="color:#172534;font-weight:500">${esc(value)}</span></div>`;

  const kpi = (label: string, value: string, accent = false) =>
    `<div><div style="font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#8a978c">${esc(label)}</div><div style="font-family:Georgia,serif;font-size:22px;margin-top:4px;color:${accent ? "#B5651D" : "#172534"}">${esc(value)}</div></div>`;

  const assumptions = [
    row("Tenure", isLeasehold ? `Leasehold · ${inputs.leaseTermYears}-yr term` : "Freehold"),
    row("Strategy", isRent ? "Buy & Rent" : "Buy & Hold"),
    row("Purchase price", money(inputs.purchasePriceThb, true)),
    row("Expected annual price growth", `${inputs.annualGrowthPct}%`),
    row("Holding period", `${inputs.years} years`),
    isRent ? row("Nightly rate", money(inputs.nightlyRateThb, true)) : "",
    isRent ? row("Occupancy", `${inputs.occupancyPct}%`) : "",
    isRent ? row("Management fee", `${inputs.mgmtFeePct}% of rent`) : "",
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

  const rentKpis = isRent
    ? `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:14px;padding-top:14px;border-top:1px solid #ece7da">
         ${kpi("Cap rate", pct(result.capRatePct))}
         ${kpi("Cash-on-cash", pct(result.cashOnCashPct))}
         ${kpi("IRR / year", pct(result.irrPct))}
       </div>`
    : "";

  const leaseNote = isLeasehold
    ? " Leasehold value is discounted by the remaining lease term (a simplified linear model)."
    : "";

  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Right Way — Investment analysis${rwNumber ? ` · ${esc(rwNumber)}` : ""}</title>
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

  <div class="print-hint"><button onclick="window.print()">Save as PDF / Print</button></div>

  <div style="display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid #172534;padding-bottom:12px">
    <div>
      <div class="brand">Right Way <span>Phangan</span></div>
      <div class="muted" style="font-size:12px;margin-top:2px">Investment analysis${rwNumber ? ` · ${esc(rwNumber)}` : ""}</div>
    </div>
    <div class="muted" style="font-size:12px">${esc(today)}</div>
  </div>

  <div class="card" style="margin-top:24px">
    <div style="font-size:10px;text-transform:uppercase;letter-spacing:.12em;color:#B5651D">Projected value in ${inputs.years} years</div>
    <div style="font-family:Georgia,serif;font-size:40px;margin-top:6px">${esc(money(result.projectedValue, true))}</div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:16px;padding-top:16px;border-top:1px solid #ece7da">
      ${kpi("Total ROI", pct(result.roiPct), true)}
      ${kpi("CAGR / year", pct(result.cagrPct))}
      ${kpi("Net profit", money(result.netProfit))}
    </div>
    ${rentKpis}
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:20px">
    <div class="card" style="margin-top:0">
      <h2 style="font-size:16px;margin:0 0 8px">Assumptions</h2>
      <div style="font-size:13px">${assumptions}</div>
    </div>
    <div class="card" style="margin-top:0">
      <h2 style="font-size:16px;margin:0 0 8px">vs a bank deposit (${inputs.bankRatePct}%)</h2>
      <div style="font-size:13px">
        ${row("Bank deposit", money(result.bankFinal, true))}
        ${row("This property", money(result.totalReturn, true))}
      </div>
      <div style="font-family:Georgia,serif;font-size:17px;margin-top:12px;color:#172534">
        <span style="color:#B5651D">${esc(money(result.vsBankThb))}</span> ${result.vsBankThb >= 0 ? "more" : "less"} than the bank
      </div>
    </div>
  </div>

  <div class="card">
    <h2 style="font-size:16px;margin:0 0 4px">Capital growth</h2>
    ${chartSvg(result, (t) => money(t))}
  </div>

  <div class="card">
    <h2 style="font-size:16px;margin:0 0 4px">Year by year</h2>
    <table>
      <thead><tr><td>Year</td><td style="text-align:right">Value</td>${isRent ? "<td style=\"text-align:right\">Net rent</td>" : ""}<td style="text-align:right">Cumulative profit</td></tr></thead>
      <tbody>${yearRows}</tbody>
    </table>
  </div>

  <div style="margin-top:28px;padding-top:16px;border-top:1px solid #ece7da;font-size:11px;color:#8a978c;line-height:1.6">
    <strong style="color:#172534">Right Way Phangan</strong> · hello@rightwaygroup.co · rightwaygroup.co<br>
    Illustrative projection based on the assumptions above — not a forecast or guarantee of future returns.${leaseNote}
    Currency conversion is for display only; figures are computed in THB. Speak with Right Way for a property-specific assessment.
  </div>

</div></body></html>`;
}
