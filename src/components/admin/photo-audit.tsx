"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Loader2,
  ScanSearch,
  Trash2,
} from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

/** Одно подозрительное фото, помеченное vision-сканером. */
interface FlaggedPhoto {
  rwNumber: string;
  status: string;
  url: string;
  kind?: string;
  confidence?: "high" | "med" | "low";
  reason?: string;
}

interface AuditResponse {
  enabled: boolean;
  scanned: number;
  flagged: FlaggedPhoto[];
}

interface PurgeResponse {
  removed: number;
  objectsTouched: number;
  stillNeedsBlobPurge: string[];
}

const CONFIDENCE_LABEL: Record<NonNullable<FlaggedPhoto["confidence"]>, string> = {
  high: "высокая",
  med: "средняя",
  low: "низкая",
};

function confidenceClass(c?: FlaggedPhoto["confidence"]): string {
  if (c === "high") return "bg-red-50 text-red-700";
  if (c === "med") return "bg-brass-500/15 text-forest-900";
  return "bg-forest-900/5 text-forest-500";
}

export function PhotoAudit() {
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState<number | null>(null);
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [flagged, setFlagged] = useState<FlaggedPhoto[]>([]);
  const [error, setError] = useState<string | null>(null);
  // URL'ы фото, по которым идёт удаление (чтобы заблокировать кнопку).
  const [purging, setPurging] = useState<Record<string, boolean>>({});
  const [blobNotice, setBlobNotice] = useState<string[]>([]);

  async function runScan() {
    setScanning(true);
    setError(null);
    try {
      const res = await fetch("/admin/api/photo-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activeOnly: true }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setError(body.error ?? `Ошибка сканирования (${res.status}).`);
        return;
      }
      const data = (await res.json()) as AuditResponse;
      setEnabled(data.enabled);
      setScanned(data.scanned);
      setFlagged(Array.isArray(data.flagged) ? data.flagged : []);
    } catch {
      setError("Сетевая ошибка при сканировании.");
    } finally {
      setScanning(false);
    }
  }

  async function purge(url: string) {
    setPurging((p) => ({ ...p, [url]: true }));
    setError(null);
    try {
      const res = await fetch("/admin/api/photo-audit/purge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls: [url] }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setError(body.error ?? `Не удалось удалить (${res.status}).`);
        return;
      }
      const data = (await res.json()) as PurgeResponse;
      // Убираем фото из списка — на сайте оно уже не показывается.
      setFlagged((rows) => rows.filter((r) => r.url !== url));
      if (Array.isArray(data.stillNeedsBlobPurge) && data.stillNeedsBlobPurge.length > 0) {
        setBlobNotice((prev) => Array.from(new Set([...prev, ...data.stillNeedsBlobPurge])));
      }
    } catch {
      setError("Сетевая ошибка при удалении.");
    } finally {
      setPurging((p) => {
        const next = { ...p };
        delete next[url];
        return next;
      });
    }
  }

  const hasScanned = scanned !== null;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          onClick={runScan}
          disabled={scanning}
          className="inline-flex items-center gap-2 rounded-full bg-panel px-4 py-2 text-sm font-medium text-panel-fg transition hover:opacity-90 disabled:opacity-50"
        >
          {scanning ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ScanSearch className="h-4 w-4" />
          )}
          {scanning ? "Сканирую каталог…" : "Сканировать каталог"}
        </button>
        {hasScanned && !scanning ? (
          <span className="text-sm text-forest-500">
            Проверено <span className="font-semibold text-forest-900">{scanned}</span> фото ·
            подозрительных <span className="font-semibold text-forest-900">{flagged.length}</span>
          </span>
        ) : null}
      </div>

      {/* Сканер выключен в backend (нет ANTHROPIC_API_KEY). */}
      {enabled === false ? (
        <div className="mb-4 flex items-start gap-3 rounded-sm border border-brass-500/40 bg-brass-500/10 px-4 py-3 text-sm text-forest-900">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-brass-600" />
          <div>
            <p className="font-medium">Сканер выключен.</p>
            <p className="mt-1 text-forest-900/70">
              Vision-сканер не настроен. Чтобы включить, задайте{" "}
              <code className="rounded-sm bg-forest-900/5 px-1 py-0.5 text-xs">
                ANTHROPIC_API_KEY
              </code>{" "}
              в Vercel-проекте <strong>rightway-api</strong>.
            </p>
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="mb-3 flex items-center gap-2 rounded-sm bg-red-50 px-3 py-2 text-sm text-red-700">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          {error}
        </p>
      ) : null}

      {/* Напоминание про R2: строки удалены, но блоб ещё качается. */}
      {blobNotice.length > 0 ? (
        <div className="mb-4 flex items-start gap-3 rounded-sm border border-forest-900/10 bg-forest-500/[0.04] px-4 py-3 text-sm text-forest-900/80">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-brass-600" />
          <div>
            <p className="font-medium text-forest-900">
              Фото скрыто с сайта, но файл ещё лежит в R2 ({blobNotice.length}).
            </p>
            <p className="mt-1">
              URL остаётся открытым по прямой ссылке, пока его не вычистит отдельный скрипт
              (<code className="rounded-sm bg-forest-900/5 px-1 py-0.5 text-xs">
                clean-leaked-doc-photos.ts
              </code>{" "}
              — см. справочник).
            </p>
          </div>
        </div>
      ) : null}

      {/* Список подозрительных фото. */}
      {flagged.length > 0 ? (
        <ul className="space-y-3">
          {flagged.map((f) => {
            const busy = !!purging[f.url];
            return (
              <li
                key={f.url}
                className="flex flex-wrap items-start gap-4 rounded-sm border border-forest-900/10 bg-forest-500/[0.02] p-3 md:flex-nowrap"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={f.url}
                  alt=""
                  loading="lazy"
                  className="h-24 w-24 shrink-0 rounded-sm border border-forest-900/10 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/object/${f.rwNumber}` as Route}
                      target="_blank"
                      className="font-medium text-forest-900 hover:text-brass-500"
                    >
                      {f.rwNumber}
                    </Link>
                    <span className="rounded-full bg-forest-900/5 px-2 py-0.5 text-xs text-forest-500">
                      {f.status}
                    </span>
                    {f.kind ? (
                      <span className="rounded-full bg-forest-900/5 px-2 py-0.5 text-xs font-medium text-forest-900">
                        {f.kind}
                      </span>
                    ) : null}
                    {f.confidence ? (
                      <span
                        className={
                          "rounded-full px-2 py-0.5 text-xs font-medium " +
                          confidenceClass(f.confidence)
                        }
                      >
                        уверенность: {CONFIDENCE_LABEL[f.confidence]}
                      </span>
                    ) : null}
                  </div>
                  {f.reason ? (
                    <p className="mt-1.5 text-sm text-forest-900/70">{f.reason}</p>
                  ) : null}
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1.5 inline-block max-w-full truncate text-xs text-forest-500/60 hover:text-forest-500"
                    title={f.url}
                  >
                    {f.url}
                  </a>
                </div>
                <div className="shrink-0">
                  <button
                    onClick={() => purge(f.url)}
                    disabled={busy}
                    className="inline-flex items-center gap-1.5 rounded-sm bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                  >
                    {busy ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    Удалить из галереи
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}

      {/* Пусто после успешного скана. */}
      {hasScanned && !scanning && flagged.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="Документов не найдено"
          hint={
            enabled === false
              ? "Сканер выключен — запустить проверку нельзя, пока не задан ключ."
              : "Публичные фото чистые — внутренних документов в галерее не обнаружено."
          }
        />
      ) : null}

      {/* Стартовое состояние (до первого скана). */}
      {!hasScanned && !scanning ? (
        <EmptyState
          icon={ScanSearch}
          title="Запустите проверку каталога"
          hint="Vision-сканер пройдёт по фото активных объектов и пометит те, где видны документы, прайсы или скрины карт."
        />
      ) : null}

      <p className="mt-4 text-xs leading-relaxed text-forest-500/70">
        «Удалить из галереи» скрывает фото с сайта (строка <code>object_photos</code> удаляется
        сразу). Файл в R2 удаляется отдельным скриптом — см. справочник.
      </p>
    </div>
  );
}
