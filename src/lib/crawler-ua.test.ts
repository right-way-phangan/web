import { describe, expect, it } from "vitest";
import { isCrawlerUa } from "./crawler-ua";

describe("isCrawlerUa", () => {
  it("узнаёт роботов", () => {
    expect(isCrawlerUa("Mozilla/5.0 (compatible; Baiduspider-render/2.0; +http://www.baidu.com/search/spider.html)")).toBe(true);
    expect(isCrawlerUa("Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)")).toBe(true);
    expect(isCrawlerUa("Mozilla/5.0 (compatible; YandexBot/3.0)")).toBe(true);
    expect(isCrawlerUa("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 HeadlessChrome/120.0 Safari/537.36")).toBe(true);
  });

  it("пропускает людей", () => {
    expect(isCrawlerUa("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1")).toBe(false);
    expect(isCrawlerUa("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/131.0 Safari/537.36")).toBe(false);
    expect(isCrawlerUa("Mozilla/5.0 (Linux; Android 14; SM-A546B) AppleWebKit/537.36 Chrome/131.0 Mobile Safari/537.36")).toBe(false);
    expect(isCrawlerUa(undefined)).toBe(false);
  });
});
