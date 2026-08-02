import { describe, expect, it } from "vitest";
import {
  progressToTime,
  quantizeToFrame,
  segmentOpacity,
  shouldEnableFlight,
  type FadeWindow,
  type FlightGateInput,
} from "./scrub";

describe("progressToTime", () => {
  it("maps start to 0 and the usable end (1 − tail) to full duration", () => {
    expect(progressToTime(0, 10)).toBe(0);
    expect(progressToTime(0.9, 10, 0.1)).toBeCloseTo(10);
  });

  it("holds the final frame through the tail (clamps past 1 − tail)", () => {
    expect(progressToTime(0.95, 10, 0.1)).toBe(10);
    expect(progressToTime(1, 10, 0.1)).toBe(10);
    expect(progressToTime(2, 10, 0.1)).toBe(10);
  });

  it("with tail=0 is a straight linear map", () => {
    expect(progressToTime(0.5, 10, 0)).toBeCloseTo(5);
  });

  it("returns 0 for a non-positive duration (metadata not ready)", () => {
    expect(progressToTime(0.5, 0)).toBe(0);
    expect(progressToTime(0.5, NaN)).toBe(0);
  });
});

describe("quantizeToFrame", () => {
  it("snaps to the nearest frame boundary", () => {
    expect(quantizeToFrame(0.51, 24)).toBeCloseTo(12 / 24); // 0.5
    expect(quantizeToFrame(0.53, 24)).toBeCloseTo(13 / 24);
  });

  it("never returns a negative time", () => {
    expect(quantizeToFrame(-1, 24)).toBe(0);
  });

  it("degrades to the raw (clamped) time when fps is invalid", () => {
    expect(quantizeToFrame(3.3, 0)).toBe(3.3);
    expect(quantizeToFrame(-2, 0)).toBe(0);
  });
});

describe("segmentOpacity", () => {
  const win: FadeWindow = [0.1, 0.14, 0.24, 0.3];

  it("is 0 outside the window", () => {
    expect(segmentOpacity(0.05, win)).toBe(0);
    expect(segmentOpacity(0.1, win)).toBe(0);
    expect(segmentOpacity(0.3, win)).toBe(0);
    expect(segmentOpacity(0.4, win)).toBe(0);
  });

  it("is 1 across the plateau", () => {
    expect(segmentOpacity(0.14, win)).toBe(1);
    expect(segmentOpacity(0.19, win)).toBe(1);
    expect(segmentOpacity(0.24, win)).toBe(1);
  });

  it("ramps up on entry and down on exit", () => {
    expect(segmentOpacity(0.12, win)).toBeCloseTo(0.5); // midpoint of 0.1→0.14
    expect(segmentOpacity(0.27, win)).toBeCloseTo(0.5); // midpoint of 0.24→0.3
  });
});

describe("shouldEnableFlight", () => {
  const pass: FlightGateInput = {
    reduce: false,
    pointerFine: true,
    viewportWidth: 1440,
    minWidth: 1024,
    saveData: false,
    effectiveType: "4g",
    scrollY: 0,
    viewportHeight: 900,
  };

  it("enables when every gate passes", () => {
    expect(shouldEnableFlight(pass)).toBe(true);
    expect(shouldEnableFlight({ ...pass, effectiveType: undefined })).toBe(true);
  });

  it("stays off under reduced motion", () => {
    expect(shouldEnableFlight({ ...pass, reduce: true })).toBe(false);
  });

  it("stays off for touch / coarse pointers", () => {
    expect(shouldEnableFlight({ ...pass, pointerFine: false })).toBe(false);
  });

  it("stays off below the desktop width threshold", () => {
    expect(shouldEnableFlight({ ...pass, viewportWidth: 800 })).toBe(false);
  });

  it("respects Save-Data and slow connections", () => {
    expect(shouldEnableFlight({ ...pass, saveData: true })).toBe(false);
    expect(shouldEnableFlight({ ...pass, effectiveType: "2g" })).toBe(false);
    expect(shouldEnableFlight({ ...pass, effectiveType: "slow-2g" })).toBe(false);
  });

  it("stays off when the reader is already past the top", () => {
    expect(shouldEnableFlight({ ...pass, scrollY: 600 })).toBe(false); // > 900 * 0.5
    expect(shouldEnableFlight({ ...pass, scrollY: 450 })).toBe(true); // == 900 * 0.5, not past
  });
});
