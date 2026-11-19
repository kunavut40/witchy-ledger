import { describe, it, expect } from "vitest";
import { initialState } from "../db";
import {
  addDays,
  validateTransaction,
  type State,
  type Transaction,
} from "../domain";
import { progression } from "../progression";
import {
  advanceCompanion,
  readRuntime,
  coffeeFacts,
  affinityTier,
  RUNTIME_KEY,
  type Runtime,
} from "./engine";
import { dialogueBank, eventRegistry } from "./events";
import { defaults } from "./model";
const day = "2026-11-19",
  now = new Date(2026, 10, 19, 10, 0);
function state(): State {
  const s = initialState();
  s.periods = [
    {
      id: "test-period",
      name: "test",
      start: "2026-11-01",
      end: "2026-11-30",
      kind: "salary",
    },
  ];
  s.accounts.forEach((a) => (a.opening = a.kind === "bank" ? 10000000 : 0));
  return s;
}
function tx(s: State, patch: Partial<Transaction> = {}): Transaction {
  return {
    id: crypto.randomUUID(),
    kind: "expense",
    date: day,
    time: "10:00",
    amount: 2500,
    accountId: "bank",
    categoryId: s.categories.find((c) => c.name === "กาแฟ")!.id,
    toAccountId: "",
    title: "กาแฟ",
    note: "",
    tags: "",
    recurring: false,
    createdAt: now.toISOString(),
    ...patch,
  };
}
function boot(s: State) {
  return advanceCompanion(
    s,
    readRuntime(),
    { kind: "open", session: "test" },
    now,
    () => 0,
  );
}
function tick(s: State, r: Runtime, seconds = 10) {
  return advanceCompanion(
    s,
    { ...r, queue: [] },
    { kind: "sync" },
    new Date(now.getTime() + seconds * 1000),
    () => 0,
  );
}
const ids = (r: Runtime) => r.queue.map((x) => x.event);
describe("grounded coffee facts", () => {
  it("does not infer cups from amount or number of transactions", () => {
    const s = state();
    s.transactions = [tx(s), tx(s), tx(s)];
    expect(coffeeFacts(s, day)).toMatchObject({
      cups: 0,
      transactions: 3,
      complete: false,
    });
    const r = tick(s, boot(state()));
    expect(ids(r)).toContain("C01");
    expect(ids(r)).not.toContain("C02");
    expect(ids(r)).not.toContain("C03");
  });
  it("one transaction containing two explicit cups triggers C02 once", () => {
    const s = state(),
      r = boot(s);
    s.transactions.push(tx(s, { coffee: { cups: 2, partnerCups: null } }));
    const n = tick(s, r);
    expect(ids(n)).toContain("C02");
    expect(ids(n)).not.toContain("E31");
    expect(ids(tick(s, n, 90))).not.toContain("C02");
  });
  it("three cups in one transaction including partner selects only highest coffee event", () => {
    const s = state(),
      r = boot(s);
    s.transactions.push(tx(s, { coffee: { cups: 3, partnerCups: 1 } }));
    const n = tick(s, r);
    expect(ids(n)).toContain("C03");
    expect(ids(n)).not.toContain("C02");
    expect(ids(n)).not.toContain("E32");
  });
  it("three cups with unknown recipients never claims partner or three drinks by user", () => {
    const s = state(),
      r = boot(s);
    s.transactions.push(tx(s, { coffee: { cups: 3, partnerCups: null } }));
    const n = tick(s, r);
    expect(ids(n)).toContain("E32");
    expect(ids(n)).not.toContain("C03");
  });
  it("an unknown earlier quantity suppresses exact daily counts", () => {
    const s = state();
    s.transactions.push(tx(s));
    const r = boot(s);
    s.transactions.push(tx(s, { coffee: { cups: 2, partnerCups: 0 } }));
    expect(coffeeFacts(s, day).complete).toBe(false);
    expect(ids(tick(s, r))).not.toContain("C02");
  });
  it("counts local transaction dates and excludes yesterday", () => {
    const s = state();
    s.transactions = [
      tx(s, { date: addDays(day, -1), coffee: { cups: 3, partnerCups: 1 } }),
      tx(s, { coffee: { cups: 1, partnerCups: 0 } }),
    ];
    expect(coffeeFacts(s, day).cups).toBe(1);
  });
  it("does not warn about a nonexistent budget", () => {
    const s = state(),
      r = boot(s);
    s.transactions.push(tx(s, { amount: 500000 }));
    const n = tick(s, r);
    expect(ids(n)).not.toContain("C04");
    expect(ids(n)).not.toContain("E33");
    expect(ids(n)).not.toContain("E13");
    expect(ids(n)).not.toContain("E14");
  });
  it("near and over budget reactions require actual thresholds", () => {
    const s = state();
    const c = tx(s).categoryId;
    s.budgets = [
      { id: "coffee", periodId: "test-period", categoryId: c, amount: 10000 },
    ];
    const r = boot(s);
    s.transactions = [tx(s, { amount: 7900 })];
    expect(ids(tick(s, r))).not.toContain("E33");
    s.transactions = [tx(s, { amount: 8000 })];
    expect(ids(tick(s, r))).toContain("E33");
    s.transactions = [tx(s, { amount: 10001 })];
    expect(ids(tick(s, r))).toContain("C04");
  });
  it("validates quantity without affecting amounts", () => {
    const s = state();
    expect(() =>
      validateTransaction(tx(s, { coffee: { cups: 1, partnerCups: 2 } }), s),
    ).toThrow();
    expect(() =>
      validateTransaction(tx(s, { coffee: { cups: 0, partnerCups: null } }), s),
    ).toThrow();
    expect(() =>
      validateTransaction(tx(s, { coffee: { cups: 2, partnerCups: 1 } }), s),
    ).not.toThrow();
  });
});
describe("durable events and accounting isolation", () => {
  it("repairs partial companion memory without losing ledger data or valid history", () => {
    const old = boot(state());
    const damaged = JSON.parse(JSON.stringify(old));
    delete damaged.characters.yui.recent;
    damaged.queue.push({ event: "not-a-real-event" });
    const restored = readRuntime(JSON.stringify(damaged));
    expect(restored.characters.yui.history).toEqual(old.characters.yui.history);
    expect(restored.queue.every((q) => eventRegistry[q.event])).toBe(true);
    expect(() =>
      advanceCompanion(state(), restored, { kind: "sync" }, now),
    ).not.toThrow();
  });
  it("four known cups never produce an exact three-cup claim", () => {
    const s = state(),
      r = boot(s);
    s.transactions.push(tx(s, { coffee: { cups: 4, partnerCups: 1 } }));
    const n = tick(s, r);
    expect(ids(n)).not.toContain("C03");
    expect(ids(n)).not.toContain("E32");
    expect(ids(n)).toContain("C01");
  });
  it("migrates existing affinity once into its own character", () => {
    const r = readRuntime(undefined, {
      ...defaults,
      character: "momo",
      affinity: 25,
      lastInteraction: day,
    });
    expect(r.characters.momo.affinity).toBe(25);
    expect(r.characters.yui.affinity).toBe(0);
    expect(
      readRuntime(JSON.stringify(r), { ...defaults, affinity: 200 }).characters
        .momo.affinity,
    ).toBe(25);
  });
  it("random selection avoids last three lines and is separate per character", () => {
    const s = state();
    let r = boot(s);
    const seen = new Set<string>();
    for (let i = 1; i <= 5; i++) {
      r = advanceCompanion(
        s,
        { ...r, queue: [] },
        { kind: "interaction" },
        new Date(now.getTime() + i * 120000),
        () => 0,
      );
      const line = r.queue.find((q) => q.event === "E01");
      if (line) {
        expect([...seen].slice(-3)).not.toContain(line.line);
        seen.add(line.line);
      }
    }
    expect(seen.size).toBeGreaterThanOrEqual(4);
    expect(r.characters.momo.history).toHaveLength(0);
  });
  it("cooldown suppresses a repeated interaction", () => {
    const s = state(),
      r = boot(s);
    expect(
      ids(
        advanceCompanion(
          s,
          { ...r, queue: [] },
          { kind: "interaction" },
          new Date(now.getTime() + 1000),
        ),
      ),
    ).not.toContain("E01");
  });
  it("rerenders and refresh do not replay a transaction", () => {
    const s = state(),
      r = boot(s);
    s.transactions.push(tx(s, { coffee: { cups: 2, partnerCups: 0 } }));
    const n = tick(s, r);
    expect(tick(s, readRuntime(JSON.stringify(n)), 100).queue).toHaveLength(0);
  });
  it("editing or undoing a record cancels queued claims and never reissues milestones", () => {
    const s = state(),
      r = boot(s);
    s.transactions.push(tx(s, { coffee: { cups: 2, partnerCups: 0 } }));
    const n = advanceCompanion(s, r, { kind: "sync" }, now);
    s.transactions[0].coffee = { cups: 1, partnerCups: null };
    const edited = advanceCompanion(
      s,
      n,
      { kind: "sync" },
      new Date(now.getTime() + 90000),
    );
    expect(ids(edited)).not.toContain("C02");
    expect(ids(edited)).not.toContain("E31");
    s.transactions = [];
    expect(
      advanceCompanion(s, edited, { kind: "sync" }, now).queue.every(
        (q) => !q.evidence?.length,
      ),
    ).toBe(true);
  });
  it("backdated new records do not fire current coffee or earned reward events", () => {
    const s = state(),
      r = boot(s);
    s.transactions.push(
      tx(s, { date: "2026-11-01", coffee: { cups: 3, partnerCups: 1 } }),
    );
    expect(tick(s, r).queue).toHaveLength(0);
  });
  it("priority is stable: rank > budget > coffee > success", () => {
    expect(eventRegistry.E26.priority).toBeGreaterThan(
      eventRegistry.E14.priority,
    );
    expect(eventRegistry.E14.priority).toBeGreaterThan(
      eventRegistry.C02.priority,
    );
    expect(eventRegistry.C02.priority).toBeGreaterThan(
      eventRegistry.E04.priority,
    );
  });
  it("does not modify any supplied ledger or rank formula", () => {
    const s = state(),
      before = structuredClone(s),
      p = progression(s.transactions, day);
    advanceCompanion(s, boot(s), { kind: "interaction" }, now);
    expect(s).toEqual(before);
    expect(progression(s.transactions, day)).toEqual(p);
  });
  it("appearance changes retain affinity and other character history", () => {
    const s = state(),
      r = boot(s);
    s.settings.push({
      id: "fantasy.state",
      value: JSON.stringify({ ...defaults, outfit: 24 }),
    });
    const n = tick(s, r);
    expect(ids(n)).toContain("E42");
    expect(n.characters.yui.affinity).toBe(r.characters.yui.affinity);
    s.settings.find((x) => x.id === "fantasy.state")!.value = JSON.stringify({
      ...defaults,
      character: "momo",
      accessory: "skull",
    });
    const m = tick(s, n, 40);
    expect(ids(m)).toContain("E46");
    expect(m.queue.every((q) => q.character === "momo")).toBe(true);
    expect(m.characters.yui.history).toEqual(n.characters.yui.history);
  });
  it("affinity grows at most once per character per day independent of spending", () => {
    const s = state();
    let r = boot(s);
    for (let i = 0; i < 10; i++) {
      s.transactions.push(tx(s, { amount: 1000000 }));
      r = tick(s, r, 10 + i * 10);
    }
    expect(r.characters.yui.affinity).toBe(1);
    expect(affinityTier(0)).toBe(1);
    expect(affinityTier(120)).toBe(5);
  });
  it("test rank preview and wardrobe unlock do not issue earned rank speech", () => {
    const s = state(),
      r = boot(s);
    s.settings.push(
      { id: "profile.testRank", value: "7" },
      { id: "test.unlockAll", value: "true" },
    );
    expect(ids(tick(s, r))).not.toContain("E26");
  });
  it("all registered events have two distinct banks, five lines and complete metadata", () => {
    expect(Object.keys(dialogueBank)).toHaveLength(56);
    for (const [id, bank] of Object.entries(dialogueBank)) {
      expect(bank.yui.length).toBeGreaterThanOrEqual(5);
      expect(bank.momo.length).toBeGreaterThanOrEqual(5);
      expect(bank.yui).not.toEqual(bank.momo);
      expect(eventRegistry[id as keyof typeof dialogueBank]).toMatchObject({
        id,
        condition: expect.any(String),
        cooldown: expect.any(Number),
        priority: expect.any(Number),
        animation: expect.any(String),
      });
    }
  });
  it("birthday requires explicit permission and a matching local day", () => {
    const s = state();
    s.settings.push({ id: "companion.birthday", value: "11-19" });
    expect(ids(boot(s))).not.toContain("E48");
    s.settings.push({ id: "companion.birthdayConsent", value: "true" });
    expect(ids(boot(s))).toContain("E48");
  });
  it("salary and partner facts are never inferred from transaction amount", () => {
    const s = state(),
      r = boot(s);
    s.transactions.push(
      tx(s, {
        kind: "income",
        categoryId: s.categories.find(
          (c) => c.kind === "income" && !c.parentId,
        )!.id,
        amount: 5000000,
      }),
    );
    const n = tick(s, r);
    expect(ids(n)).not.toContain("E09");
    expect(ids(n)).not.toContain("C03");
    expect(ids(n)).not.toContain("E11");
  });
  it("engine runs without network, stores history in settings-compatible JSON", () => {
    const s = state();
    const r = boot(s);
    s.settings.push({ id: RUNTIME_KEY, value: JSON.stringify(r) });
    expect(
      readRuntime(s.settings.at(-1)!.value).characters.yui.history.length,
    ).toBeGreaterThan(0);
    expect(JSON.stringify(r)).not.toContain("https:");
  });
});
