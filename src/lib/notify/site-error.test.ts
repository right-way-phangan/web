import { describe, expect, it } from "vitest";
import { errorFingerprint, isNoise, normalizePath } from "./site-error";

describe("site-error", () => {
  it("normalizePath прячет номера объектов и query", () => {
    expect(normalizePath("https://rightwaygroup.co/object/RW-V0012?calc=open")).toBe("/object/RW-*");
    expect(normalizePath("/ru/listings?page=2")).toBe("/ru/listings");
    expect(normalizePath("/blog/2026-09-07-title")).toBe("/blog/*-*-*-title");
    expect(normalizePath(undefined)).toBe("/");
    expect(normalizePath("not a url")).toMatch(/^\/not/);
  });

  it("отпечаток одинаков для одной ошибки на разных объектах и с разными числами", () => {
    const a = errorFingerprint({ source: "client", message: "Cannot read properties of undefined (reading 'x') at line 12", url: "/object/RW-V0001" });
    const b = errorFingerprint({ source: "client", message: "Cannot read properties of undefined (reading 'x') at line 99", url: "/object/RW-L0042?x=1" });
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{8}$/);
  });

  it("отпечаток различает источник, страницу и сообщение", () => {
    const base = { source: "client" as const, message: "boom", url: "/listings" };
    expect(errorFingerprint(base)).not.toBe(errorFingerprint({ ...base, source: "server" }));
    expect(errorFingerprint(base)).not.toBe(errorFingerprint({ ...base, url: "/insights" }));
    expect(errorFingerprint(base)).not.toBe(errorFingerprint({ ...base, message: "bang" }));
  });

  it("шум браузеров отсеивается, реальные ошибки — нет", () => {
    expect(isNoise("ResizeObserver loop completed with undelivered notifications.")).toBe(true);
    expect(isNoise("Script error.")).toBe(true);
    expect(isNoise("Load failed")).toBe(true);
    expect(isNoise("TypeError: Failed to fetch")).toBe(true);
    expect(isNoise("Minified React error #418")).toBe(false);
    expect(isNoise("Cannot read properties of null (reading 'open')")).toBe(false);
  });
});
