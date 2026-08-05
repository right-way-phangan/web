"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Вкладка/фильтр клиентского компонента, живущие в query-параметре: F5,
 * back/forward и «прислать ссылку коллеге» воспроизводят вид. Читаем через
 * useSearchParams (страницы админки force-dynamic, поэтому сервер и клиент
 * видят одни и те же параметры), пишем через history.replaceState — смена
 * вкладки не должна гнать страницу на серверный round-trip; Next синхронизирует
 * useSearchParams с нативным replaceState, скролл при этом не трогается.
 */
export function useUrlTab<T extends string>(
  key: string,
  allowed: readonly T[],
  fallback: T,
): [T, (next: T) => void] {
  const params = useSearchParams();
  const raw = params.get(key);
  const fromUrl = raw && (allowed as readonly string[]).includes(raw) ? (raw as T) : fallback;

  // Источник правды — локальное состояние (отклик мгновенный и не зависит от
  // того, подхватит ли роутер нативный replaceState), URL идёт следом.
  // Начальное значение читается из параметров, поэтому SSR и клиент совпадают.
  const [tab, setTabState] = useState<T>(fromUrl);
  useEffect(() => setTabState(fromUrl), [fromUrl]);

  const setTab = useCallback(
    (next: T) => {
      setTabState(next);
      const url = new URL(window.location.href);
      if (next === fallback) url.searchParams.delete(key);
      else url.searchParams.set(key, next);
      // Относительный адрес: полный URL браузер отвергает, если в текущем есть
      // что-то вроде Basic-кредов, а путь с параметрами принимается всегда.
      window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}`);
    },
    [key, fallback],
  );

  return [tab, setTab];
}
