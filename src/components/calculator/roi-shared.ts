// Общие типы и форматтеры калькулятора — вынесены из roi-calculator.tsx (2026-07-04).

export type Money = (thb: number, full?: boolean) => string;

export const fmtPct = (n: number) =>
  !isFinite(n) ? "—" : `${n >= 0 ? "+" : ""}${n.toLocaleString("en-US", { maximumFractionDigits: 1 })}%`;

export interface ProjectUnit {
  rwNumber: string;
  label: string;
  priceThb: number;
  /** Optional caller-localized tag, e.g. "Best ฿/rai" on the best-value lot. */
  badge?: string;
}

/** Snapshot of a pinned scenario for the side-by-side compare table. */
export interface SavedScenario {
  id: number;
  label: string;
  roi: number;
  proj: number;
  profit: number;
  cagr: number;
  payback: number | null;
  vsBank: number;
}
