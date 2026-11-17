import "fake-indexeddb/auto";
import { it, expect } from "vitest";
import {
  defaults,
  parseFantasy,
  interact,
  outfitLevel,
  outfits,
  hairstyles,
  financialMood,
} from "./model";
import {
  LedgerDB,
  initialState,
  restore,
  backupData,
  parseBackup,
  readState,
} from "../db";
import { today } from "../domain";
it("เปิดปิดโหมดและรูปลักษณ์อยู่ใน settings ไม่เปลี่ยนข้อมูลการเงิน", async () => {
  const d = new LedgerDB("fantasy-" + crypto.randomUUID());
  try {
    const s = initialState();
    await restore(s, d);
    await d.settings.put({
      id: "fantasy.state",
      value: JSON.stringify({
        ...defaults,
        mode: true,
        character: "momo",
        hairColor: "#dd88aa",
        outfit: 2,
        furniture: ["cat", "bed"],
      }),
    });
    d.close();
    await d.open();
    const after = await readState(d);
    expect(
      after.accounts.slice().sort((a, b) => a.id.localeCompare(b.id)),
    ).toEqual(s.accounts.slice().sort((a, b) => a.id.localeCompare(b.id)));
    expect(after.transactions).toEqual(s.transactions);
    expect(after.periods).toEqual(s.periods);
    const backup = parseBackup(backupData(after));
    expect(
      parseFantasy(
        backup.settings.find((x) => x.id === "fantasy.state")?.value,
      ),
    ).toMatchObject({
      mode: true,
      character: "momo",
      outfit: 2,
      furniture: ["cat", "bed"],
    });
  } finally {
    await d.delete();
  }
});
it("มี catalog ชุดและทรงผมตามแบบ และของเริ่มต้นไม่ล็อก", () => {
  expect(outfits).toHaveLength(26);
  expect(hairstyles).toHaveLength(12);
  expect(outfitLevel(0)).toBe(1);
  expect(outfitLevel(25)).toBeGreaterThan(1);
});
it("ความสนิทเพิ่มได้วันละหนึ่งจากปฏิสัมพันธ์และไม่เพิ่มซ้ำวันเดียวกัน", () => {
  const a = interact({ ...defaults });
  expect(a.affinity).toBe(1);
  expect(a.lastInteraction).toBe(today());
  expect(interact(a).affinity).toBe(1);
});
it("ข้อมูลรูปลักษณ์เสียใช้ค่าเริ่มต้นโดยไม่ล้ม และไม่อนุมานจำนวนกาแฟ", () => {
  expect(parseFantasy("bad").outfit).toBe(0);
  expect(parseFantasy('{"hair":100,"outfit":-1}').hair).toBe(0);
  expect(financialMood(initialState()).event).toBe("welcome");
});
