import { beforeEach, describe, expect, it, vi } from "vitest";
import { recoverFromChunkError, retryChunk } from "./lazy-chunk";

describe("retryChunk", () => {
  it("отдаёт результат с первой попытки, не ретраит", async () => {
    const load = vi.fn(async () => "ok");
    await expect(retryChunk(load)).resolves.toBe("ok");
    expect(load).toHaveBeenCalledOnce();
  });

  it("переживает единичный обрыв сети", async () => {
    const load = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error("Loading chunk 1174 failed"))
      .mockResolvedValueOnce("ok");
    await expect(retryChunk(load, 3, 1)).resolves.toBe("ok");
    expect(load).toHaveBeenCalledTimes(2);
  });

  it("сдаётся после исчерпания попыток и отдаёт исходную ошибку", async () => {
    const load = vi.fn(() => Promise.reject(new Error("Loading chunk 1174 failed")));
    await expect(retryChunk(load, 3, 1)).rejects.toThrow("Loading chunk 1174 failed");
    expect(load).toHaveBeenCalledTimes(3);
  });
});

describe("recoverFromChunkError", () => {
  const reload = vi.fn();

  beforeEach(() => {
    reload.mockClear();
    sessionStorage.clear();
    document.body.innerHTML = "";
    Object.defineProperty(window, "location", {
      value: { pathname: "/listings", reload },
      writable: true,
      configurable: true,
    });
  });

  it("обычную ошибку не трогает", () => {
    expect(recoverFromChunkError(new Error("Cannot read properties of null"))).toBe(false);
    expect(reload).not.toHaveBeenCalled();
  });

  it("оборванный чанк чинит перезагрузкой", () => {
    expect(recoverFromChunkError(new Error("Loading chunk 6183 failed."))).toBe(true);
    expect(reload).toHaveBeenCalledOnce();
  });

  it("второй раз подряд не перезагружает — иначе цикл", () => {
    recoverFromChunkError(new Error("Loading chunk 6183 failed."));
    reload.mockClear();
    expect(recoverFromChunkError(new Error("Loading chunk 1174 failed."))).toBe(false);
    expect(reload).not.toHaveBeenCalled();
  });

  it("в админке не перезагружает — там несохранённые формы", () => {
    window.location.pathname = "/admin/new";
    expect(recoverFromChunkError(new Error("Loading chunk 6183 failed."))).toBe(false);
    expect(reload).not.toHaveBeenCalled();
  });

  it("не перезагружает поверх заполненного поля", () => {
    document.body.innerHTML = '<input id="x" />';
    (document.getElementById("x") as HTMLInputElement).value = "Vladimir";
    expect(recoverFromChunkError(new Error("Loading chunk 6183 failed."))).toBe(false);
    expect(reload).not.toHaveBeenCalled();
  });
});
