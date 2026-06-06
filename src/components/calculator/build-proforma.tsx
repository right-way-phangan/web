"use client";

import { useMemo, useState } from "react";
import { Hammer } from "lucide-react";
import {
  type RentalMarket,
  fmtThb,
  measuredOccupancy,
  MGMT_FEE,
  OPEX_PCT,
} from "@/lib/data/rental-market";

/**
 * Build-to-rent pro-forma: combine our own land price (THB/m² by district) with
 * a construction-cost assumption and the district's measured nightly rate +
 * occupancy to get total CapEx, net yield-on-cost, and payback. Everything is
 * editable; the market figures pre-fill from the rental-market snapshot.
 */
const DEFAULT_CONSTR = 32000; // THB/m² — mid villa, Phangan (assumption)
const DEFAULT_FURNISH = 9000; // THB/m² built (assumption)

export function BuildProForma({ market }: { market: RentalMarket }) {
  const [district, setDistrict] = useState<string>(market.districts[0]?.name ?? "");
  const [plotSqm, setPlotSqm] = useState(600);
  const [builtSqm, setBuiltSqm] = useState(180);
  const [landPerSqm, setLandPerSqm] = useState<number>(
    market.capex.byDistrict?.[market.districts[0]?.name ?? ""] ?? 4000,
  );
  const [constrPerSqm, setConstrPerSqm] = useState(DEFAULT_CONSTR);
  const [furnishPerSqm, setFurnishPerSqm] = useState(DEFAULT_FURNISH);

  const d = market.districts.find((x) => x.name === district) ?? null;

  function pickDistrict(name: string) {
    setDistrict(name);
    const land = market.capex.byDistrict?.[name];
    if (land) setLandPerSqm(land);
  }

  const out = useMemo(() => {
    const adr = d?.adrMedian ?? 0;
    const occ = market.meta.occupancy.base; // annual basis = scenario
    const measuredNow = measuredOccupancy(d, market.meta);
    const landCost = plotSqm * landPerSqm;
    const buildCost = builtSqm * constrPerSqm;
    const furnishCost = builtSqm * furnishPerSqm;
    const total = landCost + buildCost + furnishCost;
    const annualGross = adr * 365 * occ;
    const annualNet = annualGross * (1 - MGMT_FEE) - total * OPEX_PCT;
    return {
      adr,
      occ,
      measuredNow,
      landCost,
      buildCost,
      furnishCost,
      total,
      annualGross: Math.round(annualGross),
      annualNet: Math.round(annualNet),
      yoc: total > 0 ? Math.round((annualNet / total) * 1000) / 10 : 0,
      payback: annualNet > 0 ? Math.round((total / annualNet) * 10) / 10 : 0,
    };
  }, [d, market.meta, plotSqm, builtSqm, landPerSqm, constrPerSqm, furnishPerSqm]);

  return (
    <div className="rounded-sm border border-forest-500/10 bg-cream-50 p-6 md:p-8">
      <p className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
        <Hammer className="h-4 w-4" />
        Build-to-rent pro-forma
      </p>
      <h3 className="mt-2 font-serif text-2xl text-forest-900">
        What it costs to build — and what it returns
      </h3>
      <p className="mt-2 max-w-2xl text-sm text-forest-500/75">
        Land price pre-fills from our own listings; construction and furnishing are editable
        assumptions. Rent and occupancy come from the market snapshot.
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_1fr]">
        {/* Inputs */}
        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium text-forest-500/70">District</span>
            <select
              value={district}
              onChange={(e) => pickDistrict(e.target.value)}
              className="w-full rounded-sm border border-forest-500/20 bg-cream-50 px-2.5 py-1.5 text-sm text-forest-900 outline-none focus:border-brass-500"
            >
              {market.districts.map((x) => (
                <option key={x.name} value={x.name}>
                  {x.name}
                </option>
              ))}
            </select>
          </label>
          <Num label="Plot size (m²)" value={plotSqm} onChange={setPlotSqm} step={50} />
          <Num label="Land price (THB/m²)" value={landPerSqm} onChange={setLandPerSqm} step={500} />
          <Num label="Built area (m²)" value={builtSqm} onChange={setBuiltSqm} step={10} />
          <Num label="Construction (THB/m²)" value={constrPerSqm} onChange={setConstrPerSqm} step={1000} />
          <Num label="Furnishing (THB/m²)" value={furnishPerSqm} onChange={setFurnishPerSqm} step={500} />
        </div>

        {/* Outputs */}
        <div className="space-y-3">
          <Row label="Land cost" value={fmtThb(out.landCost, true)} />
          <Row label="Construction" value={fmtThb(out.buildCost, true)} />
          <Row label="Furnishing" value={fmtThb(out.furnishCost, true)} />
          <Row label="Total CapEx" value={fmtThb(out.total, true)} bold />
          <div className="my-1 border-t border-forest-500/10" />
          <Row
            label={`Net rent / yr`}
            value={`${fmtThb(out.annualNet, true)}`}
            sub={`gross ${fmtThb(out.annualGross, true)} · ${Math.round(out.occ * 100)}% base occ${
              out.measuredNow != null ? ` · ${Math.round(out.measuredNow * 100)}% booked now` : ""
            }`}
          />
          <div className="grid grid-cols-2 gap-3 pt-1">
            <Big label="Net yield-on-cost" value={`${out.yoc}%`} />
            <Big label="Payback" value={out.payback > 0 ? `${out.payback} yr` : "—"} />
          </div>
          <p className="text-[11px] text-forest-500/50">
            Net = market ADR × 365 × occupancy, less {Math.round(MGMT_FEE * 100)}% management and{" "}
            {Math.round(OPEX_PCT * 100)}% opex. Construction &amp; furnishing are assumptions —
            adjust to your spec. Not investment advice.
          </p>
        </div>
      </div>
    </div>
  );
}

function Num({
  label,
  value,
  onChange,
  step,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-medium text-forest-500/70">{label}</span>
      <input
        type="number"
        value={value}
        step={step}
        min={0}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
        className="w-full rounded-sm border border-forest-500/20 bg-cream-50 px-2.5 py-1.5 text-sm tabular-nums text-forest-900 outline-none focus:border-brass-500"
      />
    </label>
  );
}

function Row({
  label,
  value,
  sub,
  bold,
}: {
  label: string;
  value: string;
  sub?: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className={`text-sm ${bold ? "font-semibold text-forest-900" : "text-forest-500/75"}`}>
        {label}
        {sub ? <span className="block text-[11px] text-forest-500/50">{sub}</span> : null}
      </span>
      <span className={`tabular-nums ${bold ? "text-base font-semibold text-forest-900" : "text-sm text-forest-900"}`}>
        {value}
      </span>
    </div>
  );
}

function Big({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm bg-forest-900 p-3 text-center text-cream-50">
      <div className="text-[10px] uppercase tracking-wide text-cream-100/70">{label}</div>
      <div className="mt-0.5 text-xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}
