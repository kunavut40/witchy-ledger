import { expect, it } from "vitest";
import { monthCells, isoDay } from "./calendar";
it("supports leap days and Sunday-aligned weeks", () => {
  expect(monthCells(2028, 1).filter(Boolean)).toHaveLength(29);
  expect(monthCells(2026, 10)[0]).toBe(1);
  expect(monthCells(2026, 10).filter(Boolean)).toHaveLength(30);
});
it("formats local dates without UTC shifts", () =>
  expect(isoDay(2026, 0, 2)).toBe("2026-01-02"));
