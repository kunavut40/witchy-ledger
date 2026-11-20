import { expect, it } from "vitest";
import { MONTHS, monthPreset } from "./monthPresets";
it("offers all twelve months with correct leap and year boundaries", () => {
  expect(MONTHS).toHaveLength(12);
  expect(monthPreset([], 2028, 1).end).toBe("2028-02-29");
  expect(monthPreset([], 2026, 1).end).toBe("2026-02-28");
  expect(monthPreset([], 2026, 11)).toMatchObject({
    start: "2026-12-01",
    end: "2026-12-31",
    name: "ธันวาคม",
  });
});
it("reuses saved custom ranges and never replaces them with calendar boundaries", () => {
  const p = {
    id: "custom",
    name: "ธันวาคม เงินเดือน",
    start: "2026-11-26",
    end: "2026-12-25",
    kind: "salary" as const,
  };
  expect(monthPreset([p], 2026, 11)).toBe(p);
  const renamed = { ...p, id: "month-2026-12", name: "เงินเดือนของฉัน" };
  expect(monthPreset([renamed], 2026, 11)).toBe(renamed);
});
