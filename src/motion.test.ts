import { expect, it, vi, afterEach } from "vitest";
import { OPEN_MS, STEP_MS, motionDuration } from "./motion";
afterEach(() => vi.unstubAllGlobals());
it("uses one short duration for plus and stage transitions", () => {
  expect(OPEN_MS).toBe(240);
  expect(STEP_MS).toBe(OPEN_MS);
  vi.stubGlobal("matchMedia", () => ({ matches: false }));
  expect(motionDuration()).toBe(240);
});
it("does not keep reduced-motion users waiting for an invisible exit", () => {
  vi.stubGlobal("matchMedia", () => ({ matches: true }));
  expect(motionDuration()).toBe(0);
  expect(motionDuration(STEP_MS)).toBe(0);
});
it("finishes immediately while backgrounded or with app animation disabled", () => {
  vi.stubGlobal("document", { hidden: true, querySelector: () => null });
  expect(motionDuration()).toBe(0);
  vi.stubGlobal("document", { hidden: false, querySelector: () => ({}) });
  expect(motionDuration()).toBe(0);
});
