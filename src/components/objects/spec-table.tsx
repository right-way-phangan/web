"use client";

import type { RealEstateObject } from "@/types/object";
import { formatPriceTHB, formatPricePerRai } from "@/lib/utils/price";
import { useLocale } from "@/lib/i18n/use-locale";
import { getObjectDict, getListingsDict, type ObjectDict } from "@/lib/i18n/dictionaries";

interface Row {
  label: string;
  value: string;
}

interface Group {
  title: string;
  rows: Row[];
}

function buildGroups(o: RealEstateObject, t: ObjectDict, typeName: string): Group[] {
  const groups: Group[] = [];
  const rai = (r: number) =>
    r >= 1
      ? `${r.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${t.rai}`
      : `${Math.round(r * 1600).toLocaleString()} m²`;
  const L = t.specRows;

  // Pricing
  const priceRows: Row[] = [];
  if (o.priceThb) priceRows.push({ label: L["Asking price"], value: formatPriceTHB(o.priceThb) });
  if (o.type === "Land" && o.pricePerRai)
    priceRows.push({ label: L["Price per rai"], value: formatPricePerRai(o.pricePerRai) });
  if (o.rentPerRaiMonth)
    priceRows.push({ label: L["Lease rent"], value: `${formatPriceTHB(o.rentPerRaiMonth)} ${t.perRaiMonth}` });
  if (priceRows.length > 0) groups.push({ title: t.specGroups.Pricing, rows: priceRows });

  // Property
  const propertyRows: Row[] = [];
  propertyRows.push({ label: L.Type, value: typeName });
  if (o.district) propertyRows.push({ label: L.District, value: o.district });
  if (o.zone) propertyRows.push({ label: L.Zone, value: o.zone });
  if (o.areaRai) propertyRows.push({ label: L["Plot area"], value: rai(o.areaRai) });
  if (o.areaSqm) propertyRows.push({ label: L["Built area"], value: `${o.areaSqm.toLocaleString()} m²` });
  if (o.altitude !== undefined) propertyRows.push({ label: L.Altitude, value: `${o.altitude} m` });
  if (o.terrain) propertyRows.push({ label: L.Terrain, value: o.terrain });
  groups.push({ title: t.specGroups.Property, rows: propertyRows });

  // Legal
  const legalRows: Row[] = [];
  if (o.documentType) legalRows.push({ label: L["Document type"], value: o.documentType });
  if (o.tenure && o.tenure.length > 0) legalRows.push({ label: L.Tenure, value: o.tenure.join(", ") });
  if (o.leaseTermYears) legalRows.push({ label: L["Lease term"], value: t.years(o.leaseTermYears) });
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
  const groups = buildGroups(object, t, typeName);

  return (
    <div className="space-y-10">
      {groups.map((group) => (
        <div key={group.title}>
          <h3 className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
            {group.title}
          </h3>
          <dl className="divide-y divide-forest-500/10 border-y border-forest-500/10">
            {group.rows.map((row) => (
              <div
                key={row.label}
                className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:justify-between"
              >
                <dt className="text-sm text-forest-500/60">{row.label}</dt>
                <dd className="text-sm font-medium tabular-nums text-forest-900 sm:text-right">
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
