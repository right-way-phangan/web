"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { appendTransactionToSheet, updateWalletsInSheet } from "@/lib/data/finance-sheet";
import { categoriesForScope, type TxScope, type Currency } from "@/lib/data/finance";
import { isAdmin } from "@/lib/auth/require-admin";

const DISPLAY_CURRENCIES: Currency[] = ["THB", "USD", "RUB"];

/**
 * Запись траты из формы /admin/finance/add в лист Transactions.
 * Под middleware-авторизацией /admin/*. Сфера/категория валидируются.
 */
export async function submitTransaction(formData: FormData): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/crm");
  const amount = Number(String(formData.get("amount") ?? "").replace(",", ".").trim());
  const rawCur = String(formData.get("currency") ?? "THB").toUpperCase() as Currency;
  const currency: Currency = DISPLAY_CURRENCIES.includes(rawCur) ? rawCur : "THB";
  const scope: TxScope = String(formData.get("scope") ?? "личное") === "бизнес" ? "бизнес" : "личное";
  let category = String(formData.get("category") ?? "Прочее").trim();
  const note = String(formData.get("note") ?? "").trim();

  if (!Number.isFinite(amount) || amount <= 0) {
    redirect("/admin/finance/add?err=amount");
  }
  if (!categoriesForScope(scope).includes(category)) category = "Прочее";

  const res = await appendTransactionToSheet({
    scope,
    amountOrig: amount,
    currency,
    category,
    note: note || "—",
    source: "web",
  });

  if (!res.ok) redirect(`/admin/finance/add?err=save&scope=${scope}`);

  revalidatePath("/admin/finance");
  redirect("/admin/finance?added=1");
}

/**
 * Обновление остатков двух касс (личное / Right Way) из /admin/finance/wallets.
 * Пишет суммы с сегодняшней датой as-of; дальше траты вычитаются автоматически.
 */
export async function setWalletBalances(formData: FormData): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/crm");
  const numOf = (k: string) => Number(String(formData.get(k) ?? "0").replace(",", ".").trim() || "0");
  const personal = {
    thb: numOf("personalThb"),
    rub: numOf("personalRub"),
    usd: numOf("personalUsd"),
  };
  const business = {
    thb: numOf("businessThb"),
    rub: numOf("businessRub"),
    usd: numOf("businessUsd"),
  };

  const allFinite = [personal, business].every((w) =>
    [w.thb, w.rub, w.usd].every((n) => Number.isFinite(n)),
  );
  if (!allFinite) redirect("/admin/finance/wallets?err=amount");

  const res = await updateWalletsInSheet(
    { thb: Math.round(personal.thb), rub: Math.round(personal.rub), usd: Math.round(personal.usd) },
    { thb: Math.round(business.thb), rub: Math.round(business.rub), usd: Math.round(business.usd) },
  );
  if (!res.ok) redirect("/admin/finance/wallets?err=save");

  revalidatePath("/admin/finance");
  redirect("/admin/finance?wallets=1");
}
