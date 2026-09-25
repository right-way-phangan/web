import { describe, expect, it } from "vitest";
import { parseLatLngText } from "./geo";

describe("parseLatLngText", () => {
  it("reads the Google Maps search URL returned by a short maps.app.goo.gl link", () => {
    expect(
      parseLatLngText(
        "https://www.google.com/maps/search/9.729605,+99.989908?entry=tts&skid=2aadb089",
      ),
    ).toEqual({ lat: 9.729605, lng: 99.989908 });
  });

  it("reads percent-encoded coordinates in a Google Maps search URL", () => {
    expect(parseLatLngText("https://www.google.com/maps/search/9.729605%2C%2099.989908")).toEqual({
      lat: 9.729605,
      lng: 99.989908,
    });
  });
});
