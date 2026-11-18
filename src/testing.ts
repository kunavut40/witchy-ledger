import type { State } from "./domain";
export function testUnlocked(s: State) {
  return s.settings.find((x) => x.id === "test.unlockAll")?.value !== "false";
}
