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
import { FX, bangkokToday } from "./finance";
import { getLiveRatesTHB } from "./fx-live";
import type {
  Subscription,
  LedgerEntry,
  Currency,
  Period,
  SubStatus,
  PersonalExpense,
  Receivable,
  Transaction,
  TxScope,
  Wallet,
  Debt,
  Payment,
} from "./finance";

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
  if (s.includes("доход") || s.includes("приход") || s.includes("income")) return "income";
  if (s.includes("утечк") || s.includes("leak")) return "leak";
  if (s.includes("сделк") || s.includes("deal")) return "deal";
  if (s.includes("one") || s.includes("разов")) return "one-time";
  return "OpEx";
}

const SCOPE_READ = "https://www.googleapis.com/auth/spreadsheets.readonly";
const SCOPE_WRITE = "https://www.googleapis.com/auth/spreadsheets";

async function getAccessToken(scope: string = SCOPE_READ): Promise<string | null> {
  const email = process.env.GOOGLE_SA_EMAIL;
  const rawKey = process.env.GOOGLE_SA_PRIVATE_KEY;
  if (!email || !rawKey) return null;
  try {
    const pem = rawKey.replace(/\\n/g, "\n");
    const key = await importPKCS8(pem, "RS256");
    const now = Math.floor(Date.now() / 1000);
    const assertion = await new SignJWT({ scope })
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

/** Один диапазон значений из таблицы. null при ошибке/отсутствии листа. */
async function getRange(token: string, range: string): Promise<string[][] | null> {
  try {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(range)}`,
      { headers: { Authorization: `Bearer ${token}` }, next: { revalidate: 60 } },
    );
    if (!res.ok) return null;
    return ((await res.json()) as { values?: string[][] }).values ?? [];
  } catch {
    return null;
  }
}

/**
 * 🔒 Приватные личные числа runway из таблицы — чтобы реальные суммы НЕ лежали
 * в публичном репо и правились без редеплоя. Необязательные листы:
 *  • `Runway`      — A: ключ (`cash`/`income`), B: сумма ฿
 *  • `Personal`    — A: статья, B: ฿/мес, C: оценка (да/true), D: примечание
 *  • `Receivables` — A: кто, B: ฿, C: срок (ISO), D: статус (overdue/expected), E: примечание
 * Любой лист отсутствует / нет env → его часть просто не подставится (fallback —
 * пустые значения из кода). Каждый лист читается отдельным запросом (частичная
 * настройка не ломает остальное и не трогает OpEx/Ledger).
 */
export type SheetPersonal = {
  cashOnHand?: number;
  monthlyIncome?: number;
  personalExpenses?: PersonalExpense[];
  receivables?: Receivable[];
};

export async function loadRunwayFromSheet(): Promise<SheetPersonal | null> {
  const token = await getAccessToken();
  if (!token) return null;
  const out: SheetPersonal = {};

  const runwayRows = await getRange(token, "Runway!A1:B20"); // key-value, без заголовка
  for (const r of runwayRows ?? []) {
    const key = (r[0] ?? "").trim().toLowerCase();
    if (!r[1]) continue;
    if (key.includes("cash") || key.includes("налич")) out.cashOnHand = num(r[1]);
    else if (key.includes("income") || key.includes("доход")) out.monthlyIncome = num(r[1]);
  }

  const personalRows = await getRange(token, "Personal!A2:D200");
  const personal = (personalRows ?? [])
    .filter((r) => (r[0] ?? "").trim() && !/^итого/i.test(r[0]))
    .map((r) => ({
      item: r[0] ?? "",
      thbPerMonth: num(r[1]),
      estimate: /да|true|yes|оцен/i.test(r[2] ?? "") || undefined,
      note: (r[3] ?? "").trim() || undefined,
    }));
  if (personal.length) out.personalExpenses = personal;

  const recRows = await getRange(token, "Receivables!A2:E200");
  const recs = (recRows ?? [])
    .filter((r) => (r[0] ?? "").trim() && !/^итого/i.test(r[0]))
    .map((r) => ({
      from: r[0] ?? "",
      thb: num(r[1]),
      due: (r[2] ?? "").trim(),
      status: /overdue|просроч/i.test(r[3] ?? "") ? ("overdue" as const) : ("expected" as const),
      note: (r[4] ?? "").trim() || undefined,
    }));
  if (recs.length) out.receivables = recs;

  return Object.keys(out).length ? out : null;
}

// ── Дневник трат (лист Transactions) ────────────────────────────────────────
//
// Колонки: Дата · Сфера · Сумма_ориг · Валюта · THB · Категория · Заметка ·
// Счёт · Источник. Пишет Telegram-бот (голос/текст) и форма /admin/finance/add.

const TX_SHEET = "Transactions";
const TX_HEADER = [
  "Дата", "Сфера", "Сумма_ориг", "Валюта", "THB",
  "Категория", "Заметка", "Счёт", "Источник",
];

/** Читает лист Transactions. null → дашборд показывает пусто (нет env/листа). */
export async function loadTransactionsFromSheet(): Promise<Transaction[] | null> {
  const token = await getAccessToken();
  if (!token) return null;
  const rows = await getRange(token, `${TX_SHEET}!A2:I`);
  if (rows == null) return null;
  return rows
    .filter((r) => (r[0] ?? "").trim() && (r[2] ?? "").toString().trim())
    .map((r) => {
      const scope: TxScope = (r[1] ?? "").trim().toLowerCase().startsWith("биз")
        ? "бизнес"
        : "личное";
      return {
        date: (r[0] ?? "").trim(),
        scope,
        amountOrig: num(r[2]),
        currency: mapCurrency(r[3] ?? ""),
        thb: num(r[4]),
        category: (r[5] ?? "").trim() || "Прочее",
        note: (r[6] ?? "").trim(),
        account: (r[7] ?? "").trim() || "личная",
        source: (r[8] ?? "").trim(),
      };
    });
}

const PAYMENTS_SHEET = "Payments";

/** Читает лист Payments (дат-обязательства). null → секция платежей скрыта. */
export async function loadPaymentsFromSheet(): Promise<Payment[] | null> {
  const token = await getAccessToken();
  if (!token) return null;
  const rows = await getRange(token, `${PAYMENTS_SHEET}!A2:G`);
  if (rows == null) return null;
  return rows
    .filter((r) => (r[0] ?? "").trim() && (r[1] ?? "").toString().trim())
    .map((r) => ({
      title: (r[0] ?? "").trim(),
      amount: num(r[1]),
      currency: mapCurrency(r[2] ?? ""),
      day: (r[3] ?? "").toString().trim(),
      recurrence: (r[4] ?? "").trim() || "разовый",
      type: (r[5] ?? "").trim(),
      note: (r[6] ?? "").trim(),
    }));
}

const DEBTS_SHEET = "Debts";

/** Читает лист Debts. null → секция долгов скрыта (нет env/листа). */
export async function loadDebtsFromSheet(): Promise<Debt[] | null> {
  const token = await getAccessToken();
  if (!token) return null;
  const rows = await getRange(token, `${DEBTS_SHEET}!A2:I`);
  if (rows == null) return null;
  return rows
    .filter((r) => (r[0] ?? "").trim())
    .map((r) => {
      const initial = num(r[2]);
      const paid = num(r[3]);
      const remaining = (r[4] ?? "").toString().trim() ? num(r[4]) : initial - paid;
      return {
        creditor: (r[0] ?? "").trim(),
        currency: mapCurrency(r[1] ?? ""),
        initial,
        paid,
        remaining,
        type: (r[5] ?? "").trim(),
        priority: (r[6] ?? "").trim(),
        note: (r[7] ?? "").trim(),
      };
    });
}

/** Создаёт лист Transactions с заголовком, если его ещё нет (идемпотентно). */
async function ensureTransactionsSheet(token: string): Promise<void> {
  const meta = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}?fields=sheets.properties.title`,
    { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" },
  );
  if (!meta.ok) return;
  const j = (await meta.json()) as {
    sheets?: Array<{ properties?: { title?: string } }>;
  };
  const titles = (j.sheets ?? []).map((s) => s.properties?.title);
  if (titles.includes(TX_SHEET)) return;
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}:batchUpdate`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ requests: [{ addSheet: { properties: { title: TX_SHEET } } }] }),
    cache: "no-store",
  });
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(
      `${TX_SHEET}!A1:I1`,
    )}?valueInputOption=USER_ENTERED`,
    {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ values: [TX_HEADER] }),
      cache: "no-store",
    },
  );
}

