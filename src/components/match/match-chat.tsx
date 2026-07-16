"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Send, Sparkles, RefreshCw, Mic } from "lucide-react";
import { track } from "@vercel/analytics";
import { matchTurn, rerankMatches } from "@/lib/actions/match";
import { LeadForm } from "@/components/forms/lead-form";
import { MatchResultCard } from "@/components/match/match-result-card";
import { useSpeechInput } from "@/components/match/use-speech-input";
import type { BuyerProfile, MatchMessage, MatchResult } from "@/types/match";
import { cn } from "@/lib/utils/cn";

type Locale = "en" | "ru";

const COPY: Record<
  Locale,
  {
    opening: string;
    placeholder: string;
    send: string;
    thinking: string;
    fit: string;
    like: string;
    reject: string;
    resultsTitle: string;
    refine: string;
    relaxed: string;
    ctaTitle: string;
    ctaLede: string;
    ctaSubmit: string;
    ctaMessage: (summary: string) => string;
    empty: string;
    mic: string;
    micStop: string;
  }
> = {
  en: {
    opening:
      "Hi! I'll help you find the right place on Koh Phangan. First — are you buying to live, to invest, to rent out, or for holidays?",
    placeholder: "Type your answer…",
    send: "Send",
    thinking: "Thinking…",
    fit: "fit",
    like: "Like",
    reject: "Not for me",
    resultsTitle: "Your best matches",
    refine: "Refine with my picks",
    relaxed: "We widened the search a little to show you enough options:",
    ctaTitle: "Want a warm intro?",
    ctaLede:
      "Leave your contact and an agent will walk you through these — plus any off-market options that fit.",
    ctaSubmit: "Connect me with an agent",
    ctaMessage: (s) => `I used the AI matcher. What I'm after:\n${s}`,
    empty:
      "I couldn't find a close match in what's public right now — leave your contact and we'll check private/upcoming listings.",
    mic: "Speak",
    micStop: "Stop",
  },
  ru: {
    opening:
      "Привет! Помогу подобрать место на Пангане. Сначала — покупаете, чтобы жить, инвестировать, сдавать или для отдыха?",
    placeholder: "Введите ответ…",
    send: "Отправить",
    thinking: "Думаю…",
    fit: "фит",
    like: "Нравится",
    reject: "Не моё",
    resultsTitle: "Ваши лучшие совпадения",
    refine: "Уточнить по моим отметкам",
    relaxed: "Мы немного расширили поиск, чтобы показать достаточно вариантов:",
    ctaTitle: "Познакомить с агентом?",
    ctaLede:
      "Оставьте контакт — агент проведёт по этим объектам и покажет подходящие внерыночные варианты.",
    ctaSubmit: "Связать меня с агентом",
    ctaMessage: (s) => `Я прошёл ИИ-подбор. Что ищу:\n${s}`,
    empty:
      "Среди опубликованного сейчас близкого совпадения не нашлось — оставьте контакт, проверим закрытые/будущие объекты.",
    mic: "Голосом",
    micStop: "Стоп",
  },
};

const RELAX_LABEL: Record<Locale, Record<string, string>> = {
  en: {
    district: "area",
    budget: "budget",
    features: "views",
    bedrooms: "bedrooms",
    type: "type",
  },
  ru: {
    district: "район",
    budget: "бюджет",
    features: "виды",
    bedrooms: "спальни",
    type: "тип",
  },
};

/** Короткая человекочитаемая сводка профиля для сообщения лида. */
function summarize(p: BuyerProfile, liked: string[], locale: Locale): string {
  const bits: string[] = [];
  if (p.goal) bits.push(p.goal);
  if (p.type?.length) bits.push(p.type.join("/"));
  if (p.budgetMaxMThb) bits.push(`≤ ฿${p.budgetMaxMThb}M`);
  if (p.districts?.length) bits.push(p.districts.join(", "));
  if (p.tenure?.length) bits.push(p.tenure.join("/"));
  if (p.bedroomsMin)
    bits.push(`${p.bedroomsMin}+ ${locale === "ru" ? "спален" : "bed"}`);
  if (p.mustHaves?.length) bits.push(p.mustHaves.join(", "));
  const line = bits.join(" · ");
  const likedLine = liked.length
    ? `\n${locale === "ru" ? "Понравились" : "Liked"}: ${liked.join(", ")}`
    : "";
  return `${line}${likedLine}`;
}

