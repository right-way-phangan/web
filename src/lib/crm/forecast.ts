import type { CrmLead } from "@/lib/data/leads";

/**
 * Win probability by pipeline stage — weights the open pipeline into an honest
 * expected-revenue forecast. A brand-new lead and a deal on reservation are
 * both "open money", but worth very different amounts; summing dealValue flat
 * (as the old Pipeline card did) overstates the book. Keys are the shared
 * working-pipeline stage keys (land + villa_house); legacy stages map low.
 *
 * Numbers are deliberate priors, not fitted — revisit once enough deals close
 * to calibrate against real stage→won rates (see the funnel on /admin/crm/stats).
 */
export const STAGE_WIN_PROBABILITY: Record<string, number> = {
  incoming: 0.05,
  contacted: 0.1,
  qualified: 0.2,
  viewing: 0.35,
  negotiation: 0.5,
  reservation: 0.7,
  dd: 0.8,
  spa: 0.9,
  transfer: 0.95,
  won: 1,
  lost: 0,
  // legacy «Разбор»
  revived: 0.1,
  dead: 0,
};

export function stageProbability(stageKey?: string | null): number {
  if (!stageKey) return 0.05;
  return STAGE_WIN_PROBABILITY[stageKey] ?? 0.1;
}

/**
 * Seller-paid commission estimate from a deal size — max(5%; 150 000 THB), the
 * fixed model. Approximate: the real leasehold base is lease prepayment +
 * building, but the lead only carries an expected deal value; good enough to
 * forecast money. Zero when no value is set (can't guess).
 */
export const COMMISSION_RATE = 0.05;
export const COMMISSION_FLOOR = 150_000;
export function estimateCommission(dealValue?: number | null): number {
  const v = dealValue ?? 0;
  if (v <= 0) return 0;
  return Math.max(v * COMMISSION_RATE, COMMISSION_FLOOR);
}

export interface ForecastRow {
  stageKey: string;
  probability: number;
  count: number;
  gmv: number;
  weightedCommission: number;
}

export interface Forecast {
  /** Raw sum of dealValue across open leads (GMV in the book). */
  gmv: number;
  /** Σ dealValue × P(stage) — probability-weighted deal volume. */
  weightedGmv: number;
  /** Raw sum of estimated commission across open leads. */
  commission: number;
  /** Σ estCommission × P(stage) — the honest "what we'll actually earn" number. */
  weightedCommission: number;
  /** How many open leads carry a dealValue (the rest can't be forecast). */
  withValue: number;
  /** Total open leads considered. */
  open: number;
  /** Per-stage breakdown, ordered by the caller's stage order. */
  byStage: ForecastRow[];
}

export interface MonthBucket {
  /** "YYYY-MM" for dated buckets; "none" / "later" for the catch-alls. */
  key: string;
  label: string;
  count: number;
  weightedCommission: number;
}

/**
 * Expected-revenue calendar: weighted commission grouped by the deal's expected
 * close month. Leads close in time, not just "in the pipeline" — this answers
 * «сколько прилетит в июле». Open leads with an `expectedCloseAt` fall into
 * their month (next `monthsAhead`); past-due-but-open months collapse into the
 * nearest current month; further-out → «позже»; no date → «без даты».
 */
export function forecastByMonth(
  openLeads: Pick<CrmLead, "dealValue" | "stageKey" | "expectedCloseAt">[],
  monthsAhead = 6,
  now: Date = new Date(),
): MonthBucket[] {
  const monthFmt = new Intl.DateTimeFormat("ru-RU", { month: "long", year: "numeric" });
  const startY = now.getFullYear();
  const startM = now.getMonth();
  const months: MonthBucket[] = [];
  const idxByKey = new Map<string, number>();
  for (let i = 0; i < monthsAhead; i++) {
    const d = new Date(startY, startM + i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    idxByKey.set(key, months.length);
    months.push({ key, label: monthFmt.format(d), count: 0, weightedCommission: 0 });
  }
  const later: MonthBucket = { key: "later", label: "Позже", count: 0, weightedCommission: 0 };
  const none: MonthBucket = { key: "none", label: "Без даты", count: 0, weightedCommission: 0 };
  const firstKey = months[0]?.key;

  for (const l of openLeads) {
    const wc = estimateCommission(l.dealValue) * stageProbability(l.stageKey);
    let bucket = none;
    if (l.expectedCloseAt) {
      const d = new Date(l.expectedCloseAt);
      if (!Number.isNaN(d.getTime())) {
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (idxByKey.has(key)) bucket = months[idxByKey.get(key)!];
        else if (firstKey && key < firstKey) bucket = months[0]; // просрочено, но открыто → текущий месяц
        else bucket = later;
      }
    }
    bucket.count += 1;
    bucket.weightedCommission += wc;
  }
  return [...months, later, none].filter((b) => b.count > 0);
}

export function forecastPipeline(
  openLeads: Pick<CrmLead, "dealValue" | "stageKey">[],
  stageOrder: string[],
): Forecast {
  const rows = new Map<string, ForecastRow>();
  let gmv = 0;
  let weightedGmv = 0;
  let commission = 0;
  let weightedCommission = 0;
  let withValue = 0;

  for (const l of openLeads) {
    const p = stageProbability(l.stageKey);
    const v = l.dealValue ?? 0;
    const c = estimateCommission(v);
    if (v > 0) withValue++;
    gmv += v;
    weightedGmv += v * p;
    commission += c;
    weightedCommission += c * p;

    const key = l.stageKey ?? "—";
    const row = rows.get(key) ?? {
      stageKey: key,
      probability: p,
      count: 0,
      gmv: 0,
      weightedCommission: 0,
    };
    row.count += 1;
    row.gmv += v;
    row.weightedCommission += c * p;
    rows.set(key, row);
  }

  const orderIdx = (k: string) => {
    const i = stageOrder.indexOf(k);
    return i < 0 ? 99 : i;
  };
  const byStage = [...rows.values()].sort((a, b) => orderIdx(a.stageKey) - orderIdx(b.stageKey));

  return { gmv, weightedGmv, commission, weightedCommission, withValue, open: openLeads.length, byStage };
}
