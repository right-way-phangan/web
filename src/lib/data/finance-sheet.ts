/**
 * Живое чтение финансов из Google-таблицы «Right Way — Финансы (мастер)».
 *
 * Читает листы OpEx и Ledger через Sheets API под сервис-аккаунтом (тот же
 * intake-bot, что у Telegram-бота). Auth — JWT на `jose` (уже в зависимостях),
 * без googleapis. Кэш 60 с. При отсутствии env или ошибке → null, и дашборд
 * тихо работает на данных из кода (finance.ts).
 *
 * Часто меняющееся (подписки, платежи) — живёт в таблице. Стратегические
 * константы (постоянные расходы, план приходов) — остаются в коде.
 *
 * ENV (Vercel): GOOGLE_SA_EMAIL, GOOGLE_SA_PRIVATE_KEY, FINANCE_SHEET_ID.
 */
import { SignJWT, importPKCS8 } from "jose";
import type { Subscription, LedgerEntry, Currency, Period, SubStatus } from "./finance";

const SHEET_ID =
  process.env.FINANCE_SHEET_ID ?? "15IieST1ekdkHbUuJo_gLcH0JX8fdLW3i2nHvVbDrs0E";

export type SheetFinance = { subscriptions: Subscription[]; ledger: LedgerEntry[] };

function num(v: unknown): number {
  if (typeof v !== "string") return 0;
  const n = Number(v.replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function mapCurrency(v: string): Currency {
  const s = v.trim().toUpperCase();
  return s === "USD" || s === "RUB" || s === "EUR" || s === "THB" ? s : "THB";
}

function mapPeriod(v: string): Period {
  const s = v.trim().toLowerCase();
  if (s.startsWith("мес")) return "month";
  if (s.startsWith("год")) return "year";
  return "none";
}

function mapSubStatus(v: string): SubStatus {
  const s = v.trim().toLowerCase();
  if (s.includes("отвязк") || s.includes("утечк")) return "leak";
  if (s.includes("оплач")) return "paid";
  if (s.includes("free") || s.includes("беспл")) return "free";
  if (s.includes("актив")) return "active";
  return "pending";
}

function mapKind(v: string): LedgerEntry["kind"] {
  const s = v.trim().toLowerCase();
  if (s.includes("утечк") || s.includes("leak")) return "leak";
  if (s.includes("сделк") || s.includes("deal")) return "deal";
  if (s.includes("one") || s.includes("разов")) return "one-time";
  return "OpEx";
}

async function getAccessToken(): Promise<string | null> {
  const email = process.env.GOOGLE_SA_EMAIL;
  const rawKey = process.env.GOOGLE_SA_PRIVATE_KEY;
  if (!email || !rawKey) return null;
  try {
    const pem = rawKey.replace(/\\n/g, "\n");
    const key = await importPKCS8(pem, "RS256");
    const now = Math.floor(Date.now() / 1000);
    const assertion = await new SignJWT({
      scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
    })
      .setProtectedHeader({ alg: "RS256" })
      .setIssuer(email)
      .setSubject(email)
      .setAudience("https://oauth2.googleapis.com/token")
      .setIssuedAt(now)
      .setExpirationTime(now + 3600)
      .sign(key);

    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion,
      }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const j = (await res.json()) as { access_token?: string };
    return j.access_token ?? null;
  } catch {
    return null;
  }
}

/** Читает OpEx + Ledger из таблицы. null → дашборд использует данные из кода. */
export async function loadFinanceFromSheet(): Promise<SheetFinance | null> {
  const token = await getAccessToken();
  if (!token) return null;
  try {
    const url =
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values:batchGet` +
      `?ranges=${encodeURIComponent("OpEx!A2:I")}&ranges=${encodeURIComponent("Ledger!A2:H")}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { valueRanges?: Array<{ values?: string[][] }> };
    const opexRows = data.valueRanges?.[0]?.values ?? [];
    const ledgerRows = data.valueRanges?.[1]?.values ?? [];

    const subscriptions: Subscription[] = opexRows
      .filter((r) => (r[0] ?? "").trim() && !/^итого/i.test(r[0]))
      .map((r) => ({
        item: r[0] ?? "",
        provider: r[1] ?? "",
        plan: r[2] ?? "",
        priceOrig: num(r[3]),
        currency: mapCurrency(r[4] ?? ""),
        period: mapPeriod(r[5] ?? ""),
        payment: r[7] ?? "",
        status: mapSubStatus(r[8] ?? ""),
      }));

    const ledger: LedgerEntry[] = ledgerRows
      .filter((r) => (r[1] ?? "").trim())
      .map((r) => ({
        date: (r[0] ?? "").trim(),
        item: r[1] ?? "",
        amountOrig: r[2] ? num(r[2]) : null,
        currency: mapCurrency(r[3] ?? ""),
        thb: r[4] ? num(r[4]) : null,
        account: r[5] ?? "",
        kind: mapKind(r[6] ?? ""),
        receipt: /есть|да|yes|true/i.test(r[7] ?? ""),
      }));

    if (subscriptions.length === 0) return null;
    return { subscriptions, ledger };
  } catch {
    return null;
  }
}
