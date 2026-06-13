"use client";

import { useState } from "react";

/**
 * Квиз самопроверки агента (страница «Проверь себя» в секции «Обучение»).
 * Вопросы — по ключевым правилам, которые агент обязан знать с первых дней
 * (периметр услуг, комиссия, leasehold, медиа, SLA, честность). Вставляется
 * в markdown маркером {{quiz}}. Чисто клиентский, без backend.
 */

interface QuizQuestion {
  q: string;
  options: string[];
  correct: number;
  why: string;
}

const QUESTIONS: QuizQuestion[] = [
  {
    q: "Что из этого Right Way НЕ делает?",
    options: [
      "Купля-продажа земли",
      "Управление недвижимостью, ремонты, краткосрочная аренда",
      "Off-plan проекты застройщиков",
      "Сопровождение сделок",
    ],
    correct: 1,
    why: "На старте только купля-продажа земли/вилл/домов + сопровождение. Управление, ремонты, аренда — вне периметра.",
  },
  {
    q: "Кто платит нам комиссию?",
    options: [
      "Покупатель, сверху к цене",
      "Пополам покупатель и продавец",
      "Продавец, она зашита в цену",
      "Зависит от объекта",
    ],
    correct: 2,
    why: "Комиссия только с продавца, зашита в цену: max(5%; 150 000 THB). Покупателю комиссию не называем.",
  },
  {
    q: "Какой основной продукт после фрихолд-пивота?",
    options: [
      "Freehold-земля на иностранца напрямую",
      "Leasehold: аренда земли + вилла в собственности",
      "Покупка через номинального владельца",
      "Только краткосрочная аренда",
    ],
    correct: 1,
    why: "Freehold на иностранца токсичен (проверки номиналов). Рабочая схема — leasehold: аренда земли + вилла.",
  },
  {
    q: "Клиент-иностранец просит купить землю во freehold на своё имя. Что отвечаешь?",
    options: [
      "Обещаю оформить через тайскую компанию с номиналом",
      "Объясняю, что напрямую почти невозможно, предлагаю leasehold",
      "Говорю, что это легко",
      "Отказываю без объяснений",
    ],
    correct: 1,
    why: "Не обещаем схем с номиналами. Честно объясняем ограничение и предлагаем leasehold (аренда земли + вилла).",
  },
  {
    q: "Объект не показывается на сайте. Первая причина для проверки?",
    options: [
      "Сломался сайт",
      "Нет фото-обложки или статус не Active",
      "Объект удалён навсегда",
      "Нужно ждать сутки",
    ],
    correct: 1,
    why: "Сайт автоматически скрывает объекты без фото-обложки или не в статусе Active. Залей фото / поставь Active — вернётся сам.",
  },
  {
    q: "Скорость первого ответа на лид в Telegram в рабочее время?",
    options: ["До 24 часов", "До 4 часов", "До 1 часа", "Когда будет время"],
    correct: 2,
    why: "SLA для Telegram в рабочее время (9–21 БКК) — до 1 часа. В нерабочее — до 12 часов.",
  },
  {
    q: "Куда можно положить скриншот прайса/комиссии застройщика?",
    options: [
      "В PHOTOS объекта",
      "В DOCS (непублично)",
      "Никуда — это конфиденциально, удалять",
      "В описание объекта",
    ],
    correct: 2,
    why: "Прайсы и комиссии застройщика конфиденциальны: ни в PHOTOS, ни в DOCS (blob-URL открыт). Удалять, в т.ч. сам blob.",
  },
  {
    q: "Где фиксируется каждый разговор с клиентом?",
    options: [
      "В голове / памяти",
      "Заметкой в карточке лида в CRM",
      "В личном блокноте",
      "Нигде, если ничего важного",
    ],
    correct: 1,
    why: "Каждый разговор — заметка в карточке CRM, каждая договорённость — задача с датой. Память не считается.",
  },
];

export function GuideQuiz() {
  const [answers, setAnswers] = useState<(number | null)[]>(() => QUESTIONS.map(() => null));
  const [checked, setChecked] = useState(false);

  const pick = (qi: number, oi: number) => {
    if (checked) return;
    setAnswers((prev) => {
      const next = prev.slice();
      next[qi] = oi;
      return next;
    });
  };

  const score = answers.filter((a, i) => a === QUESTIONS[i].correct).length;
  const allAnswered = answers.every((a) => a !== null);

  return (
    <div className="space-y-5">
      {QUESTIONS.map((item, qi) => (
        <div key={qi} className="rounded-xl border border-forest-900/10 bg-white p-4">
          <p className="font-semibold text-forest-900">
            {qi + 1}. {item.q}
          </p>
          <ul className="mt-3 space-y-1.5">
            {item.options.map((opt, oi) => {
              const picked = answers[qi] === oi;
              const isCorrect = oi === item.correct;
              let cls = "border-forest-900/15 hover:bg-forest-900/[0.03]";
              if (checked) {
                if (isCorrect) cls = "border-forest-500/60 bg-forest-500/[0.08]";
                else if (picked) cls = "border-red-500/60 bg-red-50";
                else cls = "border-forest-900/10 opacity-70";
              } else if (picked) {
                cls = "border-brass-500 bg-brass-500/[0.08]";
              }
              return (
                <li key={oi}>
                  <button
                    type="button"
                    onClick={() => pick(qi, oi)}
                    disabled={checked}
                    className={"flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-sm transition " + cls}
                  >
                    <span className="shrink-0 text-forest-900/40">
                      {checked && isCorrect ? "✓" : checked && picked ? "✕" : String.fromCharCode(65 + oi)}
                    </span>
                    <span className="text-forest-900/85">{opt}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          {checked && (
            <p className="mt-2.5 rounded-lg bg-forest-900/[0.04] px-3 py-2 text-xs text-forest-900/70">
              {item.why}
            </p>
          )}
        </div>
      ))}

      <div className="flex flex-wrap items-center gap-4">
        {!checked ? (
          <button
            type="button"
            onClick={() => setChecked(true)}
            disabled={!allAnswered}
            className="rounded-full bg-forest-900 px-5 py-2 text-sm font-medium text-white transition enabled:hover:bg-forest-900/90 disabled:opacity-40"
          >
            Проверить ответы
          </button>
        ) : (
          <>
            <span className="text-sm font-semibold text-forest-900">
              Результат: {score} из {QUESTIONS.length}
              {score === QUESTIONS.length ? " — отлично!" : score >= 6 ? " — хорошо" : " — стоит перечитать регламенты"}
            </span>
            <button
              type="button"
              onClick={() => {
                setAnswers(QUESTIONS.map(() => null));
                setChecked(false);
              }}
              className="rounded-full border border-forest-900/20 px-4 py-2 text-sm font-medium text-forest-900/70 transition hover:bg-forest-900/5"
            >
              Пройти заново
            </button>
          </>
        )}
        {!checked && !allAnswered && (
          <span className="text-xs text-forest-900/45">Ответь на все вопросы, чтобы проверить</span>
        )}
      </div>
    </div>
  );
}
