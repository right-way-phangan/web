// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSpring2d } from "./spring";

/** rAF-очередь с ручным тиком: кадр = +16.7 мс. */
function fakeFrames() {
  let now = 0;
  const queue: FrameRequestCallback[] = [];
  vi.stubGlobal("performance", { now: () => now });
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    queue.push(cb);
    return queue.length;
  });
  vi.stubGlobal("cancelAnimationFrame", () => queue.splice(0));
  return {
    tick(n = 1) {
      for (let i = 0; i < n; i++) {
        const cbs = queue.splice(0);
        now += 1000 / 60;
        for (const cb of cbs) cb(now);
      }
    },
    pending: () => queue.length,
  };
}

describe("createSpring2d", () => {
  let frames: ReturnType<typeof fakeFrames>;
  beforeEach(() => {
    frames = fakeFrames();
  });
  afterEach(() => vi.unstubAllGlobals());

  it("доходит до цели и останавливает rAF, когда улеглась", () => {
    const seen: [number, number][] = [];
    const s = createSpring2d((x, y) => seen.push([x, y]), {
      stiffness: 150,
      damping: 20,
      mass: 0.1,
    });
    s.set(100, -40);
    frames.tick(120);
    expect(seen.at(-1)).toEqual([100, -40]);
    expect(frames.pending()).toBe(0);
    // Первые кадры — ещё в пути, а не телепорт.
    expect(seen[0][0]).toBeGreaterThan(0);
    expect(seen[0][0]).toBeLessThan(100);
  });

  it("stop() снимает кадр, новая цель перезапускает", () => {
    const s = createSpring2d(() => {}, { stiffness: 200, damping: 15, mass: 0.3 });
    s.set(10, 10);
    expect(frames.pending()).toBe(1);
    s.stop();
    expect(frames.pending()).toBe(0);
    s.set(0, 0);
    expect(frames.pending()).toBe(1);
  });
});
