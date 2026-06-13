import { NextResponse } from "next/server";
import { verifyShortlistToken } from "@/lib/shortlist-token";
import { backendFetch } from "@/lib/api/backend";

export const dynamic = "force-dynamic";

/**
 * Beacon target for the shortlist page: the client's browser POSTs here on
 * open. We re-verify the signed token (so a random POST can't inject events
 * for arbitrary leads) and forward to the backend, which debounces.
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const leadId = verifyShortlistToken(token);
  if (!leadId) return NextResponse.json({ ok: false }, { status: 404 });
  try {
    await backendFetch(`/leads/${leadId}/shortlist-view`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: "{}",
    });
  } catch (err) {
    console.error("[shortlist-seen] forward failed:", err);
  }
  return NextResponse.json({ ok: true });
}
