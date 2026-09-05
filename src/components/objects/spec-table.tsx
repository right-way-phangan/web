"use client";

import type { RealEstateObject } from "@/types/object";
import { useLocale } from "@/lib/i18n/use-locale";
import { getObjectDict, getListingsDict, type ObjectDict } from "@/lib/i18n/dictionaries";
import { useCurrency } from "@/components/ui/currency";

interface Row {
  label: string;
  value: string;
}

interface Group {
  title: string;
  rows: Row[];
}

function buildGroups(
  o: RealEstateObject,
  t: ObjectDict,
  typeName: string,
  // Explicit BCP-47 locale so numbers format identically on server and client.
  // toLocaleString() with no locale uses the runtime default, which differs
  // between Node and the browser (grouping + decimal separators) and caused a
  // hydration mismatch (React #418) on object pages with sqm/fractional-rai.
  nl: string,
  // Currency formatters from the active toggle (THB → selected, full precision
  // for the headline amount, compact for the per-rai figure).
  fmt: (thb: number) => string,
  fmtFull: (thb: number) => string,
): Group[] {
  const groups: Group[] = [];
  const rai = (r: number) =>
    r >= 1
      ? `${r.toLocaleString(nl, { maximumFractionDigits: 2 })} ${t.rai}`
      : `${Math.round(r * 1600).toLocaleString(nl)} m²`;
  const L = t.specRows;

  // Pricing
  const priceRows: Row[] = [];
  if (o.priceThb) priceRows.push({ label: L["Asking price"], value: fmtFull(o.priceThb) });
  if (o.type === "Land" && o.pricePerRai)
    priceRows.push({ label: L["Price per rai"], value: `${fmt(o.pricePerRai)} / rai` });
  if (o.rentPerMonth)
    priceRows.push({ label: L["Lease rent"], value: `${fmtFull(o.rentPerMonth)} ${t.perMonth}` });
  if (o.rentPerRaiMonth)
    priceRows.push({ label: L["Lease rent"], value: `${fmtFull(o.rentPerRaiMonth)} ${t.perRaiMonth}` });
  if (priceRows.length > 0) groups.push({ title: t.specGroups.Pricing, rows: priceRows });

  // Property
  const propertyRows: Row[] = [];
  propertyRows.push({ label: L.Type, value: typeName });
  if (o.district) propertyRows.push({ label: L.District, value: o.district });
  if (o.zone) propertyRows.push({ label: L.Zone, value: o.zone });
  if (o.type === "Land") {
    // Land has no building: rai and m² describe the SAME plot in two units.
    // Show one "Plot area" row with both — never "Built area" for land.
    const areaParts: string[] = [];
    if (o.areaRai) areaParts.push(`${o.areaRai.toLocaleString(nl, { maximumFractionDigits: 2 })} ${t.rai}`);
    if (o.areaSqm) areaParts.push(`${o.areaSqm.toLocaleString(nl)} m²`);
    if (areaParts.length) propertyRows.push({ label: L["Plot area"], value: areaParts.join(" · ") });
  } else {
    if (o.areaRai) propertyRows.push({ label: L["Plot area"], value: rai(o.areaRai) });
    if (o.areaSqm) propertyRows.push({ label: L["Built area"], value: `${o.areaSqm.toLocaleString(nl)} m²` });
  }
  if (o.altitude !== undefined) propertyRows.push({ label: L.Altitude, value: `${o.altitude} m` });
  if (o.terrain) propertyRows.push({ label: L.Terrain, value: o.terrain });
  groups.push({ title: t.specGroups.Property, rows: propertyRows });

  // Legal
  const legalRows: Row[] = [];
  if (o.documentType) legalRows.push({ label: L["Document type"], value: o.documentType });
  if (o.tenure && o.tenure.length > 0) {
    // Переводим токены: «Mixed» в CRM значит «право не установлено», и сырой
    // токен на странице читается как утверждение о третьей форме владения.
    legalRows.push({
      label: L.Tenure,
      value: o.tenure.map((v) => t.tenureValues[v] ?? v).join(", "),
    });
  }
  if (o.leaseTermYears) legalRows.push({ label: L["Lease term"], value: t.years(o.leaseTermYears) });
  if (o.leaseEscPercent)
    legalRows.push({ label: L.Indexation, value: t.leaseEsc(o.leaseEscPercent, o.leaseEscPeriodYears) });
  if (o.leasePrepayment)
    legalRows.push({ label: L["Lease prepayment"], value: fmtFull(o.leasePrepayment) });
  if (o.leaseAdditionalTerms)
    legalRows.push({ label: L["Additional terms"], value: o.leaseAdditionalTerms });
  if (legalRows.length > 0) groups.push({ title: t.specGroups.Legal, rows: legalRows });

  // Building
  if (["Villa", "House", "Apartment"].includes(o.type)) {
    const buildingRows: Row[] = [];
    if (o.bedrooms !== undefined) buildingRows.push({ label: L.Bedrooms, value: String(o.bedrooms) });
    if (o.bathrooms !== undefined) buildingRows.push({ label: L.Bathrooms, value: String(o.bathrooms) });
    if (o.buildYear) buildingRows.push({ label: L.Built, value: String(o.buildYear) });
    if (o.condition) buildingRows.push({ label: L.Condition, value: o.condition });
    if (buildingRows.length > 0) groups.push({ title: t.specGroups.Building, rows: buildingRows });
  }

  // Features
  const featureLabels: Array<[boolean, string]> = [
    [o.beachfront, "Beachfront"],
    [o.seaView, "Sea view"],
    [o.mountainView, "Mountain view"],
    [o.jungleView, "Jungle view"],
    [o.flatLand, "Flat land"],
    [o.quiet, "Quiet location"],
    [o.pool ?? false, "Private pool"],
    [o.privateGarden ?? false, "Private garden"],
    [o.parking ?? false, "Parking"],
    [o.gated ?? false, "Gated"],
  ];
  const activeFeatures = featureLabels.filter(([v]) => v).map(([, l]) => t.features[l] ?? l);
  if (activeFeatures.length > 0) {
    groups.push({ title: t.specGroups.Features, rows: [{ label: L["On site"], value: activeFeatures.join(" · ") }] });
  }

  // Infrastructure
  const utilRows: Row[] = [];
  if (o.electricity !== undefined) utilRows.push({ label: L.Electricity, value: o.electricity ? t.yes : t.no });
  if (o.waterType) utilRows.push({ label: L.Water, value: o.waterType });
  if (o.internetType) utilRows.push({ label: L.Internet, value: o.internetType });
  if (o.roadType) utilRows.push({ label: L["Road access"], value: o.roadType });
  if (utilRows.length > 0) groups.push({ title: t.specGroups.Infrastructure, rows: utilRows });

  return groups;
}

