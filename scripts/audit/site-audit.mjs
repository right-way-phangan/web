#!/usr/bin/env node
/**
 * Right Way — automated site audit.
 *
 * Headless crawl of the live site that catches the classes of regression the
 * manual audit on 2026-06-10 surfaced:
 *   - broken links / non-200 pages
 *   - console errors + uncaught exceptions (incl. React #418 hydration)
 *   - failed network requests
 *   - mobile horizontal overflow (layout blowouts)
 *   - scroll jank (page yanking up while reading)
 *   - Russian text leaking onto English pages (and vice-versa)
 *   - RU locale signals (<html lang>, og:locale)
 *   - robots.txt / sitemap.xml availability
 *
 * Usage:
 *   node site-audit.mjs                # quick mode vs prod (default)
 *   node site-audit.mjs --full         # crawl every internal link (slow)
 *   node site-audit.mjs --base=https://staging.example.com
 *   node site-audit.mjs --json=/path/report.json
 *
 * Exit code: 0 = all checks PASS/WARN, 1 = at least one FAIL. So a scheduler
 * (cron/launchd/CI) can alert only when something actually regressed.
 *
 * Requires puppeteer-core + a Chrome binary. run-audit.sh bootstraps both.
 */
import puppeteer from "puppeteer-core";
import fs from "fs";

const args = process.argv.slice(2);
const getArg = (k, d) => {
  const a = args.find((x) => x.startsWith(`--${k}=`));
  return a ? a.split("=").slice(1).join("=") : d;
};
const FULL = args.includes("--full");
const BASE = (getArg("base", process.env.AUDIT_BASE || "https://rightwaygroup.co")).replace(/\/$/, "");
const CHROME =
  process.env.CHROME_PATH ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const JSON_OUT = getArg("json", "");
const SAMPLE = Number(getArg("sample", "8")); // object/project pages sampled in quick mode

// Seed pages: every section, EN + RU.
const SEEDS = [
  "/", "/listings", "/projects", "/calculator", "/insights", "/knowledge",
  "/faq", "/about", "/services", "/process", "/contact", "/blog", "/districts", "/saved",
  "/ru", "/ru/listings", "/ru/projects", "/ru/calculator", "/ru/insights",
  "/ru/knowledge", "/ru/faq", "/ru/about", "/ru/services", "/ru/process",
  "/ru/contact", "/ru/blog", "/ru/districts", "/ru/saved",
];
// Pages we always run the mobile-overflow + scroll check on.
const LAYOUT_PAGES = ["/", "/listings", "/projects", "/calculator", "/insights", "/faq", "/contact"];

const results = { base: BASE, startedAt: new Date().toISOString(), pages: [], checks: [] };
const addCheck = (name, status, detail) => results.checks.push({ name, status, detail });

const isBenignFail = (s) =>
  // RSC prefetches the browser cancels on navigation — expected, not a defect.
  /_rsc=/.test(s) && /ERR_ABORTED/.test(s);

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

// ---------------------------------------------------------------- crawl
const visited = new Set();
const queue = [...SEEDS];
const page = await browser.newPage();
await page.setViewport({ width: 1366, height: 900 });

let crawledObjPages = 0;
while (queue.length) {
  const path = queue.shift();
  if (visited.has(path)) continue;
  // In quick mode, cap how many object/project detail pages we walk.
  const isDetail = /^\/(ru\/)?(object|projects|developers|districts|knowledge|blog)\/[^/]+$/.test(path);
  if (!FULL && isDetail && crawledObjPages >= SAMPLE) continue;
  visited.add(path);
  if (isDetail) crawledObjPages++;

  const consoleErrors = [], pageErrors = [], failedReq = [];
  const onConsole = (m) => m.type() === "error" && consoleErrors.push(m.text().slice(0, 200));
  const onPageErr = (e) => pageErrors.push(String(e).slice(0, 200));
  const onFailed = (r) => {
    const s = `${r.method()} ${r.url().slice(0, 120)} :: ${r.failure()?.errorText}`;
    if (!isBenignFail(s)) failedReq.push(s);
  };
  const onResp = (r) => r.status() >= 400 && failedReq.push(`HTTP ${r.status()} ${r.url().slice(0, 120)}`);
  page.on("console", onConsole); page.on("pageerror", onPageErr);
  page.on("requestfailed", onFailed); page.on("response", onResp);

  let status = 0, links = [];
  try {
    const resp = await page.goto(BASE + path, { waitUntil: "networkidle2", timeout: 45000 });
    status = resp?.status() ?? 0;
    await new Promise((r) => setTimeout(r, 400));
    links = await page.$$eval("a[href]", (as) => as.map((a) => a.getAttribute("href")).filter(Boolean));
  } catch (e) {
    pageErrors.push("NAV_FAIL: " + String(e).slice(0, 150));
  }
  page.off("console", onConsole); page.off("pageerror", onPageErr);
  page.off("requestfailed", onFailed); page.off("response", onResp);

  for (const href of links) {
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) continue;
    let p = href.startsWith("/") ? href : href.startsWith(BASE) ? href.slice(BASE.length) || "/" : null;
    if (!p) continue;
    p = p.split("#")[0].split("?")[0] || "/";
    if (p.startsWith("/admin")) continue;
    if (!visited.has(p) && !queue.includes(p)) queue.push(p);
  }
  results.pages.push({
    path, status,
    consoleErrors: [...new Set(consoleErrors)],
    pageErrors: [...new Set(pageErrors)],
    failedReq: [...new Set(failedReq)],
  });
  process.stderr.write(`[${status}] ${path}\n`);
}
await page.close();

