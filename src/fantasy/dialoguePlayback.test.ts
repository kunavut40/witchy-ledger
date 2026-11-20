import { afterEach, describe, expect, it, vi } from "vitest";
import { dialoguePlayback } from "./dialoguePlayback";
afterEach(() => vi.useRealTimers());
describe("dialogue presentation lifecycle", () => {
  it("dismisses 1250ms after the final letter, never from the start", () => {
    vi.useFakeTimers();
    const done = vi.fn(),
      count = vi.fn();
    dialoguePlayback(10, 0, true, count, done);
    vi.advanceTimersByTime(270);
    expect(count).toHaveBeenLastCalledWith(10);
    vi.advanceTimersByTime(1249);
    expect(done).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(done).toHaveBeenCalledTimes(1);
  });
  it("starts the same delay after a skip or reduced motion", () => {
    vi.useFakeTimers();
    const done = vi.fn();
    dialoguePlayback(90, 90, true, () => {}, done);
    vi.advanceTimersByTime(1249);
    expect(done).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(done).toHaveBeenCalledOnce();
    const reduced = vi.fn(),
      count = vi.fn();
    dialoguePlayback(90, 0, false, count, reduced);
    expect(count).toHaveBeenCalledWith(90);
    vi.advanceTimersByTime(1250);
    expect(reduced).toHaveBeenCalledOnce();
  });
  it("cleans typing and auto-dismiss on close, page change, background or replacement", () => {
    vi.useFakeTimers();
    const done = vi.fn(),
      count = vi.fn();
    const stop = dialoguePlayback(100, 0, true, count, done);
    vi.advanceTimersByTime(54);
    stop();
    const calls = count.mock.calls.length;
    vi.runAllTimers();
    expect(count).toHaveBeenCalledTimes(calls);
    expect(done).not.toHaveBeenCalled();
    const stopFull = dialoguePlayback(0, 0, true, count, done);
    stopFull();
    vi.runAllTimers();
    expect(done).not.toHaveBeenCalled();
  });
});
