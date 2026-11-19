import { expect, it, vi, afterEach } from "vitest";
import { OPEN_MS, STEP_MS, motionDuration } from "./motion";
afterEach(() => vi.unstubAllGlobals());
it("uses twice the plus duration for stage transitions", () => {
  expect(OPEN_MS).toBe(240);
  expect(STEP_MS).toBe(OPEN_MS * 2);
  vi.stubGlobal("matchMedia", () => ({ matches: false }));
  expect(motionDuration()).toBe(240);
});
it("does not keep reduced-motion users waiting for an invisible exit", () => {
  vi.stubGlobal("matchMedia", () => ({ matches: true }));
  expect(motionDuration()).toBe(0);
  expect(motionDuration(STEP_MS)).toBe(0);
});