// ---------------------------------------------------------------- analyse crawl
const non200 = results.pages.filter((p) => p.status !== 200);
addCheck("links_all_200", non200.length ? "FAIL" : "PASS",
  non200.length ? non200.map((p) => `${p.status} ${p.path}`) : `${results.pages.length} pages, all 200`);

const hyd = results.pages.filter((p) => p.pageErrors.some((e) => e.includes("418")));
const otherErr = results.pages.filter((p) => p.pageErrors.some((e) => !e.includes("418")));
addCheck("hydration_418", hyd.length ? "FAIL" : "PASS",
  hyd.length ? hyd.map((p) => p.path) : "no hydration mismatches");
addCheck("page_exceptions", otherErr.length ? "FAIL" : "PASS",
  otherErr.length ? otherErr.map((p) => `${p.path}: ${p.pageErrors.join("; ")}`) : "no uncaught exceptions");

const consolePages = results.pages.filter((p) => p.consoleErrors.length);
addCheck("console_errors", consolePages.length ? "WARN" : "PASS",
  consolePages.length ? consolePages.map((p) => `${p.path}: ${p.consoleErrors.join("; ")}`) : "clean console");

const failPages = results.pages.filter((p) => p.failedReq.length);
addCheck("failed_requests", failPages.length ? "WARN" : "PASS",
  failPages.length ? failPages.map((p) => `${p.path}: ${p.failedReq.join("; ")}`) : "no failed requests");

// ---------------------------------------------------------------- mobile layout + scroll
const m = await browser.newPage();
await m.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
const overflowHits = [], scrollHits = [];
for (const path of LAYOUT_PAGES) {
  try {
    await m.goto(BASE + path, { waitUntil: "networkidle2", timeout: 45000 });
    await new Promise((r) => setTimeout(r, 700));
    const layout = await m.evaluate(() => {
      const de = document.documentElement;
      const overflow = de.scrollWidth - de.clientWidth;
      let widest = [];
      if (overflow > 1) {
        widest = [...document.querySelectorAll("*")].map((el) => {
          const r = el.getBoundingClientRect();
          return { sel: el.tagName.toLowerCase() + (typeof el.className === "string" && el.className ? "." + el.className.trim().split(/\s+/).slice(0, 2).join(".") : ""), right: Math.round(r.right) };
        }).filter((x) => x.right > de.clientWidth + 2).sort((a, b) => b.right - a.right).slice(0, 4);
      }
      return { overflow, widest };
    });
    // Note: an overflow that comes only from intentional overflow-x-auto strips
    // (e.g. the project section nav) shows as small (<8px) document overflow; we
    // flag >8px as a real blowout.
    if (layout.overflow > 8) overflowHits.push({ path, overflow: layout.overflow, widest: layout.widest });

    const scroll = await m.evaluate(async () => {
      const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
      let last = 0, yanks = 0;
      const max = document.documentElement.scrollHeight;
      for (let y = 0; y <= max; y += 400) { window.scrollTo(0, y); await sleep(110); const c = window.scrollY; if (c < last - 5) yanks++; last = c; }
      return { yanks };
    });
    if (scroll.yanks > 0) scrollHits.push({ path, yanks: scroll.yanks });
  } catch (e) { overflowHits.push({ path, error: String(e).slice(0, 120) }); }
}
await m.close();
addCheck("mobile_overflow", overflowHits.length ? "FAIL" : "PASS",
  overflowHits.length ? overflowHits.map((h) => `${h.path}: +${h.overflow}px ${JSON.stringify(h.widest || h.error)}`) : "no mobile blowouts");
