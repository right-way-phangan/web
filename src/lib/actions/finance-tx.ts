"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { appendTransactionToSheet, updateWalletsInSheet } from "@/lib/data/finance-sheet";
import { categoriesForScope, type TxScope, type Currency } from "@/lib/data/finance";

const DISPLAY_CURRENCIES: Currency[] = ["THB", "USD", "RUB"];

/**
 * Запись траты из формы /admin/finance/add в лист Transactions.
 * Под middleware-авторизацией /admin/*. Сфера/категория валидируются.
 */
export async function submitTransaction(formData: FormData): Promise<void> {
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
  const personal = Number(String(formData.get("personal") ?? "").replace(",", ".").trim());
  const business = Number(String(formData.get("business") ?? "").replace(",", ".").trim());

  if (!Number.isFinite(personal) || !Number.isFinite(business)) {
    redirect("/admin/finance/wallets?err=amount");
  }

  const res = await updateWalletsInSheet(Math.round(personal), Math.round(business));
  if (!res.ok) redirect("/admin/finance/wallets?err=save");

  revalidatePath("/admin/finance");
  redirect("/admin/finance?wallets=1");
}
