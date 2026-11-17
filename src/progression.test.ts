import { it, expect } from "vitest";
import { progression, levelFloor, ranks } from "./progression";
import { addDays, type Transaction } from "./domain";
const record = (
  date: string,
  patch: Partial<Transaction> = {},
): Transaction => ({
  id: crypto.randomUUID(),
  kind: "expense",
  amount: 100,
  date: "2020-01-01",
  time: "",
  accountId: "bank",
  toAccountId: "",
  categoryId: "food",
  title: "บันทึกจริง",
  note: "",
  tags: "",
  recurring: false,
  createdAt: date + "T12:00:00Z",
  ...patch,
});
it("เริ่ม Herald LV1 ที่ 0 XP", () => {
  const p = progression([], "2026-01-03");
  expect(p.level).toBe(1);
  expect(p.rank.name).toBe("Herald");
  expect(p.levelProgress).toBe(0);
});
it("วันเดียวกันนับครั้งเดียว ไม่ขึ้นกับยอดเงินหรือวันที่ย้อนหลังของรายการ", () => {
  const p = progression(
    [
      record("2026-01-03"),
      record("2026-01-03", { amount: 999999, date: "1999-01-01" }),
    ],
    "2026-01-03",
  );
  expect(p.xp).toBe(25);
  expect(p.days).toBe(1);
  expect(p.streak).toBe(1);
});
it("สะสมต่อเนื่องข้ามปีพร้อมโบนัส", () => {
  const p = progression(
    [record("2025-12-31"), record("2026-01-01"), record("2026-01-02")],
    "2026-01-02",
  );
  expect(p.xp).toBe(25 + 30 + 35);
  expect(p.streak).toBe(3);
  expect(p.best).toBe(3);
  expect(p.level).toBe(3);
  expect(p.rank.name).toBe("Guardian");
});
it("สตรีกยังอยู่ถ้าบันทึกเมื่อวาน ขาดวันแล้วรีเซ็ตและเก็บสถิติสูงสุด", () => {
  const rows = [record("2026-01-01"), record("2026-01-02")];
  expect(progression(rows, "2026-01-03").streak).toBe(2);
  expect(progression(rows, "2026-01-04").streak).toBe(0);
  const p = progression([...rows, record("2026-01-04")], "2026-01-04");
  expect(p.streak).toBe(1);
  expect(p.best).toBe(2);
  expect(p.xp).toBe(80);
});
it("ไม่รับข้อมูลตัวอย่าง การปรับยอด วันที่สร้างผิด หรืออนาคต", () => {
  const rows = [
    record("2026-01-01", { note: "ข้อมูลตัวอย่าง" }),
    record("2026-01-01", { kind: "adjustment" }),
    record("2026-01-01", { createdAt: "bad" }),
    record("2026-12-01"),
  ];
  expect(progression(rows, "2026-01-01").xp).toBe(0);
});
it("โบนัสสูงสุดคงที่ เลเวลโตได้เลย Immortal และลบรายการคำนวณใหม่", () => {
  const rows = Array.from({ length: 500 }, (_, i) =>
    record(addDays("2025-01-01", i)),
  );
  const p = progression(rows, "2026-12-31");
  expect(p.rank.name).toBe("Immortal");
  expect(p.level).toBeGreaterThan(30);
  expect(p.levelProgress).toBeGreaterThanOrEqual(0);
  expect(p.levelProgress).toBeLessThan(100);
  expect(p.xp).toBe(25 + 30 + 35 + 40 + 45 + 50 + 55 + 493 * 60);
  expect(progression(rows.slice(0, 1), "2026-12-31").xp).toBe(25);
  expect(ranks).toHaveLength(8);
  expect(levelFloor(3)).toBe(80);
});
