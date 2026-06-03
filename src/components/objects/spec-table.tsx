import type { RealEstateObject } from "@/types/object";
import { formatPriceTHB, formatPricePerRai } from "@/lib/utils/price";

interface Row {
  label: string;
  value: string;
}

interface Group {
  title: string;
  rows: Row[];
}

function formatRai(rai: number): string {
  if (rai >= 1) return `${rai.toLocaleString(undefined, { maximumFractionDigits: 2 })} rai`;
  return `${Math.round(rai * 1600).toLocaleString()} m²`;
}

function buildGroups(o: RealEstateObject): Group[] {
  const groups: Group[] = [];

  // Pricing (shown first when present)
  const priceRows: Row[] = [];
  if (o.priceThb)
    priceRows.push({ label: "Asking price", value: formatPriceTHB(o.priceThb) });
  if (o.type === "Land" && o.pricePerRai)
    priceRows.push({ label: "Price per rai", value: formatPricePerRai(o.pricePerRai) });
  if (o.rentPerRaiMonth)
    priceRows.push({
      label: "Lease rent",
      value: `${formatPriceTHB(o.rentPerRaiMonth)} / rai / month`,
    });
  if (priceRows.length > 0) groups.push({ title: "Pricing", rows: priceRows });

  // Property details (always shown)
  const propertyRows: Row[] = [];
  propertyRows.push({ label: "Type", value: o.type });
  if (o.district) propertyRows.push({ label: "District", value: o.district });
  if (o.zone) propertyRows.push({ label: "Zone", value: o.zone });
  if (o.areaRai)
    propertyRows.push({ label: "Plot area", value: formatRai(o.areaRai) });
  if (o.areaSqm)
    propertyRows.push({
      label: "Built area",
      value: `${o.areaSqm.toLocaleString()} m²`,
    });
  if (o.altitude !== undefined)
    propertyRows.push({ label: "Altitude", value: `${o.altitude} m` });
  if (o.terrain) propertyRows.push({ label: "Terrain", value: o.terrain });
  groups.push({ title: "Property", rows: propertyRows });

  // Legal — important for foreign buyers
  const legalRows: Row[] = [];
  if (o.documentType)
    legalRows.push({ label: "Document type", value: o.documentType });
  if (o.tenure && o.tenure.length > 0)
    legalRows.push({ label: "Tenure", value: o.tenure.join(", ") });
  if (o.leaseTermYears)
    legalRows.push({ label: "Lease term", value: `${o.leaseTermYears} years` });
  if (legalRows.length > 0) groups.push({ title: "Legal", rows: legalRows });

  // Building (only for V/H/A)
  if (["Villa", "House", "Apartment"].includes(o.type)) {
    const buildingRows: Row[] = [];
    if (o.bedrooms !== undefined)
      buildingRows.push({
        label: "Bedrooms",
        value: String(o.bedrooms),
      });
    if (o.bathrooms !== undefined)
      buildingRows.push({
        label: "Bathrooms",
        value: String(o.bathrooms),
      });
    if (o.buildYear)
      buildingRows.push({ label: "Built", value: String(o.buildYear) });
    if (o.condition)
      buildingRows.push({ label: "Condition", value: o.condition });
    if (buildingRows.length > 0)
      groups.push({ title: "Building", rows: buildingRows });
  }

  // Features (true booleans only)
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
  const activeFeatures = featureLabels.filter(([v]) => v).map(([, l]) => l);
  if (activeFeatures.length > 0) {
    groups.push({
      title: "Features",
      rows: [{ label: "On site", value: activeFeatures.join(" · ") }],
    });
  }

  // Utilities
  const utilRows: Row[] = [];
  if (o.electricity !== undefined)
    utilRows.push({ label: "Electricity", value: o.electricity ? "Yes" : "No" });
  if (o.waterType) utilRows.push({ label: "Water", value: o.waterType });
  if (o.internetType) utilRows.push({ label: "Internet", value: o.internetType });
  if (o.roadType) utilRows.push({ label: "Road access", value: o.roadType });
  if (utilRows.length > 0)
    groups.push({ title: "Infrastructure", rows: utilRows });

  return groups;
}

export function SpecTable({ object }: { object: RealEstateObject }) {
  const groups = buildGroups(object);

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
                <dd className="text-sm font-medium text-forest-900 sm:text-right">
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
