"use client";

import { useEffect, useState } from "react";

/**
 * Sticky bottom CTA — mobile only (lg:hidden). Keeps "Enquire" in reach while
 * the visitor scrolls the developer page; hides itself while the form (#enquire)
 * is on screen so it never covers it. No developer contacts here — the only CTA
 * is our own lead form (attribution gate).
 */
export function DeveloperCtaBar({ label }: { label: string }) {
  const [atForm, setAtForm] = useState(false);

  useEffect(() => {
    const el = document.getElementById("enquire");
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setAtForm(e.isIntersecting), {
      rootMargin: "0px 0px -40% 0px",
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const scrollToForm = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById("enquire");
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <div
      className={
        "fixed inset-x-0 bottom-0 z-40 border-t border-forest-500/10 bg-cream-100/95 backdrop-blur-md lg:hidden " +
        "transition-transform duration-300 [padding-bottom:env(safe-area-inset-bottom)] " +
        (atForm ? "translate-y-full" : "translate-y-0")
      }
    >
      <div className="px-4 py-2.5">
        <a
          href="#enquire"
          onClick={scrollToForm}
          className="inline-flex h-11 w-full items-center justify-center rounded-sm bg-forest-900 px-4 text-sm font-medium text-cream-50 transition-colors hover:bg-forest-900/90"
        >
          {label}
        </a>
      </div>
    </div>
  );
}
