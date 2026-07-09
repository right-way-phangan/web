import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type React from "react";
import { useLightboxGestures } from "./use-lightbox-gestures";

// Управляемые «часы»: хук читает Date.now() в pointerDown (start.time) и в
// pointerUp (now) — контролируем их, чтобы тесты были детерминированными.
let clock = 1000;
beforeEach(() => {
  clock = 1000;
  vi.spyOn(Date, "now").mockImplementation(() => clock);
});
afterEach(() => vi.restoreAllMocks());

const RECT = { left: 0, top: 0, width: 1000, height: 800, right: 1000, bottom: 800 };

function setup(over: Partial<Parameters<typeof useLightboxGestures>[0]> = {}) {
  const onPrev = vi.fn();
  const onNext = vi.fn();
  const hook = renderHook(() =>
    useLightboxGestures({ imageCount: 5, index: 0, active: true, onPrev, onNext, ...over }),
  );
  // stageRef обычно привязан к DOM; в тесте подставляем прямоугольник сцены,
  // иначе zoomAtPoint (ему нужен rect) молча выходит и зум не считается.
  (hook.result.current.stageRef as { current: HTMLDivElement | null }).current = {
    getBoundingClientRect: () => RECT,
  } as unknown as HTMLDivElement;
  return { ...hook, onPrev, onNext };
}

type Pt = { x: number; y: number };
const ev = (p: Pt, pointerId = 1) =>
  ({ pointerId, clientX: p.x, clientY: p.y, pointerType: "touch" }) as unknown as React.PointerEvent;

// Один «мазок» пальцем: down в `from` (время downAt) → up в `to` (время upAt).
function flick(
  result: ReturnType<typeof setup>["result"],
  from: Pt,
  to: Pt,
  downAt: number,
  upAt: number,
) {
  act(() => {
    clock = downAt;
    result.current.stageProps.onPointerDown(ev(from));
    clock = upAt;
    result.current.stageProps.onPointerUp(ev(to));
  });
}

describe("useLightboxGestures", () => {
  it("короткая серия свайпов не вызывает зум (регресс: ложный дабл-тап)", () => {
    const s = setup();
    // Два коротких свайпа по 30px — раньше засчитывались как тапы и давали
    // ложный дабл-тап → внезапный зум. Теперь не тап (сдвиг > 10px) и не свайп
    // (сдвиг < 40px): ничего не происходит.
    flick(s.result, { x: 200, y: 100 }, { x: 230, y: 100 }, 1000, 1080);
    flick(s.result, { x: 230, y: 100 }, { x: 260, y: 100 }, 1120, 1200);
    expect(s.result.current.zoom.scale).toBe(1);
    expect(s.onPrev).not.toHaveBeenCalled();
    expect(s.onNext).not.toHaveBeenCalled();
  });

  it("явный горизонтальный свайп листает", () => {
    const s = setup();
    flick(s.result, { x: 300, y: 100 }, { x: 200, y: 110 }, 1000, 1100); // влево 100px → next
    expect(s.onNext).toHaveBeenCalledTimes(1);
    flick(s.result, { x: 200, y: 100 }, { x: 320, y: 100 }, 1200, 1300); // вправо 120px → prev
    expect(s.onPrev).toHaveBeenCalledTimes(1);
  });

  it("свайп при imageCount = 1 не листает", () => {
    const s = setup({ imageCount: 1 });
    flick(s.result, { x: 300, y: 100 }, { x: 180, y: 100 }, 1000, 1100);
    expect(s.onNext).not.toHaveBeenCalled();
    expect(s.onPrev).not.toHaveBeenCalled();
  });

  it("двойной тап включает зум", () => {
    const s = setup();
    flick(s.result, { x: 500, y: 400 }, { x: 500, y: 400 }, 1000, 1050); // tap 1
    flick(s.result, { x: 500, y: 400 }, { x: 500, y: 400 }, 1100, 1150); // tap 2 (в пределах 300мс)
    expect(s.result.current.zoom.scale).toBeGreaterThan(1);
  });

  it("медленное касание не считается тапом (регресс: длительность)", () => {
    const s = setup();
    flick(s.result, { x: 500, y: 400 }, { x: 500, y: 400 }, 1000, 1050); // быстрый tap 1
    // Касание длится 350мс > 250 — это не тап, дабл-тапа нет.
    flick(s.result, { x: 500, y: 400 }, { x: 500, y: 400 }, 1100, 1450);
    expect(s.result.current.zoom.scale).toBe(1);
  });

  it("двойной тап при увеличении сбрасывает зум", () => {
    const s = setup();
    flick(s.result, { x: 500, y: 400 }, { x: 500, y: 400 }, 1000, 1050);
    flick(s.result, { x: 500, y: 400 }, { x: 500, y: 400 }, 1100, 1150);
    expect(s.result.current.zoom.scale).toBeGreaterThan(1);
    flick(s.result, { x: 500, y: 400 }, { x: 500, y: 400 }, 1200, 1250);
    flick(s.result, { x: 500, y: 400 }, { x: 500, y: 400 }, 1300, 1350);
    expect(s.result.current.zoom.scale).toBe(1);
  });

  it("мышиные события (не touch) не листают свайпом", () => {
    const s = setup();
    act(() => {
      clock = 1000;
      s.result.current.stageProps.onPointerDown({
        pointerId: 1,
        clientX: 300,
        clientY: 100,
        pointerType: "mouse",
      } as unknown as React.PointerEvent);
      clock = 1100;
      s.result.current.stageProps.onPointerUp({
        pointerId: 1,
        clientX: 150,
        clientY: 100,
        pointerType: "mouse",
      } as unknown as React.PointerEvent);
    });
    expect(s.onNext).not.toHaveBeenCalled();
    expect(s.onPrev).not.toHaveBeenCalled();
  });
});