export function SpecTable({ object }: { object: RealEstateObject }) {
  const locale = useLocale();
  const t = getObjectDict(locale);
  const typeName = getListingsDict(locale).types[object.type];
  const numberLocale = locale === "ru" ? "ru-RU" : "en-US";
  const { fmt, fmtFull } = useCurrency();
  const groups = buildGroups(object, t, typeName, numberLocale, fmt, fmtFull);

  return (
    // Two columns from md: a single key/value column ran ~1 000 px on the
    // object page (audit 2026-09-03); groups stay intact, only the layout flows.
    <div className="space-y-10 md:grid md:grid-cols-2 md:gap-x-10 md:gap-y-10 md:space-y-0">
      {groups.map((group) => (
        <div key={group.title}>
          {/* font-sans поверх базового h3: серифный display на 13px капсом
              разваливается — мелкое всегда набираем гротеском. */}
          <h3 className="mb-4 font-sans text-[0.8125rem] font-medium uppercase tracking-eyebrow text-brass-500">
            {group.title}
          </h3>
          <dl className="divide-y divide-forest-500/10 border-y border-forest-500/10">
            {group.rows.map((row) => (
              <div
                key={row.label}
                className="flex flex-col gap-1 py-3.5 sm:flex-row sm:items-baseline sm:justify-between"
              >
                <dt className="text-[0.9375rem] text-forest-500/70">{row.label}</dt>
                <dd className="text-[0.9375rem] font-medium tabular-nums text-forest-900 sm:text-right">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
}
