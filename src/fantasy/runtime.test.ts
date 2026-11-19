import "fake-indexeddb/auto";
import { it, expect } from "vitest";
import {
  LedgerDB,
  initialState,
  restore,
  readState,
  saveTransaction,
  backupData,
  parseBackup,
} from "../db";
import { today, uid, type Transaction } from "../domain";
import { syncCompanion, dismissDialogue } from "./runtime";
import { readRuntime, RUNTIME_KEY } from "./engine";
import { defaults } from "./model";
it("serializes companion persistence, survives reopen/backup, and leaves accounting tables untouched", async () => {
  const d = new LedgerDB("companion-runtime-" + uid());
  try {
    const initial = initialState();
    initial.accounts.find((a) => a.id === "bank")!.opening = 1000000;
    initial.settings.push({
      id: "fantasy.state",
      value: JSON.stringify({
        ...defaults,
        affinity: 25,
        lastInteraction: today(),
      }),
    });
    await restore(initial, d);
    await Promise.all([
      syncCompanion({ kind: "open", session: "one" }, d),
      syncCompanion({ kind: "open", session: "one" }, d),
    ]);
    const before = await readState(d),
      baseline = readRuntime(
        before.settings.find((x) => x.id === RUNTIME_KEY)!.value,
      );
    expect(baseline.characters.yui.affinity).toBe(25);
    expect(before.accounts).toEqual(
      initial.accounts.slice().sort((a, b) => a.id.localeCompare(b.id)),
    );
    expect(before.transactions).toEqual(initial.transactions);
    expect(await d.settings.get("companion.legacyBackup.v1")).toBeDefined();
    const t: Transaction = {
      id: uid(),
      kind: "expense",
      date: today(),
      time: "10:00",
      amount: 7500,
      accountId: "bank",
      toAccountId: "",
      categoryId: initial.categories.find((c) => c.name === "กาแฟ")!.id,
      title: "กาแฟ",
      note: "",
      tags: "",
      recurring: false,
      createdAt: new Date().toISOString(),
      coffee: { cups: 3, partnerCups: 1 },
    };
    await saveTransaction(t, d);
    await Promise.all([
      syncCompanion({ kind: "sync" }, d),
      syncCompanion({ kind: "sync" }, d),
    ]);
    const after = await readState(d),
      r = readRuntime(after.settings.find((x) => x.id === RUNTIME_KEY)!.value);
    expect(
      r.characters.yui.history.filter((x) => x.event === "C03"),
    ).toHaveLength(1);
    expect(after.transactions).toEqual([t]);
    expect(after.accounts).toEqual(before.accounts);
    expect(after.periods).toEqual(before.periods);
    expect(after.budgets).toEqual(before.budgets);
    expect(after.goals).toEqual(before.goals);
    const key = r.queue.find((x) => x.event === "C03")!.key;
    await dismissDialogue(key, d);
    d.close();
    await d.open();
    await syncCompanion({ kind: "sync" }, d);
    const reopened = await readState(d),
      loaded = readRuntime(
        reopened.settings.find((x) => x.id === RUNTIME_KEY)!.value,
      );
    expect(loaded.queue.some((x) => x.key === key)).toBe(false);
    expect(loaded.characters.yui.affinity).toBe(25);
    const restored = parseBackup(backupData(reopened));
    expect(restored.transactions[0].coffee).toEqual(t.coffee);
    expect(
      readRuntime(restored.settings.find((x) => x.id === RUNTIME_KEY)!.value)
        .characters.yui.history,
    ).toEqual(loaded.characters.yui.history);
  } finally {
    await d.delete();
  }
});
