"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Голосовой ввод через браузерный Web Speech API — ноль затрат и серверов
 * (в отличие от faster-whisper бота, недоступного на Vercel). Feature-detect:
 * Chrome/Edge + Safari 14.5+ поддерживают (webkit-префикс), Firefox нет —
 * тогда `supported=false` и кнопка-микрофон не показывается, текст остаётся
 * основным путём. Результат кладётся в поле ввода: пользователь видит и правит
 * перед отправкой.
 */

type Locale = "en" | "ru";

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult:
    | ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void)
    | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function useSpeechInput(
  locale: Locale,
  onResult: (text: string) => void,
) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  // Detect after mount (window undefined on the server → avoid hydration split).
  useEffect(() => setSupported(getCtor() !== null), []);

  const stop = useCallback(() => {
    recRef.current?.stop();
    setListening(false);
  }, []);

  const start = useCallback(() => {
    const Ctor = getCtor();
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = locale === "ru" ? "ru-RU" : "en-US";
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e) => {
      const text = e.results?.[0]?.[0]?.transcript ?? "";
      if (text) onResultRef.current(text);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recRef.current = rec;
    setListening(true);
    try {
      rec.start();
    } catch {
      setListening(false);
    }
  }, [locale]);

  // Отменяем распознавание при размонтировании.
  useEffect(() => () => recRef.current?.abort(), []);

  return { supported, listening, start, stop };
}
