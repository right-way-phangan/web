import { beforeEach, describe, expect, it, vi } from "vitest";
import { reportClientError } from "./report-client-error";

const beacon = vi.fn(() => true);

describe("reportClientError", () => {
  beforeEach(() => {
    beacon.mockClear();
    Object.defineProperty(navigator, "sendBeacon", { value: beacon, configurable: true });
  });

  it("ошибку из расширения браузера не шлёт", () => {
    const err = new Error("Failed to connect to MetaMask");
    err.stack =
      "Error: Failed to connect to MetaMask\n    at Object.connect (chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn/scripts/inpage.js:7:84292)";
    reportClientError(err, "window");
    expect(beacon).not.toHaveBeenCalled();
  });

  it("ошибку своего кода шлёт", () => {
    const err = new Error("Cannot read properties of null (reading 'open')");
    err.stack = "Error: boom\n    at https://rightwaygroup.co/_next/static/chunks/app.js:1:1";
    reportClientError(err, "window");
    expect(beacon).toHaveBeenCalledOnce();
  });
});
