import type { Metadata } from "next";
import Link from "next/link";
import { WalletsForm } from "@/components/admin/wallets-form";
import { loadTransactionsFromSheet, loadWalletsFromSheet } from "@/lib/data/finance-sheet";
import { getLiveRatesTHB } from "@/lib/data/fx-live";
import { bangkokToday, walletFor, walletStates, fmtTHB, FX, type Currency } from "@/lib/data/finance";

export const metadata: Metadata = {
  title: "Кассы",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const ERR: Record<string, string> = {
  amount: "Введи числовые суммы (можно 0 или отрицательное для Right Way).",
  save: "Не удалось сохранить. Проверь, что сервис-аккаунт — Редактор финансовой таблицы.",
};

export default async function WalletsPage({
  searchParams,
}: {
  searchParams: Promise<{ err?: string }>;
}) {
  const { err } = await searchParams;
  const [txSheet, walletsSheet, live] = await Promise.all([
    loadTransactionsFromSheet(),
    loadWalletsFromSheet(),
    getLiveRatesTHB(),
  ]);
  const allTx = txSheet ?? [];
  const today = bangkokToday();
  const wallets = walletsSheet ?? [];
  const fxDisp: Record<Currency, number> = { ...FX, RUB: live?.RUB ?? FX.RUB };
  const personalRaw = walletFor("личное", wallets, today);
  const businessRaw = walletFor("бизнес", wallets, today);
  const { personal, business } = walletStates(personalRaw, businessRaw, allTx, fxDisp);

  return (
    <section className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-md">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
          Admin · Финансы
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-forest-900">Кассы — личное / Right Way</h1>
        <p className="mb-6 mt-1 text-sm text-forest-900/60">
          🏠 <strong>Личные</strong> — реальные деньги на руках (вычитаются все траты). 🏢{" "}
          <strong>Right Way</strong> — наличные компании (пока счёта нет — обычно 0; минус на дашборде =
          вложено лично). Сейчас в расчёте: 🏠 {fmtTHB(personal.current)} · 🏢 {fmtTHB(business.current)}.
        </p>
        {err && ERR[err] && (
          <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {ERR[err]}
          </p>
        )}
        <WalletsForm
          personal={{ thb: personalRaw.thb, rub: personalRaw.rub, usd: personalRaw.usd }}
          business={{ thb: businessRaw.thb, rub: businessRaw.rub, usd: businessRaw.usd }}
        />
        <Link
          href="/admin/finance"
          className="mt-4 inline-block text-sm text-forest-900/55 hover:text-brass-600"
        >
          ← К финансовому дашборду
        </Link>
      </div>
    </section>
  );
}