export function MatchChat({ locale }: { locale: Locale }) {
  const t = COPY[locale];
  const [messages, setMessages] = useState<MatchMessage[]>([
    { role: "assistant", content: t.opening },
  ]);
  const [profile, setProfile] = useState<BuyerProfile>({ lang: locale });
  const [done, setDone] = useState(false);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [relaxations, setRelaxations] = useState<string[]>([]);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [rejected, setRejected] = useState<Set<string>>(new Set());
  const [input, setInput] = useState("");
  const [pending, startTransition] = useTransition();

  const speech = useSpeechInput(locale, (text) =>
    setInput((v) => (v ? `${v} ${text}` : text)),
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, pending]);

  function send(text: string) {
    const msg = text.trim();
    if (!msg || pending || done) return;
    const history = messages;
    setMessages((m) => [...m, { role: "user", content: msg }]);
    setInput("");
    startTransition(async () => {
      const res = await matchTurn({ message: msg, history, profile, locale });
      setProfile(res.profile);
      setMessages((m) => [...m, { role: "assistant", content: res.reply }]);
      if (res.done) {
        setDone(true);
        setResults(res.results ?? []);
        setRelaxations(res.relaxations ?? []);
        track("match_done", { count: res.results?.length ?? 0 });
      }
    });
  }

  function react(rw: string, kind: "like" | "reject") {
    if (kind === "like") {
      setLiked((s) => {
        const n = new Set(s);
        if (n.has(rw)) n.delete(rw);
        else n.add(rw);
        return n;
      });
      setRejected((s) => {
        const n = new Set(s);
        n.delete(rw);
        return n;
      });
    } else {
      setRejected((s) => {
        const n = new Set(s);
        if (n.has(rw)) n.delete(rw);
        else n.add(rw);
        return n;
      });
      setLiked((s) => {
        const n = new Set(s);
        n.delete(rw);
        return n;
      });
    }
  }

  function refine() {
    if (pending) return;
    startTransition(async () => {
      const res = await rerankMatches({
        profile,
        feedback: { liked: [...liked], rejected: [...rejected] },
        locale,
      });
      if (res.results.length) setResults(res.results);
      track("match_refine", { liked: liked.size, rejected: rejected.size });
    });
  }

  const visible = results.filter((r) => !rejected.has(r.rw));

  return (
    <div className="container-prose">
      {/* Диалог */}
      <div
        ref={scrollRef}
        className="max-h-[52vh] overflow-y-auto rounded-sm border border-forest-500/15 bg-cream-50 p-4 md:p-6"
      >
        <div className="flex flex-col gap-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={cn(
                "max-w-[85%] rounded-sm px-3.5 py-2.5 text-sm leading-relaxed",
                m.role === "assistant"
                  ? "self-start bg-forest-500/[0.06] text-forest-900"
                  : "self-end bg-panel text-panel-fg",
              )}
            >
              {m.content}
            </div>
          ))}
          {pending ? (
            <div className="self-start inline-flex items-center gap-2 rounded-sm bg-forest-500/[0.06] px-3.5 py-2.5 text-sm text-forest-500/70">
              <Sparkles className="h-4 w-4 animate-pulse text-brass-500" />
              {t.thinking}
            </div>
          ) : null}
        </div>
      </div>

      {/* Ввод */}
      {!done ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="mt-3 flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.placeholder}
            aria-label={t.placeholder}
            disabled={pending}
            className="flex-1 rounded-sm border border-forest-500/20 bg-cream-100 px-3.5 py-2.5 text-sm text-forest-900 placeholder:text-forest-500/45 focus:border-brass-500/50 focus:outline-none disabled:opacity-60"
          />
          {speech.supported ? (
            <button
              type="button"
              onClick={() =>
                speech.listening ? speech.stop() : speech.start()
              }
              disabled={pending}
              aria-pressed={speech.listening}
              title={speech.listening ? t.micStop : t.mic}
              className={cn(
                "inline-flex h-[42px] w-[42px] items-center justify-center rounded-sm border transition-colors disabled:opacity-50",
                speech.listening
                  ? "border-brass-500/50 bg-brass-500/15 text-brass-500"
                  : "border-forest-500/20 text-forest-500/60 hover:border-brass-500/40 hover:text-brass-500",
              )}
            >
              <Mic
                className={cn("h-4 w-4", speech.listening && "animate-pulse")}
              />
            </button>
          ) : null}
          <button
            type="submit"
            disabled={pending || !input.trim()}
            className="inline-flex items-center justify-center gap-1.5 rounded-sm bg-panel px-5 py-2.5 text-sm font-medium text-panel-fg transition-colors hover:bg-forest-400 disabled:opacity-50"
          >
            {t.send}
            <Send className="h-4 w-4" />
          </button>
        </form>
      ) : null}

      {/* Результаты */}
      {done ? (
        <div className="mt-10">
          {relaxations.length ? (
            <p className="mb-4 text-xs text-forest-500/70">
              {t.relaxed}{" "}
              <span className="text-forest-500">
                {relaxations.map((r) => RELAX_LABEL[locale][r] ?? r).join(", ")}
              </span>
            </p>
          ) : null}

          {visible.length ? (
            <>
              <div className="mb-5 flex items-center justify-between gap-3">
                <h2 className="font-serif text-2xl text-forest-900">
                  {t.resultsTitle}
                </h2>
                {liked.size || rejected.size ? (
                  <button
                    type="button"
                    onClick={refine}
                    disabled={pending}
                    className="inline-flex items-center gap-1.5 rounded-sm border border-forest-500/20 px-3.5 py-2 text-sm text-forest-500 transition-colors hover:border-brass-500/40 hover:text-brass-500 disabled:opacity-50"
                  >
                    <RefreshCw
                      className={cn("h-4 w-4", pending && "animate-spin")}
                    />
                    {t.refine}
                  </button>
                ) : null}
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {visible.map((r) => (
                  <MatchResultCard
                    key={r.rw}
                    result={r}
                    liked={liked.has(r.rw)}
                    rejected={rejected.has(r.rw)}
                    onReact={react}
                    labels={{ fit: t.fit, like: t.like, reject: t.reject }}
                  />
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-forest-500/75">{t.empty}</p>
          )}

          {/* CTA — тёплое знакомство с агентом (лид kind=match) */}
          <div className="mt-14 rounded-sm border border-forest-500/15 bg-cream-50 p-6 md:p-8">
            <h3 className="font-serif text-xl text-forest-900">{t.ctaTitle}</h3>
            <p className="mt-2 max-w-prose text-sm text-forest-500/75">
              {t.ctaLede}
            </p>
            <div className="mt-5">
              <LeadForm
                source="contact"
                kind="match"
                layout="block"
                submitLabel={t.ctaSubmit}
                defaultMessage={t.ctaMessage(
                  summarize(profile, [...liked], locale),
                )}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
