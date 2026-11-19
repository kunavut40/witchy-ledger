import type { Emotion, CompanionId } from "./model";
export function companionPerformance(emotion: Emotion, character: CompanionId) {
  return {
    pose:
      character === "yui" && (emotion === "annoyed" || emotion === "proud")
        ? "crossed"
        : "natural",
    expression:
      emotion === "sleepy" || emotion === "blink" || emotion === "annoyed"
        ? "closed"
        : emotion === "happy" || emotion === "proud"
          ? "wink"
          : "open",
  } as const;
}
