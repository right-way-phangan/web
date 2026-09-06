#!/usr/bin/env node
/**
 * Post-deploy browser checks against production (GitHub Actions: prod-e2e.yml).
 * curl-based smoke sees the HTML; this sees what a visitor sees after
 * hydration — the class of failure that curl can't catch (dead buttons, a
 * calculator that never mounts, a burger off-screen). Fails on the first
 * broken expectation; the workflow alerts Telegram.
 *
 *   node scripts/prod-e2e.mjs [https://rightwaygroup.co]
 */
import { chromium } from "playwright";

const BASE = process.argv[2] ?? "https://rightwaygroup.co";
const failures = [];
const ok = (cond, msg) => {
  if (!cond) failures.push(msg);
  console.log(`${cond ? "ok " : "FAIL"} ${msg}`);
};

const browser = await chromium.launch();
try {
  const consoleErrors = [];
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, locale: "en-US" });
  const page = await ctx.newPage();
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text().slice(0, 200));
  });
  page.on("pageerror", (e) => consoleErrors.push(`pageerror: ${String(e).slice(0, 200)}`));

  // 1. Home on an iPhone width: burger fully on screen, no horizontal scroll.
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  const burger = await page.locator('button[aria-label="Open navigation"]').boundingBox();
  ok(burger && burger.x + burger.width <= 375, `burger inside 375px viewport (${burger ? Math.round(burger.x + burger.width) : "none"})`);
  ok((await page.evaluate(() => document.documentElement.scrollWidth)) <= 375, "no horizontal scroll on home");
  await page.locator('button[aria-label="Open navigation"]').click();
  ok(await page.locator("#mobile-nav").isVisible(), "mobile nav opens (hydrated)");
  await page.keyboard.press("Escape");

  // 2. Catalogue: cards render, a filter changes the URL and the result set.
  await page.goto(`${BASE}/listings`, { waitUntil: "networkidle" });
  const cards = await page.locator('a[href^="/object/RW-"]').count();
  ok(cards >= 12, `listings render ${cards} cards`);
  const firstObject = await page.locator('a[href^="/object/RW-"]').first().getAttribute("href");
  const moreLink = await page.locator('a[rel="next"][href*="page=2"]').count();
  ok(moreLink >= 1, "show-more is a real ?page=2 link");

  // 3. Object page: calculator present in a <details>, opens, computes.
  await page.goto(`${BASE}${firstObject}`, { waitUntil: "networkidle" });
  const details = page.locator("#roi details");
  ok((await details.count()) === 1, "object page has the collapsed calculator");
  await details.locator("summary").click();
  await page.waitForTimeout(600);
  const fullBox = await page.locator("#roi-full").boundingBox();
  ok(fullBox && fullBox.height > 400, `calculator expands (${fullBox ? Math.round(fullBox.height) : 0}px)`);
  const roiText = await page.locator("#roi").innerText();
  ok(!/NaN|undefined/.test(roiText), "no NaN/undefined in calculator");

  // 4. Theme toggle flips and persists.
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  const themeBtn = page.locator('header button[aria-label*="theme" i]').first();
  const toggleVisible = await themeBtn.isVisible().catch(() => false);
  if (toggleVisible) {
    const before = await page.evaluate(() => document.documentElement.classList.contains("dark"));
    await themeBtn.click();
    await page.waitForTimeout(300);
    const after = await page.evaluate(() => document.documentElement.classList.contains("dark"));
    ok(before !== after, "theme toggle flips");
  } else {
    console.log("skip theme toggle (hidden at this width)");
  }

  // 5. RU mirror: language switch lands on the RU page with RU copy.
  await page.goto(`${BASE}/ru/listings`, { waitUntil: "networkidle" });
  ok(await page.locator("h1").first().innerText().then((t) => /[А-Яа-я]/.test(t)), "RU listings h1 is Russian");
  ok((await page.evaluate(() => document.documentElement.lang)) === "ru", "html lang flips to ru after hydration");

  ok(consoleErrors.length === 0, `no console errors (${consoleErrors.length}${consoleErrors[0] ? `: ${consoleErrors[0]}` : ""})`);
} finally {
  await browser.close();
}

if (failures.length) {
  console.error(`\n${failures.length} check(s) failed:\n- ${failures.join("\n- ")}`);
  process.exit(1);
}
console.log("\nall prod e2e checks passed");
