/**
 * Transaction execution checklist for a Phangan leasehold deal — the concrete
 * steps from reservation to land-office transfer, grouped by deal stage. Lead
 * management is rich; this is the "don't fumble a deal in progress" layer, per
 * the DD SOP (L2 Transaction DD, lawyer Анас) and the commission model.
 *
 * Stored as leads.deal_checklist (stepKey → ISO done-at). Template lives here so
 * the DB only records what's checked.
 */
export interface ChecklistStep {
  key: string;
  label: string;
}
export interface ChecklistGroup {
  stageKey: string; // matches the lead stage that opens this group
  title: string;
  steps: ChecklistStep[];
}

export const DEAL_CHECKLIST: ChecklistGroup[] = [
  {
    stageKey: "reservation",
    title: "Бронь",
    steps: [
      { key: "res_deposit", label: "Резервный депозит получен" },
      { key: "res_agreement", label: "Соглашение о брони подписано" },
      { key: "res_offmarket", label: "Объект снят с продажи (Reserved)" },
    ],
  },
  {
    stageKey: "dd",
    title: "Due Diligence (L2, юрист Анас)",
    steps: [
      { key: "dd_lawyer", label: "Юрист подключён (Анас)" },
      { key: "dd_title", label: "Чанот / титул проверен" },
      { key: "dd_zoning", label: "Зонирование (ผังเมือง) подтверждено" },
      { key: "dd_access", label: "Доступ / дорога (сервитут) проверены" },
      { key: "dd_encumbrance", label: "Обременения / залоги проверены" },
      { key: "dd_report", label: "Отчёт DD получен" },
    ],
  },
  {
    stageKey: "spa",
    title: "Договор (SPA / аренда)",
    steps: [
      { key: "spa_draft", label: "Договор составлен" },
      { key: "spa_review", label: "Договор проверен сторонами" },
      { key: "spa_schedule", label: "График платежей согласован" },
      { key: "spa_signed", label: "Договор подписан" },
    ],
  },
  {
    stageKey: "transfer",
    title: "Передача",
    steps: [
      { key: "tr_balance", label: "Остаток оплачен" },
      { key: "tr_landoffice", label: "Запись в земельном офисе" },
      { key: "tr_done", label: "Передача завершена" },
      { key: "tr_commission", label: "Комиссия выставлена / получена" },
    ],
  },
];

/** Stages at which the deal checklist is relevant (reservation onward + won). */
export const DEAL_STAGE_KEYS = new Set([
  "reservation",
  "dd",
  "spa",
  "transfer",
  "won",
]);

const ALL_STEPS = DEAL_CHECKLIST.flatMap((g) => g.steps);

export interface DealProgress {
  doneCount: number;
  total: number;
  /** Title of the first group with an unchecked step — the active focus. */
  nextGroup: string | null;
}

export function dealProgress(checklist: Record<string, string> | null | undefined): DealProgress {
  const done = checklist ?? {};
  const doneCount = ALL_STEPS.filter((s) => done[s.key]).length;
  const nextGroup =
    DEAL_CHECKLIST.find((g) => g.steps.some((s) => !done[s.key]))?.title ?? null;
  return { doneCount, total: ALL_STEPS.length, nextGroup };
}
