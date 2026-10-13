import { NextResponse } from "next/server";
import { apiFinanceSummary } from "@/lib/data/finance";
import { loadFinanceFromSheet } from "@/lib/data/finance-sheet";

// Расходы месяца для RW API: backend GET /finance/summary проксирует сюда, чтобы
// расчёт жил в одном месте с /admin/finance (таблицу читает только сайт).
// Gated by OBJECTS_API_TOKEN (секрет site↔backend): нет токена → 404, чужой → 401.
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const token = process.env.OBJECTS_API_TOKEN;
  if (!token) {
    return new NextResponse("not found", { status: 404 });
  }
  if ((req.headers.get("authorization") ?? "") !== `Bearer ${token}`) {
    return new NextResponse("unauthorized", { status: 401 });
  }

  const sheet = await loadFinanceFromSheet(); // null → код по умолчанию, как у дашборда
  return NextResponse.json(apiFinanceSummary(sheet?.subscriptions, sheet?.ledger));
}
