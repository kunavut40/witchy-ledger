import "fake-indexeddb/auto";
import { expect, it } from "vitest";
import { LedgerDB, initialState } from "./db";
import { moveItem, reorderCategories } from "./categoryOrder";
it("moves instead of duplicating and ignores invalid targets", () => {
  expect(moveItem(["a", "b", "c"], 0, 2)).toEqual(["b", "c", "a"]);
  expect(moveItem(["a"], 0, -1)).toEqual(["a"]);
});
it("persists sibling order while preserving category identities and rejects cross-group moves", async () => {
  const d = new LedgerDB("sort-" + crypto.randomUUID());
  try {
    const s = initialState();
    await d.categories.bulkPut(s.categories);
    await reorderCategories("income-0", "income-2", d);
    expect(
      (await d.categories.toArray())
        .filter((c) => c.parentId === "income")
        .sort((a, b) => a.order - b.order)
        .map((c) => c.id)
        .slice(0, 3),
    ).toEqual(["income-1", "income-2", "income-0"]);
    expect(await d.categories.get("income-0")).toMatchObject({
      name: "เงินเดือน",
      parentId: "income",
      kind: "income",
    });
    await expect(reorderCategories("income-0", "food-1", d)).rejects.toThrow();
    expect(await d.transactions.count()).toBe(0);
  } finally {
    await d.delete();
  }
});
