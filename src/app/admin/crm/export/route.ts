import { getLeads } from "@/lib/data/leads";

export const dynamic = "force-dynamic";

/** CSV-escape: wrap in quotes, double internal quotes. */
function cell(v: unknown): string {
  const s = v == null ? "" : String(v);
  return `"${s.replace(/"/g, '""')}"`;
}

function channelOf(l: { source?: string | null; tags?: string[] | null }): string {
  const tags = l.tags ?? [];
  const ch = tags.find((t) => t.startsWith("channel:"));
  if (ch) return ch.slice("channel:".length);
  if (l.source === "ad" || tags.includes("source:ad")) return "ad";
  if (tags.includes("website") || l.source === "object" || l.source === "contact") return "website";
  if (l.source === "manual") return "manual";
  return "other";
}

/**
 * Export all leads as CSV (admin only — gated by /admin middleware). One row per
 * lead with contact, pipeline/stage, source/channel, linked object and tags.
 * Opens as a download; Excel-friendly UTF-8 BOM.
 */
export async function GET() {
  const leads = await getLeads();
  const header = [
    "id",
    "contact",
    "email",
    "phone",
    "pipeline",
    "stage",
    "status",
    "source",
    "channel",
    "object_rw",
    "tags",
    "created_at",
    "updated_at",
  ];
  const rows = leads.map((l) =>
    [
      l.id,
      l.contactName ?? "",
      l.email ?? "",
      l.phone ?? "",
      l.pipeline ?? "",
      l.stage ?? "",
      l.status ?? "",
      l.source ?? "",
      channelOf(l),
      l.rwNumber ?? "",
      (l.tags ?? []).join(" "),
      l.createdAt ?? "",
      l.updatedAt ?? "",
    ]
      .map(cell)
      .join(","),
  );
  const csv = "﻿" + [header.map(cell).join(","), ...rows].join("\r\n");
  const date = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="rightway-leads-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
