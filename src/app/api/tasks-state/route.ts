/**
 * Mini App «Задачи» — API для Telegram WebApp.
 *
 * Все запросы несут X-Telegram-InitData (сырой initData из Telegram.WebApp.initData).
 * Подпись проверяется HMAC-SHA256 с ключом, производным от токена бота.
 * После проверки — проксируем CRUD в backend API (OBJECTS_API_URL).
 *
 * GET  /api/tasks-state         → {tasks, leads, generatedAt}
 * POST /api/tasks-state         → body {text, source?}  → создать задачу
 * PATCH /api/tasks-state?id=N   → body {status?, text?} → обновить
 * DELETE /api/tasks-state?id=N  → удалить
 */

import { NextResponse } from "next/server";
import { createHmac } from "crypto";

export const dynamic = "force-dynamic";

const BOT_TOKEN = process.env.TELEGRAM_ASSISTANT_BOT_TOKEN ?? "";
const API = (process.env.OBJECTS_API_URL ?? "").replace(/\/$/, "");
const API_TOKEN = process.env.OBJECTS_API_TOKEN ?? "";
// Первый chat_id из whitelist — единственный разрешённый пользователь.
const ALLOWED_ID = (process.env.TELEGRAM_ALLOWED_USER_IDS ?? "")
  .split(",")
  .map((s) => s.trim())
  .find((s) => /^\d+$/.test(s));

function verifyInitData(initData: string): { ok: boolean; userId?: number } {
  if (!BOT_TOKEN || !initData) return { ok: false };
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get("hash");
    if (!hash) return { ok: false };
    params.delete("hash");
    const pairs = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join("\n");
    const secret = createHmac("sha256", "WebAppData").update(BOT_TOKEN).digest();
    const sig = createHmac("sha256", secret).update(pairs).digest("hex");
    if (sig !== hash) return { ok: false };
    // user.id из подписанного JSON
    const userStr = params.get("user");
    const userId = userStr ? (JSON.parse(userStr) as { id?: number }).id : undefined;
    return { ok: true, userId };
  } catch {
    return { ok: false };
  }
}

function apiHeaders() {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (API_TOKEN) h["Authorization"] = `Bearer ${API_TOKEN}`;
  return h;
}

function unauthorized() {
  return new NextResponse("unauthorized", { status: 401 });
}

function checkAuth(req: Request): { ok: boolean } {
  if (!BOT_TOKEN || !API) return { ok: false };
  const initData = req.headers.get("x-telegram-initdata") ?? "";
  const { ok, userId } = verifyInitData(initData);
  if (!ok) return { ok: false };
  // Fail-closed: без корректно заданного whitelist (ALLOWED_ID === undefined)
  // доступ закрыт всем — иначе любой подписанный Mini App-юзер получил бы лиды.
  if (!ALLOWED_ID || String(userId) !== ALLOWED_ID) return { ok: false };
  return { ok: true };
}

// ─── GET: задачи + свежие лиды ───────────────────────────────────────────────

export async function GET(req: Request) {
  if (!checkAuth(req).ok) return unauthorized();

  const [tasksRes, leadsRes] = await Promise.allSettled([
    fetch(`${API}/agent-tasks?status=open`, { headers: apiHeaders() }),
    fetch(`${API}/leads`, { headers: apiHeaders() }),
  ]);

  const tasks =
    tasksRes.status === "fulfilled" && tasksRes.value.ok
      ? await tasksRes.value.json()
      : [];

  const allLeads =
    leadsRes.status === "fulfilled" && leadsRes.value.ok
      ? await leadsRes.value.json()
      : [];

  // Лиды за последние 48 ч в открытых стадиях
  const cutoff = Date.now() - 48 * 60 * 60 * 1000;
  const leads = (allLeads as Array<Record<string, unknown>>)
    .filter((l) => {
      if ((l.status as string) === "won" || (l.status as string) === "lost") return false;
      const ts = l.createdAt ? new Date(l.createdAt as string).getTime() : 0;
      return ts >= cutoff;
    })
    .slice(0, 10)
    .map((l) => ({
      id: l.id,
      name: l.contactName || l.name || `#${l.id}`,
      stage: l.stageName || l.stageKey || "",
      pipeline: l.pipelineName || l.pipelineKey || "",
      phone: l.phone || "",
      createdAt: l.createdAt,
    }));

  return NextResponse.json({ tasks, leads, generatedAt: new Date().toISOString() });
}

// ─── POST: создать задачу ────────────────────────────────────────────────────

export async function POST(req: Request) {
  if (!checkAuth(req).ok) return unauthorized();
  const body = await req.json().catch(() => null);
  if (!body?.text) return new NextResponse("text required", { status: 400 });
  const r = await fetch(`${API}/agent-tasks`, {
    method: "POST",
    headers: apiHeaders(),
    body: JSON.stringify({ text: body.text, source: body.source ?? "miniapp" }),
  });
  const data = await r.json().catch(() => ({}));
  return NextResponse.json(data, { status: r.ok ? 201 : 500 });
}

// ─── PATCH: обновить задачу ──────────────────────────────────────────────────

export async function PATCH(req: Request) {
  if (!checkAuth(req).ok) return unauthorized();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id || isNaN(Number(id))) return new NextResponse("id required", { status: 400 });
  const body = await req.json().catch(() => null);
  const r = await fetch(`${API}/agent-tasks/${id}`, {
    method: "PATCH",
    headers: apiHeaders(),
    body: JSON.stringify(body ?? {}),
  });
  const data = await r.json().catch(() => ({}));
  return NextResponse.json(data, { status: r.ok ? 200 : 500 });
}

// ─── DELETE: удалить задачу ──────────────────────────────────────────────────

export async function DELETE(req: Request) {
  if (!checkAuth(req).ok) return unauthorized();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id || isNaN(Number(id))) return new NextResponse("id required", { status: 400 });
  const r = await fetch(`${API}/agent-tasks/${id}`, {
    method: "DELETE",
    headers: apiHeaders(),
  });
  return r.ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "failed" }, { status: 500 });
}
