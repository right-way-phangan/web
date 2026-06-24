import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { backendFetch, BACKEND_URL } from "@/lib/api/backend";

export const dynamic = "force-dynamic";

/**
 * Прокси к backend /photos/purge — удаляет строки object_photos по списку URL
 * (фото сразу пропадает с сайта). Серверный роут: Bearer-токен из
 * OBJECTS_API_TOKEN. R2-блоб остаётся качаемым, пока его не вычистит отдельный
 * скрипт (clean-leaked-doc-photos.ts) — поэтому возвращаем stillNeedsBlobPurge,
 * чтобы UI это показал.
 */
export async function POST(req: Request) {
  if (!BACKEND_URL) {
    return NextResponse.json({ error: "Backend не подключён." }, { status: 503 });
  }

  let urls: string[] = [];
  try {
    const body = (await req.json()) as { urls?: unknown };
    if (Array.isArray(body?.urls)) {
      urls = body.urls.filter((u): u is string => typeof u === "string" && u.length > 0);
    }
  } catch {
    urls = [];
  }

  if (urls.length === 0) {
    return NextResponse.json({ error: "Не передан список URL для удаления." }, { status: 400 });
  }

  try {
    const res = await backendFetch("/photos/purge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ urls }),
    });
    const text = await res.text();
    if (!res.ok) {
      return NextResponse.json(
        { error: `API ${res.status}: ${text.slice(0, 200)}` },
        { status: res.status },
      );
    }
    // Фото убрано из object_photos — обновим публичные витрины.
    revalidatePath("/listings");
    revalidatePath("/admin/objects");
    return new NextResponse(text, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[admin] photo-audit purge proxy failed:", err);
    return NextResponse.json({ error: "Сетевая ошибка при удалении." }, { status: 502 });
  }
}
