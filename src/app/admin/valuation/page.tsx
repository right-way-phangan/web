import type { Metadata } from "next";
import { ValuationTool, type ValuationHistoryRow } from "@/components/admin/valuation-tool";
import { backendFetch } from "@/lib/api/backend";
import type { ExternalComp } from "@/lib/actions/valuation";
import { isValuationLlmEnabled } from "@/lib/valuation/llm-explain";
import { getLiveRatesTHB } from "@/lib/data/fx-live";

export const metadata: Metadata = {
  title: "Оценка · RW Estimate",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";
// Скан каталога обогащает зоны по координатам (сетевые lookup'ы генплана на
// ~300 объектов при холодном кэше тайлов) — поднимаем лимит, чтобы первый скан
// не упёрся в дефолтный таймаут серверного экшена.
export const maxDuration = 60;

async function fetchJson<T>(path: string, fallback: T): Promise<T> {
  if (!process.env.OBJECTS_API_URL) return fallback;
  try {
    const r = await backendFetch(path, { cache: "no-store" });
    if (!r.ok) return fallback;
    return (await r.json()) as T;
  } catch {
    return fallback;
  }
}

/**
 * «RW Оценка» — гибридный оценщик (сравнительный + доходный + затратный) по
 * собственному каталогу, внешним компсам и Airbnb-аналитике. Результат —
 * вилка low–fair–high с разбивкой методов; не официальная оценка (appraisal),
 * а market estimate для интейка и переговоров.
 */
export default async function AdminValuationPage() {
  const [overrides, comps, history, rates] = await Promise.all([
    fetchJson<Array<{ key: string; value: number }>>("/valuation/factors", []),
    fetchJson<ExternalComp[]>("/valuation/comps", []),
    fetchJson<ValuationHistoryRow[]>("/valuations?limit=15", []),
    getLiveRatesTHB(),
  ]);
  const fx = rates ? { USD: rates.USD, RUB: rates.RUB, date: rates.date } : null;

  return (
    <section className="container-prose py-12 md:py-16">
      <div className="mb-8">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
          Admin · RW Оценка
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-forest-900 md:text-3xl">
          Оценка недвижимости
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-forest-900/70">
          Три метода по нашим данным: сравнительный (каталог + внешние компсы), доходный
          (ADR×загрузка из аналитики аренды) и затратный (земля + стройка). Выход — вилка
          low–fair–high с объяснением. Это market estimate для интейка и переговоров, не
          официальный appraisal.
        </p>
      </div>
      <ValuationTool overrides={overrides} comps={comps} history={history} llmEnabled={isValuationLlmEnabled()} fx={fx} />
    </section>
  );
}
