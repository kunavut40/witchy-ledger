import "fake-indexeddb/auto";
import { expect, it } from "vitest";
import { LedgerDB, initialState, restore, readState } from "./db";
import { ensureCategoryCatalog } from "./categoryCatalog";
it("adds utilities and distinct drink icons while preserving IDs and custom icons", async () => {
  const d = new LedgerDB("catalog-" + crypto.randomUUID());
  try {
    const s = initialState();
    s.categories.find((c) => c.id === "food-1")!.icon = "ui-car";
    await restore(s, d);
    await ensureCategoryCatalog(d);
    const first = await readState(d);
    expect(first.categories.find((c) => c.id === "food-1")?.icon).toBe(
      "ui-car",
    );
    expect(first.categories.some((c) => c.name === "ค่าสาธารณูปโภค")).toBe(true);
    expect(
      first.categories.some(
        (c) => c.parentId === "utilities" && c.name === "ค่าไฟ",
      ),
    ).toBe(true);
    const drinks = first.categories
      .filter((c) => ["ชา", "น้ำดื่ม", "เครื่องดื่ม"].includes(c.name))
      .map((c) => c.icon);
    expect(new Set(drinks).size).toBe(3);
    await ensureCategoryCatalog(d);
    expect((await readState(d)).categories.length).toBe(
      first.categories.length,
    );
    expect((await readState(d)).accounts).toEqual(first.accounts);
    expect((await readState(d)).transactions).toEqual([]);
  } finally {
    d.close();
    await d.delete();
  }
});
