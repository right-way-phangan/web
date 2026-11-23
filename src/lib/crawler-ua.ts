/**
 * Поисковые роботы с устаревшим JS-движком (Baiduspider-render и т.п.) падают на
 * современном бандле с «Invalid or unexpected token» — это не поломка сайта для
 * людей, а шум в TG-алертах. Маячок ошибок таких не репортит.
 */
const CRAWLER_UA = /bot\b|spider|crawl|slurp|headless|lighthouse|bytespider|petalbot/i;

export function isCrawlerUa(ua: string | null | undefined): boolean {
  return !!ua && CRAWLER_UA.test(ua);
}
