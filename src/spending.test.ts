import { expect, it } from "vitest";
import { weeklyTotals } from "./spending";
import type { Transaction } from "./domain";
it("shows Monday to Sunday across month boundaries and excludes transfers", () => {
  const tx = (date: string, kind: Transaction["kind"], amount: number) =>
    ({ date, kind, amount }) as Transaction;
  const rows = weeklyTotals(
    [
      tx("2026-11-30", "income", 10000),
      tx("2026-11-30", "expense", 2500),
      tx("2026-11-30", "transfer", 9000),
      tx("2026-12-07", "expense", 3000),
    ],
    "2026-12-02",
  );
  expect(rows[0]).toEqual({
    date: "2026-11-30",
    label: "จ.",
    income: 10000,
    expense: 2500,
  });
  expect(rows[6].date).toBe("2026-12-06");
  expect(rows.reduce((n, r) => n + r.expense, 0)).toBe(2500);
});
it("empty data produces seven zero pairs", () =>
  expect(
    weeklyTotals([], "2026-11-18").every(
      (r) => r.income === 0 && r.expense === 0,
    ),
  ).toBe(true));
