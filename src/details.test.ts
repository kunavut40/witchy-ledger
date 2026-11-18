import { it, expect } from "vitest";
import { detailData } from "./details";
import { initialState } from "./db";
import { isBackSwipe } from "./navigation";
import { addDays, type Transaction } from "./domain";
const tx = (patch: Partial<Transaction> = {}): Transaction => ({
  id: crypto.randomUUID(),
  kind: "expense",
  amount: 6500,
  date: "2026-11-18",
  time: "",
  accountId: "bank",
  toAccountId: "",
  categoryId: "food-1",
  title: "กาแฟ",
  note: "",
  tags: "",
  recurring: false,
  createdAt: "2026-11-18T10:00:00Z",
  ...patch,
});
function data() {
  const s = initialState();
  s.periods = [
    {
      id: "p",
      name: "รอบข้ามเดือน",
      start: "2026-10-25",
      end: "2026-11-24",
      kind: "salary",
    },
  ];
  s.accounts.forEach((a) => (a.opening = 100000));
  s.transactions = [
    tx({
      kind: "income",
      categoryId: "income-0",
      amount: 50000,
      date: "2026-10-25",
    }),
    tx(),
    tx({ amount: 3500, date: "2026-11-24", categoryId: "food-0" }),
    tx({ amount: 1000, date: "2026-10-01" }),
    tx({ amount: 9999, date: "2026-11-25" }),
    tx({ kind: "transfer", categoryId: "", toAccountId: "cash", amount: 2500 }),
    tx({ kind: "adjustment", categoryId: "", amount: 3000 }),
  ];
  return { s, p: s.periods[0] };
}
it("รายรับรายจ่ายและยอดสุทธิรายละเอียดตรง summary รวมขอบวันไม่รวมโอน/ปรับยอด", () => {
  const { s, p } = data();
  expect(detailData(s, p, "income").total).toBe(50000);
  expect(detailData(s, p, "expense").total).toBe(10000);
  const f = detailData(s, p, "flow");
  expect(f.total).toBe(40000);
  expect(f.transactions).toHaveLength(3);
});
it("ยอดเงินสะสมแยกบัญชีรวมรายการก่อนรอบและปรับยอด ตัดอนาคตออก", () => {
  const { s, p } = data();
  const d = detailData(s, p, "actual");
  expect(d.total).toBe(242000);
  expect(d.accounts.reduce((n, a) => n + a.amount, 0)).toBe(d.total);
});
it("สรุปรอบรวมหมวดย่อยเพียงครั้งเดียวและเลือกหมวดแล้วกรองรายการ", () => {
  const { s, p } = data();
  const d = detailData(s, p, "period");
  expect(d.groups[0].id).toBe("food");
  expect(d.groups[0].amount).toBe(10000);
  expect(d.transactions).toHaveLength(2);
  expect(detailData(s, p, "expense", "food-1").transactions).toHaveLength(1);
  expect(detailData(s, p, "expense", "food-1").total).toBe(6500);
});
it("ไม่มีข้อมูลได้ศูนย์ ไม่มีหมวดสูงสุดสมมติ", () => {
  const s = initialState();
  const d = detailData(s, s.periods[0], "period");
  expect(d.total).toBe(0);
  expect(d.groups).toHaveLength(0);
  expect(d.transactions).toHaveLength(0);
});
it("ซื้อด้วยเครดิตแสดงรายจ่ายและชำระบิลไม่ซ้ำในรายละเอียด", () => {
  const { s, p } = data();
  s.accounts.push({
    ...s.accounts[0],
    id: "credit",
    kind: "credit",
    opening: 0,
  });
  s.transactions = [
    tx({ accountId: "credit", amount: 10000 }),
    tx({
      kind: "transfer",
      categoryId: "",
      accountId: "bank",
      toAccountId: "credit",
      amount: 8000,
    }),
  ];
  expect(detailData(s, p, "expense").total).toBe(10000);
  expect(detailData(s, p, "expense").transactions).toHaveLength(1);
  expect(detailData(s, p, "actual").total).toBe(192000);
});
it("ปัดย้อนกลับต้องจากขอบซ้ายไปขวา ไม่ใช่แนวตั้ง กลางจอ หรือกดค้าง", () => {
  const start = { x: 12, y: 100, time: 0 };
  expect(isBackSwipe(start, { x: 120, y: 115, time: 400 })).toBe(true);
  expect(isBackSwipe(start, { x: 120, y: 170, time: 400 })).toBe(false);
  expect(isBackSwipe({ ...start, x: 50 }, { x: 160, y: 100, time: 400 })).toBe(
    false,
  );
  expect(isBackSwipe(start, { x: 120, y: 100, time: 1000 })).toBe(false);
  expect(isBackSwipe(start, { x: 0, y: 100, time: 400 })).toBe(false);
});
