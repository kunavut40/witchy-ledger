import { expect, it } from "vitest";
import { initialState } from "./db";
import { readRadial } from "./RadialEntry";
it("default quick entry has real categories, two coffee/fuel prices and an active account", () => {
  const s = initialState(),
    p = readRadial(s);
  expect(p.expense[0]).toEqual({ id: "food-1", prices: [20, 25] });
  expect(p.expense[1]).toEqual({ id: "travel-0", prices: [120, 500] });
  expect(s.accounts.find((a) => a.id === p.account)?.active).toBe(true);
});
it("broken or stale preferences recover and reject negative/invalid prices", () => {
  const s = initialState();
  s.settings.push({
    id: "radial.preferences",
    value: JSON.stringify({
      expense: [{ id: "missing", prices: [-5, 25, 900] }],
      account: "missing",
    }),
  });
  const p = readRadial(s);
  expect(p.expense[0].id).toBe("food-1");
  expect(p.expense[0].prices).toEqual([25, 900]);
  expect(p.account).not.toBe("missing");
  s.settings[s.settings.length - 1].value = "invalid";
  expect(readRadial(s).income).toHaveLength(3);
});
