import { NextResponse } from "next/server";
import { backendFetch, BACKEND_URL } from "@/lib/api/backend";
import { isAdmin } from "@/lib/auth/require-admin";

export const dynamic = "force-dynamic";

/**
 * Прокси к backend /photos/audit — vision-сканер каталога на скрытые внутренние
 * документы (чаноты, прайсы, скрины LandsMaps), просочившиеся в публичные фото.
 * Серверный роут: Bearer-токен берётся из OBJECTS_API_TOKEN (backendFetch) и
 * НИКОГДА не уходит на клиент. Тело прокидывается как есть {activeOnly?, limit?,
 * rwNumbers?}; ответ backend — {enabled, scanned, flagged[]}.
 */
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  if (!BACKEND_URL) {
    return NextResponse.json({ error: "Backend не подключён." }, { status: 503 });
  }

  let body: unknown = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  try {
    const res = await backendFetch("/photos/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify(body ?? {}),
    });
    const text = await res.text();
    if (!res.ok) {
      return NextResponse.json(
        { error: `API ${res.status}: ${text.slice(0, 200)}` },
        { status: res.status },
      );
    }
    // Прокидываем JSON backend как есть.
    return new NextResponse(text, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[admin] photo-audit proxy failed:", err);
    return NextResponse.json({ error: "Сетевая ошибка при сканировании." }, { status: 502 });
  }
}