addCheck("scroll_jank", scrollHits.length ? "WARN" : "PASS",
  scrollHits.length ? scrollHits.map((h) => `${h.path}: ${h.yanks} yanks`) : "no scroll jank");

// ---------------------------------------------------------------- cyrillic-on-EN leak
const strip = (h) => h.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<style[\s\S]*?<\/style>/g, "").replace(/<[^>]+>/g, " ");
const enPaths = results.pages.map((p) => p.path).filter((p) => /^\/(object|projects|developers|districts|knowledge|blog)\//.test(p) || ["/", "/listings", "/projects", "/about", "/services", "/process", "/faq", "/insights", "/contact", "/knowledge", "/districts", "/blog"].includes(p));
const leaks = [];
for (const p of enPaths) {
  try {
    const txt = strip(await (await fetch(BASE + p)).text());
    const matches = txt.match(/[А-Яа-яЁё][А-Яа-яЁё \-,.;:()«»0-9]{3,}/g);
    if (matches) {
      const uniq = [...new Set(matches.map((s) => s.trim()))].filter((s) => s.length > 3).slice(0, 6);
      if (uniq.length) leaks.push(`${p}: ${uniq.join(" | ")}`);
    }
  } catch { /* ignore */ }
}
addCheck("cyrillic_on_en", leaks.length ? "FAIL" : "PASS", leaks.length ? leaks : "no Russian text on EN pages");

// ---------------------------------------------------------------- RU locale signals
try {
  const ruHtml = await (await fetch(BASE + "/ru")).text();
  const ogLocale = (ruHtml.match(/<meta property="og:locale" content="([^"]+)"/) || [])[1];
  addCheck("ru_og_locale", ogLocale === "ru_RU" ? "PASS" : "WARN", `og:locale=${ogLocale}`);
  const lp = await browser.newPage();
  await lp.goto(BASE + "/ru", { waitUntil: "networkidle2", timeout: 45000 });
  await new Promise((r) => setTimeout(r, 600));
  const lang = await lp.evaluate(() => document.documentElement.lang);
  await lp.close();
  addCheck("ru_html_lang", lang === "ru" ? "PASS" : "WARN", `runtime <html lang>=${lang}`);
} catch (e) { addCheck("ru_locale", "WARN", String(e).slice(0, 120)); }

// ---------------------------------------------------------------- robots + sitemap
for (const [name, p] of [["robots", "/robots.txt"], ["sitemap", "/sitemap.xml"]]) {
  try {
    const r = await fetch(BASE + p);
    addCheck(name, r.ok ? "PASS" : "WARN", `HTTP ${r.status}`);
  } catch (e) { addCheck(name, "WARN", String(e).slice(0, 80)); }
}

await browser.close();

// ---------------------------------------------------------------- report
results.finishedAt = new Date().toISOString();
const order = { FAIL: 0, WARN: 1, PASS: 2 };
results.checks.sort((a, b) => order[a.status] - order[b.status]);
const fails = results.checks.filter((c) => c.status === "FAIL");
const warns = results.checks.filter((c) => c.status === "WARN");

const icon = (s) => (s === "PASS" ? "✓" : s === "WARN" ? "▲" : "✗");
console.log(`\n=== Right Way site audit — ${BASE} ===`);
console.log(`${results.pages.length} pages crawled${FULL ? " (full)" : " (quick)"} · ${new Date().toISOString()}\n`);
for (const c of results.checks) {
  console.log(`${icon(c.status)} ${c.status.padEnd(4)} ${c.name}`);
  if (c.status !== "PASS") {
    const d = Array.isArray(c.detail) ? c.detail : [c.detail];
    d.slice(0, 12).forEach((line) => console.log(`        ${line}`));
    if (Array.isArray(c.detail) && c.detail.length > 12) console.log(`        …+${c.detail.length - 12} more`);
  }
}
console.log(`\n${fails.length} FAIL · ${warns.length} WARN · ${results.checks.length - fails.length - warns.length} PASS`);

if (JSON_OUT) {
  fs.writeFileSync(JSON_OUT, JSON.stringify(results, null, 2));
  console.log(`report → ${JSON_OUT}`);
}
process.exit(fails.length ? 1 : 0);
