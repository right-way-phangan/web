"use client";

import { useLayoutEffect, useRef } from "react";
import { translateUi, type AdminLang } from "@/lib/i18n/admin-translate";

const ATTRS = ["placeholder", "title", "aria-label"] as const;
const SKIP = new Set(["SCRIPT", "STYLE", "TEXTAREA", "CODE", "PRE"]);

function translateTree(root: Node, lang: AdminLang) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  for (let n: Node | null = root; n; n = walker.nextNode()) {
    if (n.nodeType === Node.TEXT_NODE) {
      const parent = n.parentElement;
      if (!parent || SKIP.has(parent.tagName) || parent.closest("[data-no-translate]")) continue;
      const v = n.nodeValue ?? "";
      const t = translateUi(v, lang);
      if (t !== v) n.nodeValue = t;
    } else if (n instanceof HTMLElement) {
      for (const a of ATTRS) {
        const v = n.getAttribute(a);
        if (v) {
          const t = translateUi(v, lang);
          if (t !== v) n.setAttribute(a, t);
        }
      }
    }
  }
}

/**
 * Interface language for agents (users.lang en/th). The admin screens are
 * written in Russian; for an agent this layer swaps known UI strings via the
 * dictionary — on first paint and on every React update (MutationObserver).
 * Content stays hidden (data-i18n-pending + CSS) until the first pass, so the
 * agent never sees Russian flash. Admin (ru) renders children untouched.
 */
export function AdminTranslator({ lang, children }: { lang: AdminLang; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || lang === "ru") return;
    translateTree(root, lang);
    root.removeAttribute("data-i18n-pending");
    document.title = translateUi(document.title, lang);
    const obs = new MutationObserver((muts) => {
      for (const m of muts) {
        if (m.type === "characterData") translateTree(m.target, lang);
        else if (m.type === "attributes") translateTree(m.target, lang);
        else m.addedNodes.forEach((node) => translateTree(node, lang));
      }
    });
    obs.observe(root, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: [...ATTRS] });
    // Next sets <title> after navigation/streaming — keep the tab title translated too.
    const titleObs = new MutationObserver(() => {
      const t = translateUi(document.title, lang);
      if (t !== document.title) document.title = t;
    });
    titleObs.observe(document.head, { subtree: true, childList: true, characterData: true });
    return () => {
      obs.disconnect();
      titleObs.disconnect();
    };
  }, [lang]);
  if (lang === "ru") return <>{children}</>;
  return (
    <div ref={ref} data-i18n-pending="" lang={lang}>
      {children}
    </div>
  );
}
