import { db, readState } from "../db";
import {
  advanceCompanion,
  readRuntime,
  RUNTIME_KEY,
  type Cause,
} from "./engine";
import { parseFantasy } from "./model";
let pending: Promise<unknown> = Promise.resolve();
/** Serialize only companion settings writes. Accounting tables are read-only here. */
function serial<T>(fn: () => Promise<T>): Promise<T> {
  const task = pending.then(fn, fn);
  pending = task.catch(() => undefined);
  return task;
}
export function syncCompanion(cause: Cause, database = db) {
  const store = database;
  return serial(async () => {
    const db = store;
    const s = await readState(db);
    await db.transaction("rw", db.settings, async () => {
      const stored = await db.settings.get(RUNTIME_KEY);
      if (!stored && !(await db.settings.get("companion.legacyBackup.v1")))
        await db.settings.put({
          id: "companion.legacyBackup.v1",
          value: JSON.stringify({
            createdAt: new Date().toISOString(),
            fantasy:
              s.settings.find((x) => x.id === "fantasy.state")?.value || null,
          }),
        });
      const old = readRuntime(
        stored?.value,
        parseFantasy(s.settings.find((x) => x.id === "fantasy.state")?.value),
      );
      const next = advanceCompanion(s, old, cause);
      const value = JSON.stringify(next);
      if (value !== stored?.value)
        await db.settings.put({ id: RUNTIME_KEY, value });
    });
  });
}
export function dismissDialogue(key: string, database = db) {
  const store = database;
  return serial(async () => {
    const db = store;
    await db.transaction("rw", db.settings, async () => {
      const stored = await db.settings.get(RUNTIME_KEY);
      if (!stored) return;
      const state = readRuntime(stored.value);
      state.queue = state.queue.filter((x) => x.key !== key);
      await db.settings.put({ id: RUNTIME_KEY, value: JSON.stringify(state) });
    });
  });
}
