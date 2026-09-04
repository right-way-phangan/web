import { notFound } from "next/navigation";

/**
 * Catch-all under /ru so an unknown Russian URL reaches the RU not-found
 * (`app/ru/not-found.tsx`) instead of the root one. Without this Next served
 * the prerendered `/_not-found` — English copy in SSR, and only the client
 * flipped it to Russian after hydration. Static segments win over `[...]`,
 * so real /ru pages are unaffected.
 */
export default function RuCatchAll(): never {
  notFound();
}
