import { NextResponse } from "next/server";
import { getCatalogHealth } from "@/lib/data/catalog-health";

// Сводка здоровья каталога для утреннего CI-алерта (catalog-health.yml).
// Secure-by-default: без HEALTH_PING_TOKEN эндпоинт не существует (404), так что
// внутренние данные не утекают, пока алерт не «вооружён». С токеном — Bearer.
// Отдаёт только агрегаты (метки + счётчики + список RW-номеров), не цены/доки.
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const token = process.env.HEALTH_PING_TOKEN;
  if (!token) {
    return new NextResponse("not found", { status: 404 });
  }
  const auth = req.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${token}`) {
    return new NextResponse("unauthorized", { status: 401 });
  }

  const health = await getCatalogHealth();
  const items = health.checks.map((c) => ({
    key: c.key,
    label: c.label,
    severity: c.severity,
    count: c.objects.length,
    rwNumbers: c.objects.slice(0, 12).map((o) => o.rwNumber),
  }));
  const critical = items.filter((i) => i.severity === "critical");
  const warn = items.filter((i) => i.severity === "warn");

  return NextResponse.json({
    checked: health.checked,
    okObjects: health.okObjects,
    criticalCount: critical.reduce((n, i) => n + i.count, 0),
    warnCount: warn.reduce((n, i) => n + i.count, 0),
    items,
  });
}