export type AppendTxInput = {
  scope: TxScope;
  amountOrig: number;
  currency: Currency;
  category: string;
  note: string;
  account?: string;
  source?: string;
};

export type AppendTxResult = { ok: boolean; thb?: number; date?: string; error?: string };

/**
 * THB-эквивалент траты, замороженный по курсу НА МОМЕНТ записи (best practice
 * мультивалютных трекеров: исторические строки не должны «плыть» при изменении
 * курса). Живой рыночный курс (open.er-api.com, free/без ключа, кэш 6 ч);
 * при недоступности — статичный учётный FX из finance.ts. THB-в-THB не трогаем.
 * NB: учётный FX остаётся базой для предоплаченных сумм OpEx/Ledger — здесь же
 * фиксируем реальную разовую трату наличными, ей нужен курс дня.
 */
async function thbAtEntry(amountOrig: number, currency: Currency): Promise<number> {
  if (currency === "THB") return Math.round(amountOrig);
  const live = await getLiveRatesTHB();
  const rate = live?.[currency] ?? FX[currency] ?? 1; // THB за 1 единицу валюты
  return Math.round(amountOrig * rate);
}

/** Добавляет строку траты в лист Transactions (write-scope). Создаёт лист при нужде. */
export async function appendTransactionToSheet(input: AppendTxInput): Promise<AppendTxResult> {
  const token = await getAccessToken(SCOPE_WRITE);
  if (!token) return { ok: false, error: "no-credentials" };

  const thb = await thbAtEntry(input.amountOrig, input.currency);
  const date = bangkokToday();
  const row = [
    date,
    input.scope,
    input.amountOrig,
    input.currency,
    thb,
    input.category,
    input.note,
    input.account ?? "личная",
    input.source ?? "web",
  ];
  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/` +
    `${encodeURIComponent(`${TX_SHEET}!A:I`)}:append` +
    `?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const post = () =>
    fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ values: [row] }),
      cache: "no-store",
    });

  try {
    let res = await post();
    if (res.status === 400) {
      // Лист, вероятно, ещё не создан — создаём и пробуем снова.
      await ensureTransactionsSheet(token);
      res = await post();
    }
    if (!res.ok) return { ok: false, error: `sheets ${res.status}` };
    return { ok: true, thb, date };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

// ── Кассы (лист Wallets) ────────────────────────────────────────────────────
//
// Колонки: Касса · ฿ (THB) · ₽ (RUB) · $ (USD) · Дата (as-of, ISO). Две строки.
// Наличка по валютам; старт = их сумма в THB по курсу (finance.ts walletStates).
// Правится через /admin/finance/wallets. Лист создаётся при первой записи.
// Старый формат (Касса · Баланс · Дата) читается как ฿=Баланс, ₽/$=0.

const WALLETS_SHEET = "Wallets";
const WALLETS_HEADER = ["Касса", "฿ (THB)", "₽ (RUB)", "$ (USD)", "Дата"];

const isISODate = (s: string) => /^\d{4}-\d{2}-\d{2}/.test(s.trim());

/** Читает кассы из листа Wallets (новый 5-кол. или старый 3-кол. формат). null → нет. */
export async function loadWalletsFromSheet(): Promise<Wallet[] | null> {
  const token = await getAccessToken();
  if (!token) return null;
  const rows = await getRange(token, `${WALLETS_SHEET}!A2:E`);
  if (rows == null) return null;
  const out: Wallet[] = [];
  for (const r of rows) {
    const name = (r[0] ?? "").trim().toLowerCase();
    if (!name) continue;
    const scope: TxScope = name.startsWith("биз") ? "бизнес" : "личное";
    // Старый формат: колонка C — дата (Касса·Баланс·Дата). Новый: C=₽, D=$, E=дата.
    if (isISODate(r[2] ?? "")) {
      out.push({ scope, thb: num(r[1]), rub: 0, usd: 0, asOf: (r[2] ?? "").trim() });
    } else {
      out.push({
        scope,
        thb: num(r[1]),
        rub: num(r[2]),
        usd: num(r[3]),
        asOf: (r[4] ?? "").trim() || bangkokToday(),
      });
    }
  }
  return out;
}

async function ensureWalletsSheet(token: string): Promise<void> {
  const meta = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}?fields=sheets.properties.title`,
    { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" },
  );
  if (!meta.ok) return;
  const j = (await meta.json()) as { sheets?: Array<{ properties?: { title?: string } }> };
  const titles = (j.sheets ?? []).map((s) => s.properties?.title);
  if (titles.includes(WALLETS_SHEET)) return;
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}:batchUpdate`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ requests: [{ addSheet: { properties: { title: WALLETS_SHEET } } }] }),
    cache: "no-store",
  });
}

export type WalletCash = { thb: number; rub: number; usd: number };

/** Перезаписывает обе кассы (личное/бизнес, наличка ฿/₽/$) с сегодняшней датой as-of. */
export async function updateWalletsInSheet(
  personal: WalletCash,
  business: WalletCash,
): Promise<{ ok: boolean; error?: string }> {
  const token = await getAccessToken(SCOPE_WRITE);
  if (!token) return { ok: false, error: "no-credentials" };
  const today = bangkokToday();
  const values = [
    WALLETS_HEADER,
    ["личное", personal.thb, personal.rub, personal.usd, today],
    ["бизнес", business.thb, business.rub, business.usd, today],
  ];
  const put = () =>
    fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/` +
        `${encodeURIComponent(`${WALLETS_SHEET}!A1:E3`)}?valueInputOption=USER_ENTERED`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ values }),
        cache: "no-store",
      },
    );
  try {
    let res = await put();
    if (res.status === 400) {
      await ensureWalletsSheet(token);
      res = await put();
    }
    if (!res.ok) return { ok: false, error: `sheets ${res.status}` };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
