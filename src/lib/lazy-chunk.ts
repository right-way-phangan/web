/**
 * Повтор загрузки ленивого чанка.
 *
 * Зачем: `next/dynamic` грузит чанк ровно один раз. Оборвалась сеть на
 * мобильном, вмешался блокировщик, вкладка висела открытой через деплой —
 * промис отклоняется навсегда, и отказ всплывает либо как «Loading chunk NNNN
 * failed» в алертах, либо (что хуже) роняет всю страницу в error boundary.
 * Файл при этом на месте: чанки из сентябрьских алертов отдавали 200.
 *
 * Webpack 5 при провале убирает чанк из installedChunks, поэтому повторный
 * import() честно идёт в сеть, а не отдаёт закэшированный отказ.
 */
export function retryChunk<T>(load: () => Promise<T>, attempts = 3, delayMs = 500): Promise<T> {
  return load().catch((err: unknown) => {
    if (attempts <= 1) throw err;
    // Бэкофф растёт: 500 мс → 1000 мс. Обрыв сети редко чинится мгновенно, а
    // ждать дольше нет смысла — пользователь уже смотрит на скелетон.
    return new Promise<void>((resolve) => setTimeout(resolve, delayMs)).then(() =>
      retryChunk(load, attempts - 1, delayMs * 2),
    );
  });
}

/** Флаг живёт в рамках вкладки: вторая подряд неудача не должна крутить reload. */
const RELOAD_FLAG = "rw:chunk-reload";

const CHUNK_ERROR = /loading chunk \S+ failed|chunkloaderror|loading css chunk/i;

/**
 * Чанк самой страницы (не наш ленивый import, а тот, что грузит Next) оборвался
 * — интерактив на странице мёртв: фильтры не нажимаются, карта не появится.
 * Перезагрузка чинит это полностью, потому что файл на месте, сорвалась именно
 * доставка.
 *
 * Три предохранителя: не в /admin (там в формах бывает несохранённый ввод),
 * не поверх заполненных полей и ровно один раз за вкладку — если и после
 * перезагрузки чанк не пришёл, дело не в сети, и пусть летит алерт.
 *
 * @returns true — страница перезагружается, алерт не нужен.
 */
export function recoverFromChunkError(err: unknown): boolean {
  if (!CHUNK_ERROR.test(err instanceof Error ? err.message : "")) return false;
  if (window.location.pathname.startsWith("/admin")) return false;
  if (hasUserInput()) return false;
  try {
    if (window.sessionStorage.getItem(RELOAD_FLAG)) return false;
    window.sessionStorage.setItem(RELOAD_FLAG, "1");
  } catch {
    // Приватный режим/заблокированное хранилище: без флага цикл не остановить.
    return false;
  }
  window.location.reload();
  return true;
}

/** Перезагрузка унесёт то, что человек уже набрал, — этого не делаем. */
function hasUserInput(): boolean {
  return Array.from(document.querySelectorAll("input, textarea")).some(
    (el) => (el as HTMLInputElement | HTMLTextAreaElement).value.trim().length > 0,
  );
}
