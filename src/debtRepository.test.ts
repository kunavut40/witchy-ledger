import "fake-indexeddb/auto";
import { it, expect, afterEach } from "vitest";
import {
  LedgerDB,
  initialState,
  restore,
  readState,
  backupData,
  parseBackup,
} from "./db";
import { saveDebtPlan, payDebt } from "./debtRepository";
import { balance, summary, today, satang } from "./domain";
import { getProfile } from "./Profile";
const databases: LedgerDB[] = [];
async function setup() {
  const d = new LedgerDB("debt-" + crypto.randomUUID());
  databases.push(d);
  const s = initialState();
  s.accounts.find((a) => a.id === "bank")!.opening = 1000000;
  await restore(s, d);
  const id = await saveDebtPlan(
    {
      name: "ผ่อน S25",
      provider: "บัตรเครดิต",
      kind: "debt",
      outstanding: satang("7087.02"),
      monthlyPayment: satang("1417.42"),
    },
    d,
  );
  return { d, id };
}
afterEach(async () => {
  for (const d of databases.splice(0)) await d.delete();
});
it("S25 ชำระ 1417.42 จากยอด 7087.02 เหลือ 5669.60 โดยไม่เพิ่มรายจ่ายซ้ำ", async () => {
  const { d, id } = await setup();
  await payDebt(
    {
      debtId: id,
      fromAccountId: "bank",
      amount: 141742,
      date: today(),
      note: "งวดแรก",
    },
    d,
  );
  const s = await readState(d);
  expect(
    balance(
      s.accounts.find((a) => a.id === id)!,
      s.transactions,
      today(),
    ),
  ).toBe(566960);
  expect(
    balance(
      s.accounts.find((a) => a.id === "bank")!,
      s.transactions,
      today(),
    ),
  ).toBe(858258);
  expect(summary(s, s.periods[0]).expense).toBe(0);
  expect(s.transactions[0].note).toBe("งวดแรก");
});
it("แยกรายการ SPayLater และ TikTok Pay ชำระแล้วไม่กระทบยอดอีกแผน", async () => {
  const { d, id } = await setup();
  const second = await saveDebtPlan(
    {
      name: "TikTok Pay",
      provider: "TikTok",
      kind: "debt",
      outstanding: 300000,
      monthlyPayment: 50000,
    },
    d,
  );
  await payDebt(
    {
      debtId: second,
      fromAccountId: "bank",
      amount: 50000,
      date: today(),
      note: "",
    },
    d,
  );
  const s = await readState(d);
  expect(
    balance(
      s.accounts.find((a) => a.id === id)!,
      s.transactions,
    ),
  ).toBe(708702);
  expect(
    balance(
      s.accounts.find((a) => a.id === second)!,
      s.transactions,
    ),
  ).toBe(250000);
});
it("งวดสุดท้ายใช้ยอดเศษสตางค์จริง ชำระครบแล้วหนี้เป็นศูนย์", async () => {
  const { d, id } = await setup();
  for (let i = 0; i < 4; i++)
    await payDebt(
      {
        debtId: id,
        fromAccountId: "bank",
        amount: 141742,
        date: today(),
        note: "",
      },
      d,
    );
  let s = await readState(d);
  expect(
    balance(
      s.accounts.find((a) => a.id === id)!,
      s.transactions,
    ),
  ).toBe(141734);
  await expect(
    payDebt(
      {
        debtId: id,
        fromAccountId: "bank",
        amount: 141742,
        date: today(),
        note: "",
      },
      d,
    ),
  ).rejects.toThrow("เกิน");
  await payDebt(
    {
      debtId: id,
      fromAccountId: "bank",
      amount: 141734,
      date: today(),
      note: "",
    },
    d,
  );
  s = await readState(d);
  expect(
    balance(
      s.accounts.find((a) => a.id === id)!,
      s.transactions,
    ),
  ).toBe(0);
});
it("ป้องกันกดชำระซ้ำเกินยอดคงค้างโดยเขียน DB แบบ atomic", async () => {
  const { d, id } = await setup();
  const input = {
    debtId: id,
    fromAccountId: "bank",
    amount: 708702,
    date: today(),
    note: "",
  };
  const result = await Promise.allSettled([
    payDebt(input, d),
    payDebt(input, d),
  ]);
  expect(result.filter((x) => x.status === "fulfilled")).toHaveLength(1);
  expect(await d.transactions.count()).toBe(1);
});
it("แก้ยอดคงค้างมีประวัติ และ backup/restore เก็บแผนผ่อนกับชื่อเล่นตัวละคร", async () => {
  const { d, id } = await setup();
  await payDebt(
    {
      debtId: id,
      fromAccountId: "bank",
      amount: 141742,
      date: today(),
      note: "",
    },
    d,
  );
  await saveDebtPlan(
    {
      id,
      name: "S25 ใหม่",
      provider: "SPayLater",
      kind: "debt",
      outstanding: 500000,
      monthlyPayment: 100000,
    },
    d,
  );
  await d.settings.bulkPut([
    { id: "profile.nickname", value: "ลูน่า" },
    { id: "profile.avatar", value: "sage-wizard" },
  ]);
  const restored = parseBackup(backupData(await readState(d)));
  await restore(restored, d);
  const s = await readState(d);
  const debt = s.accounts.find((a) => a.id === id)!;
  expect(balance(debt, s.transactions)).toBe(500000);
  expect(debt.monthlyPayment).toBe(100000);
  expect(debt.debtProvider).toBe("SPayLater");
  expect(s.transactions.filter((t) => t.kind === "adjustment")).toHaveLength(1);
  expect(getProfile(s.settings)).toEqual({
    nickname: "ลูน่า",
    avatar: "sage-wizard",
  });
});
