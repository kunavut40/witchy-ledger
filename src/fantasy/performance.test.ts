import { expect, it } from "vitest";
import { companionPerformance } from "./performance";
it("pairs Yui tsundere lines with crossed arms and closed eyes", () => {
  expect(companionPerformance("annoyed", "yui")).toEqual({
    pose: "crossed",
    expression: "closed",
  });
  expect(companionPerformance("proud", "yui")).toEqual({
    pose: "crossed",
    expression: "wink",
  });
});
it("uses sleepy closed eyes, playful praise and preserves other personality poses", () => {
  expect(companionPerformance("sleepy", "yui").expression).toBe("closed");
  expect(companionPerformance("happy", "yui").expression).toBe("wink");
  expect(companionPerformance("worried", "yui").expression).toBe("open");
  expect(companionPerformance("annoyed", "momo").pose).toBe("natural");
});
