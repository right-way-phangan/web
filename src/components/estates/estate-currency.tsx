"use client";

/**
 * Валюта на странице участков — теперь общий модуль `@/components/ui/currency`
 * (тот же ключ localStorage, что и на проектах → курс переносится). Тонкий
 * ре-экспорт под историческими именами, чтобы estate-компоненты не править.
 */
export {
  CurrencyProvider as EstateCurrencyProvider,
  useCurrency as useEstateCurrency,
  CurrencyToggle,
  TOGGLE_CURRENCIES as ESTATE_CURRENCIES,
} from "@/components/ui/currency";
