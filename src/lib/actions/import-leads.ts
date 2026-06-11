"use server";

import { revalidatePath } from "next/cache";
import { backendFetch } from "@/lib/api/backend";

const API = process.env.OBJECTS_API_URL;
const MAX_ROWS = 300;

export type ImportResult = {
  ok: boolean;
  created: number;
  skippedDuplicates: number;
  skippedInvalid: number;
  error?: string;
  /** First few skipped lines for the operator to eyeball. */
  notes: string[];
};

/** Minimal RFC-4180-ish CSV parser: quotes, escaped quotes, CRLF. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else inQuotes = false;
      } else cell += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      cell = "";
      if (row.some((c) => c.trim() !== "")) rows.push(row);
      row = [];
    } else cell += ch;
  }
  row.push(cell);
  if (row.some((c) => c.trim() !== "")) rows.push(row);
  return rows;
}

// Header aliases (case-insensitive) → canonical field.
const HEADER_MAP: Record<string, string> = {
  name: "name", имя: "name", контакт: "name", contact: "name", "контактное лицо": "name",
  phone: "phone", телефон: "phone", тел: "phone", mobile: "phone",
  email: "email", "e-mail": "email", почта: "email",
  note: "note", заметка: "note", комментарий: "note", comment: "note", notes: "note",
  source: "source", источник: "source", канал: "source",
  rw: "rwNumber", rwnumber: "rwNumber", объект: "rwNumber", object_rw: "rwNumber",
  pipeline: "pipeline", воронка: "pipeline",
};

const digits = (v: string) => v.replace(/\D/g, "");

/**
 * Bulk lead import from a CSV file (phone book dumps, FB lead-form exports).
 * Needs a header row; recognizes RU/EN column names (имя/phone/email/заметка…).
 * Dedupes against existing CRM contacts and inside the file (last 9 phone
 * digits / email). Created leads get tag `import` and NO auto follow-up task.
 */
export async function importLeadsAction(formData: FormData): Promise<ImportResult> {
  const fail = (error: string): ImportResult => ({
    ok: false, created: 0, skippedDuplicates: 0, skippedInvalid: 0, error, notes: [],
  });
  if (!API) return fail("Backend не подключён.");

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return fail("Выберите CSV-файл.");
  if (file.size > 1_000_000) return fail("Файл больше 1 МБ — разбейте на части.");

  const rows = parseCsv(await file.text());
  if (rows.length < 2) return fail("В файле нет данных (нужна строка заголовков + строки лидов).");

  const header = rows[0].map((h) => HEADER_MAP[h.trim().toLowerCase().replace(/^﻿/, "")] ?? "");
  if (!header.includes("name")) {
    return fail("Не найдена колонка имени (name / имя / контакт). Первая строка файла — заголовки.");
  }
  const body = rows.slice(1, MAX_ROWS + 1);

  // Existing contacts — dedupe target.
  const seenPhones = new Set<string>();
  const seenEmails = new Set<string>();
  try {
    const r = await backendFetch("/leads", { cache: "no-store" });
    if (r.ok) {
      const all = (await r.json()) as { email?: string | null; phone?: string | null }[];
      for (const l of all) {
        const p = digits(l.phone ?? "").slice(-9);
        if (p.length >= 7) seenPhones.add(p);
        if (l.email) seenEmails.add(l.email.toLowerCase());
      }
    }
  } catch {
    /* dedupe best-effort */
  }

  let created = 0;
  let skippedDuplicates = 0;
  let skippedInvalid = 0;
  const notes: string[] = [];
  const remember = (msg: string) => notes.length < 8 && notes.push(msg);

  for (const cells of body) {
    const rec: Record<string, string> = {};
    header.forEach((field, i) => {
      if (field && cells[i] != null) rec[field] = cells[i].trim();
    });
    const name = rec.name ?? "";
    if (!name) {
      skippedInvalid++;
      remember(`пропуск (нет имени): ${cells.join(", ").slice(0, 60)}`);
      continue;
    }
    const phone9 = digits(rec.phone ?? "").slice(-9);
    const emailLc = (rec.email ?? "").toLowerCase();
    if ((phone9.length >= 7 && seenPhones.has(phone9)) || (emailLc && seenEmails.has(emailLc))) {
      skippedDuplicates++;
      remember(`дубль: ${name} ${rec.phone ?? rec.email ?? ""}`);
      continue;
    }

    try {
      const res = await backendFetch("/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          leadName: `Лид · ${name}`,
          pipeline: rec.pipeline === "villa_house" ? "villa_house" : "land",
          contact: {
            name,
            phone: rec.phone || undefined,
            email: rec.email || undefined,
          },
          note: rec.note || undefined,
          tags: ["import", ...(rec.source ? [`channel:${rec.source.toLowerCase()}`] : [])],
          rwNumber: rec.rwNumber || undefined,
          source: "manual",
          kind: "import",
          autoTask: false,
        }),
      });
      if (res.ok) {
        created++;
        if (phone9.length >= 7) seenPhones.add(phone9);
        if (emailLc) seenEmails.add(emailLc);
      } else {
        skippedInvalid++;
        remember(`API ${res.status}: ${name}`);
      }
    } catch {
      skippedInvalid++;
      remember(`сеть: ${name}`);
    }
  }

  revalidatePath("/admin/crm");
  revalidatePath("/admin");
  return { ok: true, created, skippedDuplicates, skippedInvalid, notes };
}
