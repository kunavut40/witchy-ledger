export const fantasyIconLabels = [
  "ข้าวจันทร์",
  "กาแฟอำพัน",
  "ชามรกต",
  "น้ำดารา",
  "เครื่องดื่มชมพู",
  "ขนมดาว",
  "ค่าสาธารณูปโภค",
  "ค่าไฟ",
  "ค่าน้ำ",
  "อินเทอร์เน็ต",
  "แก๊ส",
  "ของใช้ในบ้าน",
  "ค่าเช่า",
  "เดินทาง",
  "รถส่วนตัว",
  "น้ำมัน",
  "ค่ารถ",
  "รถสาธารณะ",
  "ซ่อมบำรุง",
  "การศึกษา",
  "เครื่องเขียน",
  "อุปกรณ์เรียน",
  "หนังสือ",
  "สุขภาพ",
  "ยา",
  "ทันตกรรม",
  "ประกัน",
  "ไลฟ์สไตล์",
  "เกม",
  "กิจกรรม",
  "ดนตรี",
  "ภาพยนตร์",
  "ช้อปปิ้ง",
  "เสื้อผ้า",
  "ความงาม",
  "สัตว์เลี้ยง",
  "ของขวัญ",
  "บริจาค",
  "ภาษี",
  "สื่อสาร",
  "เงินเดือน",
  "OT",
  "เบี้ยเลี้ยง",
  "รายได้เสริม",
  "ลงทุน",
  "เงินคืน",
  "คริสตัลธนาคาร",
  "หีบเงินสด",
];
import type { CSSProperties } from "react";
export const iconLabels: Record<string, string> = {
  "ui-income": "ประตูรายรับ",
  "ui-expense": "กระเป๋ารายจ่าย",
  "ui-analysis": "ลูกแก้ววิเคราะห์",
  "ui-settings": "ฟันเฟืองเวทมนตร์",
  "ui-salary": "ซองเงินเดือน",
  "ui-allowance": "ถุงเบี้ยเลี้ยง",
  "ui-book": "สมุดเวทมนตร์",
  "ui-coffee": "กาแฟ",
  "ui-fuel": "น้ำมัน",
  "ui-shopping": "ถุงช้อปปิ้ง",
  "ui-wallet": "กระเป๋าเงิน",
  "ui-bank": "ธนาคาร",
  "ui-food": "อาหาร",
  "ui-home": "บ้าน",
  "ui-car": "รถ",
  "ui-balance": "ตาชั่ง",
  book: "คัมภีร์",
  tea: "ถ้วยชา",
  house: "บ้านเดิม",
  broom: "ไม้กวาด",
  crystal: "ผลึก",
  potion: "ขวดยา",
  coin: "เหรียญ",
  moon: "จันทร์",
  flower: "ดอกไม้",
  chest: "หีบ",
  sword: "ดาบ",
  axe: "ขวาน",
  claw: "กรงเล็บ",
  shield: "โล่",
  staff: "ไม้เท้า",
  cage: "กรง",
  bow: "ธนู",
  rune: "รูน",
  dagger: "กริช",
  helmet: "หมวก",
};
export const extraArtIcons = [
  "ui-income",
  "ui-expense",
  "ui-analysis",
  "ui-settings",
];
export const artIcons = [
  "ui-salary",
  "ui-allowance",
  "ui-book",
  "ui-coffee",
  "ui-fuel",
  "ui-shopping",
  "ui-wallet",
  "ui-bank",
  "ui-food",
  "ui-home",
  "ui-car",
  "ui-balance",
];
export function categoryIcon(c?: { id: string; icon: string }): string {
  if (!c) return "ui-book";
  const defaults: Record<string, [string, string]> = {
    income: ["book", "ui-salary"],
    "income-0": ["book", "ui-salary"],
    "income-3": ["book", "ui-allowance"],
    "income-5": ["book", "ui-book"],
    food: ["tea", "ui-food"],
    "food-0": ["tea", "ui-food"],
    "food-1": ["tea", "ui-coffee"],
    travel: ["broom", "ui-car"],
    "travel-0": ["broom", "ui-fuel"],
    home: ["house", "ui-home"],
    other: ["potion", "ui-shopping"],
  };
  const mapping = defaults[c.id];
  return mapping && c.icon === mapping[0] ? mapping[1] : c.icon;
}
fantasyIconLabels.forEach((label, i) => {
  iconLabels["fantasy-" + i] = label;
});
export const icons = [
  ...fantasyIconLabels.map((_, i) => "fantasy-" + i),
  ...extraArtIcons,
  ...artIcons,
  "book",
  "tea",
  "house",
  "broom",
  "crystal",
  "potion",
  "coin",
  "moon",
  "flower",
  "chest",
  "sword",
  "axe",
  "claw",
  "shield",
  "staff",
  "cage",
  "bow",
  "rune",
  "dagger",
  "helmet",
];
export default function Pixel({
  name = "potion",
  size = 40,
}: {
  name?: string;
  size?: number;
}) {
  const actual =
    name === "ui-bank"
      ? "fantasy-46"
      : name === "ui-wallet" || name === "chest"
        ? "fantasy-47"
        : name;
  const fantasyIndex = actual.startsWith("fantasy-")
    ? Number(actual.slice(8))
    : -1;
  if (Number.isInteger(fantasyIndex) && fantasyIndex >= 0 && fantasyIndex < 48)
    return (
      <span
        className={
          "pixel-art-icon fantasy-art-icon" +
          (fantasyIndex === 46
            ? " crystal-icon"
            : fantasyIndex === 47
              ? " treasure-icon"
              : "")
        }
        data-icon={actual}
        aria-hidden="true"
        style={
          {
            "--icon-size": size + "px",
            width: size,
            height: size,
            backgroundPosition:
              ((fantasyIndex % 8) * 100) / 7 +
              "% " +
              Math.floor(fantasyIndex / 8) * 20 +
              "%",
          } as CSSProperties
        }
      />
    );
  const aliases: Record<string, string> = {
    book: "ui-book",
    tea: "ui-coffee",
    house: "ui-home",
    broom: "ui-car",
    potion: "ui-shopping",
    coin: "ui-allowance",
    rune: "ui-balance",
    chest: "ui-wallet",
  };
  const extra = extraArtIcons.indexOf(name);
  if (extra >= 0)
    return (
      <span
        className="pixel-art-icon extra-art-icon"
        aria-hidden="true"
        style={
          {
            "--icon-size": size + "px",
            width: size,
            height: size,
            backgroundPosition: (extra * 100) / 3 + "% 0%",
          } as CSSProperties
        }
      />
    );
  const art = artIcons.indexOf(aliases[name] || name);
  if (art >= 0)
    return (
      <span
        className="pixel-art-icon"
        aria-hidden="true"
        style={
          {
            "--icon-size": size + "px",
            width: size,
            height: size,
            backgroundPosition:
              ((art % 4) * 100) / 3 + "% " + Math.floor(art / 4) * 50 + "%",
          } as CSSProperties
        }
      />
    );
  const paths: Record<string, string[]> = {
    sword: [
      "M20 2h7v7h-3v4h-3v4h-3v4h-4v-4h-3v-4h4v-4h3V5h2z M8 18h4v4h4v4h-4v-2H8v4H4v-4h4z",
      "M22 5h2v4h-3v4h-3v4h-2v-4h3V9h3z",
    ],
    axe: [
      "M15 3h4v26h-4z M5 6h9v13H5v-3H2V9h3z M20 6h7v3h3v7h-3v3h-7z",
      "M5 7h7v3H5z M22 7h5v3h-5z M15 23h4v3h-4z",
    ],
    claw: [
      "M5 22h20v6H5z M7 7h3v15H7z M14 3h3v19h-3z M21 6h3v16h-3z",
      "M7 7h2v10H7z M14 3h2v13h-2z M21 6h2v11h-2z",
    ],
    shield: [
      "M5 4h22v18h-4v4h-4v4h-6v-4H9v-4H5z",
      "M9 8h14v11h-3v4h-3v3h-2v-3h-3v-4H9z",
    ],
    staff: [
      "M14 11h4v19h-4z M10 3h12v10H10z M7 6h3v4H7z M22 6h3v4h-3z",
      "M13 4h6v6h-6z M14 24h4v3h-4z",
    ],
    cage: [
      "M4 11h24v18H4z M8 6h16v5H8z M13 2h6v4h-6z",
      "M7 14h3v11H7z M14 14h3v11h-3z M21 14h3v11h-3z",
    ],
    bow: [
      "M10 3h7v3h4v4h3v12h-3v4h-4v4h-7v-4h5v-4h4V11h-4V7h-5z M8 4h2v24H8z",
      "M3 15h24v3H3z M23 12h4v3h3v3h-3v3h-4z",
    ],
    rune: [
      "M10 2h12v4h4v22h-4v3H10v-3H6V6h4z",
      "M15 7h3v5h4v3h-4v3h4v3h-4v5h-3v-5h-4v-3h4v-3h-4v-3h4z",
    ],
    dagger: [
      "M15 2h6v17h-3v4h-3v-4h-3V6h3z M7 21h20v4H7z M14 25h6v6h-6z",
      "M15 6h2v11h-2z M14 25h3v3h-3z",
    ],
    helmet: [
      "M9 3h14v4h4v21h-8V17h-6v11H5V7h4z",
      "M9 7h14v4H9z M14 3h4v12h-4z",
    ],
    book: [
      "M5 5h9v3h3v17H5z M18 8h9v17h-9z",
      "M8 9h5v2H8z M8 14h5v2H8z M21 12h3v2h-3z M21 17h3v2h-3z",
    ],
    tea: [
      "M6 12h17v12H9v-3H6z M23 14h5v7h-5z M5 26h21v2H5z",
      "M10 4h2v5h-2z M17 3h2v6h-2z",
    ],
    house: [
      "M5 15h22v13H5z M3 12h4V9h4V6h10v3h4v3h4v3H3z",
      "M13 20h6v8h-6z M8 17h3v4H8z M22 17h3v4h-3z",
    ],
    broom: [
      "M19 3h4v4h-3v4h-3v4h-3v4h-3v-4h3v-4h3V7h2z",
      "M6 16h8v3h3v7h-4v3H3v-7h3z",
    ],
    crystal: [
      "M12 3h8v4h4v17h-4v5h-8v-5H8V7h4z",
      "M14 7h3v14h-3z M5 23h3v5H5z M25 17h3v8h-3z",
    ],
    potion: [
      "M12 3h8v3h-2v6h4v3h3v12H7V15h3v-3h4V6h-2z",
      "M10 19h12v5H10z M10 15h3v3h-3z",
    ],
    coin: [
      "M11 4h10v3h4v4h3v10h-3v4h-4v3H11v-3H7v-4H4V11h3V7h4z",
      "M14 10h7v3h-5v3h5v6h-7v-3h5v-1h-5z",
    ],
    moon: [
      "M12 3h9v3h-5v4h-3v9h3v4h9v-3h3v6h-5v3H10v-3H6v-5H3V10h3V6h6z",
      "M24 5h3v3h3v3h-3v3h-3v-3h-3V8h3z",
    ],
    flower: [
      "M14 17h3v13h-3z M7 21h6v4H7z M18 24h7v3h-7z",
      "M12 3h8v4h6v8h-6v5h-8v-5H6V7h6z",
    ],
    chest: ["M5 9h22v19H5z M8 5h16v4H8z", "M5 15h22v3H5z M14 13h5v9h-5z"],
  };
  const p = paths[name] || paths.potion;
  return (
    <svg
      className="pixel-vector-icon"
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      shapeRendering="crispEdges"
    >
      <path d={p[0]} transform="translate(2 2)" fill="#3c304c" opacity=".5" />
      <path d={p[0]} fill="currentColor" />
      <path d={p[1]} fill="#f0d49b" className="item-glint" />
      <path
        d={p[0]}
        transform="translate(-.6 -.6)"
        fill="none"
        stroke="#ffffff"
        strokeOpacity=".35"
        strokeWidth=".6"
      />
    </svg>
  );
}
