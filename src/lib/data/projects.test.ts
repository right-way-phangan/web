import { describe, expect, it } from "vitest";
import { projectAvailability } from "./projects";
import type { RealEstateObject } from "@/types/object";

const project = (unitsTotal?: number, unitsAvailable?: number) =>
  ({ rwNumber: "RW-P0018", unitsTotal, unitsAvailable }) as unknown as RealEstateObject;

const unit = (rwNumber: string, status = "Active") =>
  ({ rwNumber, status }) as unknown as RealEstateObject;

describe("projectAvailability", () => {
  it("falls back to the project's own counters when no unit cards exist", () => {
    expect(projectAvailability(project(12, 7), [])).toEqual({
      total: 12,
      available: 7,
      fromUnits: false,
    });
  });

  it("counts unit cards once they cover the whole inventory", () => {
    const units = [unit("RW-P0018-1"), unit("RW-P0018-2"), unit("RW-P0018-3", "Sold")];
    expect(projectAvailability(project(3, 3), units)).toEqual({
      total: 3,
      available: 2,
      fromUnits: true,
    });
  });

  // Verana enters one card per villa format (1/2/3BR) for a 12-villa community.
  // Counting cards would advertise "3 of 3 available" instead of 7 of 12.
  it("keeps the developer's figures when unit cards only describe formats", () => {
    const formats = [unit("RW-P0018-1"), unit("RW-P0018-2"), unit("RW-P0018-3")];
    expect(projectAvailability(project(12, 7), formats)).toEqual({
      total: 12,
      available: 7,
      fromUnits: false,
    });
  });
});
