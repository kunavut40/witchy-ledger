import "fake-indexeddb/auto";
import { describe, it, expect, afterEach } from "vitest";
import {
  LedgerDB,
  initialState,
  readState,
  restore,
  saveTransaction,
  backupData,
  parseBackup,
} from "./db";
import {
  satang,
  summary,
  balance,
  thaiDate,
  periodWarnings,
  nextPeriod,
  type State,
  type Transaction,
  type Account,
} from "./domain";
const databases: LedgerDB[] = [];
async function setup() {
  const d = new LedgerDB("test-" + crypto.randomUUID());
  databases.push(d);
  const s = initialState();
  s.periods = [
    {
      id: "p",
      name: "ข้ามปี",
      start: "2026-12-25",
      end: "2027-01-26",
      kind: "salary",
    },
  ];
  s.accounts.forEach((a) => (a.opening = 100000));
  await restore(s, d);
  return { d, s, p: s.periods[0] };
}
const tx = (patch: Partial<Transaction> = {}): Transaction => ({
  id: crypto.randomUUID(),
  kind: "expense",
  amount: 6500,
  date: "2027-01-01",
  time: "",
  accountId: "bank",
  toAccountId: "",
  categoryId: "food-1",
  title: "กาแฟ",
  note: "",
  tags: "",
  recurring: false,
  createdAt: new Date().toISOString(),
  ...patch,
});
afterEach(async () => {
  for (const d of databases.splice(0)) await d.delete();
});
describe("เงินและวันที่", () => {
  it("คำนวณสตางค์แม่นยำ", () => {
    expect(satang("0.29")).toBe(29);
    expect(satang("1000.01")).toBe(100001);
    expect(satang("-10.50")).toBe(-1050);
    expect(() => satang("1.001")).toThrow();
    expect(() => satang("1e3")).toThrow();
  });
  it("แสดง พ.ศ. และไม่เลื่อนวัน", () => {
    expect(thaiDate("2027-01-01")).toContain("2570");
    expect(thaiDate("2027-01-01")).toContain("1 มกราคม");
  });
  it("clone รอบต่อเนื่องและตรวจซ้อน/เว้นว่าง", () => {
    const p = {
      id: "a",
      name: "ก.พ.",
      start: "2026-01-25",
      end: "2026-02-26",
      kind: "salary" as const,
    };
    expect(nextPeriod(p).start).toBe("2026-02-27");
    expect(periodWarnings({ ...p, id: "b" }, [p])).toHaveLength(1);
    expect(
      periodWarnings(
        { ...p, id: "b", start: "2026-03-01", end: "2026-03-30" },
        [p],
      )[0],
    ).toContain("ว่าง");
  });
});
describe("IndexedDB และธุรกรรม", () => {
  it("เพิ่มรายรับ/รายจ่าย แก้ไข ลบ และเปิด DB ใหม่ข้อมูลยังอยู่", async () => {
    const { d } = await setup();
    const expense = tx();
    const income = tx({
      kind: "income",
      categoryId: "income-0",
      amount: 2456000,
    });
    await saveTransaction(expense, d);
    await saveTransaction(income, d);
    expect(await d.transactions.count()).toBe(2);
    await saveTransaction({ ...expense, amount: 7000 }, d);
    expect((await d.transactions.get(expense.id))?.amount).toBe(7000);
    d.close();
    await d.open();
    expect(await d.transactions.count()).toBe(2);
    await d.transactions.delete(expense.id);
    expect(await d.transactions.count()).toBe(1);
  });
  it("เปลี่ยนชื่อและย้ายหมวด รายการเก่ายังอ้างอิง ID เดิม", async () => {
    const { d } = await setup();
    const t = tx();
    await saveTransaction(t, d);
    await d.categories.update("food-1", {
      name: "เครื่องดื่มโปรด",
      parentId: "life",
    });
    expect((await d.transactions.get(t.id))?.categoryId).toBe("food-1");
    expect((await d.categories.get("food-1"))?.parentId).toBe("life");
  });
  it("คำนวณรอบข้ามเดือน/ปี รวมขอบวัน และแยกยอดสะสม", async () => {
    const { s, p } = await setup();
    s.transactions = [
      tx({ date: "2026-12-01", amount: 10000 }),
      tx({
        date: p.start,
        kind: "income",
        categoryId: "income-0",
        amount: 50000,
      }),
      tx({ date: p.end, amount: 20000 }),
      tx({ date: "2027-01-27", amount: 999999 }),
    ];
    const z = summary(s, p);
    expect(z.income).toBe(50000);
    expect(z.expense).toBe(20000);
    expect(z.flow).toBe(30000);
    expect(z.actual).toBe(220000);
  });
  it("โอนเข้าเงินออมไม่เป็นรายรับ/จ่ายและยอดเงินจริงรวมไม่เปลี่ยน", async () => {
    const { s, p } = await setup();
    s.accounts.push({
      ...s.accounts[0],
      id: "saving",
      kind: "saving",
      opening: 0,
    });
    s.transactions = [
      tx({
        kind: "transfer",
        toAccountId: "saving",
        categoryId: "",
        amount: 30000,
      }),
    ];
    const z = summary(s, p);
    expect(z.income).toBe(0);
    expect(z.expense).toBe(0);
    expect(z.actual).toBe(200000);
    expect(balance(s.accounts[2], s.transactions)).toBe(30000);
  });
  it("ซื้อผ่านบัตรและชำระบิลไม่คิดรายจ่ายซ้ำ", async () => {
    const { s, p } = await setup();
    const credit: Account = {
      ...s.accounts[0],
      id: "credit",
      kind: "credit",
      opening: 0,
    };
    s.accounts.push(credit);
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
    expect(summary(s, p).expense).toBe(10000);
    expect(summary(s, p).actual).toBe(192000);
    expect(balance(credit, s.transactions)).toBe(2000);
  });
  it("ปรับยอดมีประวัติและไม่รวม cash flow", async () => {
    const { s, p } = await setup();
    s.transactions = [
      tx({ kind: "adjustment", amount: -1000, categoryId: "" }),
    ];
    expect(summary(s, p).flow).toBe(0);
    expect(summary(s, p).actual).toBe(199000);
  });
  it("ป้องกันข้อมูลผิด บัญชีโอนซ้ำ และหมวดผิดประเภท", async () => {
    const { d } = await setup();
    await expect(saveTransaction(tx({ amount: 0 }), d)).rejects.toThrow();
    await expect(
      saveTransaction(tx({ kind: "transfer", toAccountId: "bank" }), d),
    ).rejects.toThrow();
    await expect(saveTransaction(tx({ kind: "income" }), d)).rejects.toThrow();
    await expect(
      saveTransaction(tx({ date: "2027-02-30" }), d),
    ).rejects.toThrow();
    expect(await d.transactions.count()).toBe(0);
  });
  it("backup/restore ทั้งระบบและปฏิเสธไฟล์เสียก่อนเขียน", async () => {
    const { d, s } = await setup();
    await saveTransaction(tx(), d);
    const before = await readState(d);
    const file = backupData(before);
    await restore(s, d);
    expect(await d.transactions.count()).toBe(0);
    await restore(parseBackup(file), d);
    expect(await readState(d)).toEqual(before);
    const bad = JSON.parse(file);
    bad.data.transactions[0].accountId = "missing";
    expect(() => parseBackup(JSON.stringify(bad))).toThrow();
    expect(await d.transactions.count()).toBe(1);
  });
  it("ปฏิเสธหมวดวนลูปและ ID ซ้ำใน backup", async () => {
    const { s } = await setup();
    const b = JSON.parse(backupData(s));
    b.data.categories[0].parentId = b.data.categories[0].id;
    expect(() => parseBackup(JSON.stringify(b))).toThrow();
    const c = JSON.parse(backupData(s));
    c.data.accounts.push(c.data.accounts[0]);
    expect(() => parseBackup(JSON.stringify(c))).toThrow();
  });
});
