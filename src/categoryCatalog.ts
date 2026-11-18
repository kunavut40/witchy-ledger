import type { LedgerDB } from "./db";
import type { State } from "./domain";
const f = (n: number) => "fantasy-" + n;
export const standardCategories: State["categories"] = [];
const groups: [string, string, string, [string, string][]][] = [
  [
    "income",
    "รายรับ",
    "ui-income",
    [
      ["เงินเดือน", f(40)],
      ["OT", f(41)],
      ["เบี้ยเลี้ยง", f(42)],
      ["รายได้เสริม", f(43)],
      ["ผลตอบแทนลงทุน", f(44)],
      ["เงินคืน", f(45)],
    ],
  ],
  [
    "food",
    "อาหารและเครื่องดื่ม",
    "ui-food",
    [
      ["ข้าว", f(0)],
      ["กาแฟ", f(1)],
      ["ชา", f(2)],
      ["น้ำดื่ม", f(3)],
      ["เครื่องดื่ม", f(4)],
      ["ขนม", f(5)],
    ],
  ],
  [
    "home",
    "บ้านและที่อยู่อาศัย",
    "ui-home",
    [
      ["ค่าเช่า", f(12)],
      ["ของใช้ในบ้าน", f(11)],
      ["ค่าส่วนกลาง", "ui-book"],
    ],
  ],
  [
    "utilities",
    "ค่าสาธารณูปโภค",
    f(6),
    [
      ["ค่าไฟ", f(7)],
      ["ค่าน้ำ", f(8)],
      ["อินเทอร์เน็ต", f(9)],
      ["แก๊ส", f(10)],
    ],
  ],
  [
    "travel",
    "เดินทาง",
    f(13),
    [
      ["น้ำมัน", f(15)],
      ["ค่ารถ", f(16)],
      ["รถสาธารณะ", f(17)],
      ["ซ่อมบำรุง", f(18)],
      ["เดินทางส่วนตัว", f(14)],
    ],
  ],
  [
    "health",
    "สุขภาพ",
    f(23),
    [
      ["ยา", f(24)],
      ["ทันตกรรม", f(25)],
      ["ประกันสุขภาพ", f(26)],
    ],
  ],
  [
    "education",
    "การศึกษา",
    f(19),
    [
      ["ค่าเรียน", f(22)],
      ["เครื่องเขียน", f(20)],
      ["อุปกรณ์การเรียน", f(21)],
    ],
  ],
  [
    "life",
    "ไลฟ์สไตล์",
    f(27),
    [
      ["เกม", f(28)],
      ["กิจกรรม", f(29)],
      ["ดนตรี", f(30)],
      ["ภาพยนตร์", f(31)],
    ],
  ],
  [
    "shopping",
    "ช้อปปิ้ง",
    f(32),
    [
      ["เสื้อผ้า", f(33)],
      ["ความงาม", f(34)],
      ["ของออนไลน์", "ui-shopping"],
    ],
  ],
  [
    "communications",
    "สื่อสาร",
    f(39),
    [
      ["ค่าโทรศัพท์", "ui-salary"],
      ["เติมเงิน", "ui-allowance"],
    ],
  ],
  [
    "pets",
    "สัตว์เลี้ยง",
    f(35),
    [
      ["อาหารสัตว์", f(0)],
      ["รักษาสัตว์", f(24)],
    ],
  ],
  [
    "gifts",
    "ของขวัญและแบ่งปัน",
    f(36),
    [
      ["ของขวัญ", "ui-book"],
      ["บริจาค", f(37)],
    ],
  ],
  [
    "taxes",
    "ภาษีและค่าธรรมเนียม",
    f(38),
    [
      ["ภาษี", f(26)],
      ["ค่าธรรมเนียม", "ui-balance"],
    ],
  ],
  ["other", "ค่าใช้จ่ายอื่น", "ui-settings", [["รายการอื่น", "ui-shopping"]]],
];
groups.forEach(([id, name, icon, children], order) => {
  const kind = id === "income" ? "income" : "expense";
  standardCategories.push({
    id,
    name,
    icon,
    parentId: "",
    kind,
    color: ["#c4a7d3", "#9fc7b1", "#d5b484", "#a8bddd"][order % 4],
    archived: false,
    order,
  });
  children.forEach(([name, icon], i) =>
    standardCategories.push({
      id: "standard-" + id + "-" + i,
      name,
      icon,
      parentId: id,
      kind,
      color: "#bfa4d2",
      archived: false,
      order: i,
    }),
  );
});
export async function ensureCategoryCatalog(d: LedgerDB) {
  await d.transaction("rw", d.categories, d.settings, async () => {
    if (await d.settings.get("catalog.fantasy.v1")) return;
    const existing = await d.categories.toArray();
    for (const c of standardCategories) {
      const match =
        existing.find((x) => x.id === c.id) ||
        existing.find(
          (x) =>
            x.parentId === c.parentId &&
            (x.name === c.name ||
              (c.name === "กิจกรรม" && x.name === "บันเทิง")) &&
            x.kind === c.kind,
        );
      if (!match) {
        await d.categories.add(c);
        existing.push(c);
      } else if (
        ["book", "tea", "house", "broom", "crystal", "potion", "coin"].includes(
          match.icon,
        )
      )
        await d.categories.update(match.id, { icon: c.icon });
    }
    // Existing seed children retain their IDs so quick presets and historical rows keep their links.
    for (const c of existing.filter((c) => c.parentId)) {
      const wanted = standardCategories.find(
        (x) => x.name === c.name && x.kind === c.kind,
      );
      if (
        !wanted &&
        ["book", "tea", "house", "broom", "crystal", "potion", "coin"].includes(
          c.icon,
        )
      ) {
        const extras: Record<string, string> = {
          เงินตกเบิก: "ui-salary",
          รายรับอื่น: "ui-book",
          บันเทิง: "fantasy-29",
          ท่องเที่ยว: "fantasy-13",
        };
        if (extras[c.name])
          await d.categories.update(c.id, { icon: extras[c.name] });
      }
      if (
        wanted &&
        ["book", "tea", "house", "broom", "crystal", "potion", "coin"].includes(
          c.icon,
        )
      )
        await d.categories.update(c.id, { icon: wanted.icon });
    }
    await d.settings.put({ id: "catalog.fantasy.v1", value: "1" });
  });
}
