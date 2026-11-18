import { progression } from "../progression";
import { summary, categorySpend, balance, today, type State } from "../domain";
export type Emotion =
  | "idle"
  | "blink"
  | "talking"
  | "happy"
  | "annoyed"
  | "embarrassed"
  | "worried"
  | "surprised";
export type CompanionId = "yui" | "momo";
export interface FantasyState {
  eyeColor?: string;
  catEars?: boolean;
  earrings?: boolean;
  place?: string;
  mode: boolean;
  character: CompanionId;
  hair: number;
  hairColor: string;
  outfit: number;
  hat: boolean;
  glasses: boolean;
  accessory: string;
  cape: boolean;
  hand: string;
  furniture: string[];
  favorites: {
    name: string;
    hair: number;
    hairColor: string;
    outfit: number;
    hat: boolean;
    glasses: boolean;
    accessory: string;
    cape: boolean;
    hand: string;
    catEars?: boolean;
    earrings?: boolean;
  }[];
  hidden: boolean;
  muted: boolean;
  affinity: number;
  lastInteraction: string;
  dialogueHistory: string[];
}
export const defaults: FantasyState = {
  mode: true,
  character: "yui",
  hair: 0,
  hairColor: "#24202a",
  outfit: 0,
  hat: false,
  glasses: false,
  accessory: "none",
  cape: false,
  hand: "none",
  furniture: ["bed", "clock", "cat"],
  favorites: [],
  hidden: false,
  muted: false,
  affinity: 0,
  lastInteraction: "",
  dialogueHistory: [],
};
export const hairstyles = [
  "Long Straight",
  "Side Swept",
  "High Ponytail",
  "Twin Tails",
  "Long Wavy",
  "Short Bob",
  "Braided Hair",
  "Messy Bun",
  "Half-up Ribbon",
  "Side Ponytail",
  "Casual Loose",
  "Scholar Updo",
];
export const outfits = [
  "เสื้อขาวพื้นฐาน",
  "ชุดนักเวทมนตร์",
  "แม่มดเริ่มต้น",
  "แม่มดชำนาญการ",
  "แม่มดขั้นสูง",
  "แม่มดอาวุโส",
  "นักเรียนปกติ",
  "เสื้อไหมพรม",
  "ลำลอง",
  "อยู่บ้าน",
  "ชุดนอน",
  "เดรส",
  "กีฬา",
  "กิโมโน",
  "ซามูไรแฟนตาซี",
  "บรรณารักษ์เวท",
  "นักดูดาว",
  "นักเดินทาง",
  "นักเวทดำ",
  "นักเวทขาว",
  "พิธีการ",
  "เมดแฟนตาซี",
  "ฤดูหนาว",
  "เทศกาล",
  "นักเวทต่อสู้",
  "ขุนนางเวทมนตร์",
];
export const colors = [
  "#584252",
  "#855567",
  "#68617e",
  "#485a68",
  "#6b4e80",
  "#d7c3b0",
  "#8b5b55",
  "#a77784",
  "#485264",
  "#666573",
  "#3c385d",
  "#b888a6",
];
export const furniture = [
  { id: "bed", name: "เตียงดารา", level: 1 },
  { id: "clock", name: "นาฬิกาอาคม", level: 1 },
  { id: "cat", name: "แมวดำ", level: 1 },
  { id: "crystal", name: "คริสตัลแห่งจันทร์", level: 2 },
  { id: "plant", name: "สวนในกระถาง", level: 3 },
  { id: "books", name: "หอคัมภีร์จิ๋ว", level: 4 },
  { id: "lantern", name: "ตะเกียงดาว", level: 5 },
  { id: "mirror", name: "กระจกจันทรา", level: 7 },
];
export function parseFantasy(value?: string): FantasyState {
  try {
    const x = JSON.parse(value || "{}");
    return {
      ...defaults,
      ...x,
      character: x.character === "momo" ? "momo" : "yui",
      hair: Number.isInteger(x.hair) && x.hair >= 0 && x.hair < 12 ? x.hair : 0,
      outfit:
        Number.isInteger(x.outfit) && x.outfit >= 0 && x.outfit < 26
          ? x.outfit
          : 0,
      hairColor: /^#[0-9a-f]{6}$/i.test(x.hairColor)
        ? x.hairColor
        : defaults.hairColor,
      furniture: Array.isArray(x.furniture)
        ? x.furniture.filter((id: string) => furniture.some((f) => f.id === id))
        : defaults.furniture,
      favorites: Array.isArray(x.favorites) ? x.favorites.slice(0, 12) : [],
      dialogueHistory: Array.isArray(x.dialogueHistory)
        ? x.dialogueHistory.slice(-12)
        : [],
    };
  } catch {
    return { ...defaults };
  }
}
export const outfitLevel = (index: number) =>
  index < 3 ? 1 : Math.floor(index / 3) + 1;
export function interact(s: FantasyState): FantasyState {
  return s.lastInteraction === today()
    ? s
    : { ...s, lastInteraction: today(), affinity: s.affinity + 1 };
}
export function financialMood(s: State) {
  const p =
    s.periods.find((p) => p.start <= today() && p.end >= today()) ||
    s.periods[0];
  if (!p) return { event: "welcome", emotion: "idle" as Emotion };
  const z = summary(s, p);
  if (
    s.budgets.some(
      (b) =>
        b.periodId === p.id &&
        categorySpend(b.categoryId, z.tx, s.categories) > b.amount,
    )
  )
    return { event: "budget", emotion: "worried" as Emotion };
  if (
    s.goals.some((g) => {
      const a = s.accounts.find((a) => a.id === g.accountId);
      return a && balance(a, s.transactions, today()) >= g.target;
    })
  )
    return { event: "saving", emotion: "happy" as Emotion };
  if (progression(s.transactions).streak >= 7)
    return { event: "streak", emotion: "happy" as Emotion };
  return { event: "welcome", emotion: "idle" as Emotion };
}
export const lines = {
  yui: {
    welcome: [
      "กลับมาแล้วเหรอ… เปิดสมุดบัญชีก่อนสิ ฉันเตรียมไว้ให้แล้ว",
      "วันนี้บันทึกครบหรือยัง? ไม่ได้เป็นห่วงหรอกนะ แค่ตรวจงานเฉย ๆ",
      "ค่อย ๆ ทำทีละรายการก็ได้ ฉันรออยู่ตรงนี้",
      "ห้องเงียบไปหน่อย… อยากเล่าเรื่องวันนี้ผ่านสมุดบัญชีไหม?",
      "ไม่ต้องสมบูรณ์แบบทุกวันหรอก ขอแค่กลับมาดูแลตัวเองก็พอ",
    ],
    budget: [
      "มีหมวดใช้เกินงบแล้วนะ… ลองเปิดงบประมาณดูด้วย",
      "ไม่ได้จะบ่น แต่เราควรทบทวนงบรอบนี้หน่อย",
      "พักดูตัวเลขก่อนก็ได้ ฉันจะอยู่ข้าง ๆ",
      "งบที่วางไว้เปลี่ยนได้ ถ้าชีวิตจริงเปลี่ยนไป",
      "ลองตรวจรายการล่าสุดกัน อย่าเพิ่งโทษตัวเองล่ะ",
    ],
    saving: [
      "เงินออมถึงเป้าหมายแล้ว… ทำได้ดีนี่นา",
      "ฉันเห็นความตั้งใจนะ ถึงจะไม่ได้ชมบ่อยก็เถอะ",
      "เปิดหน้าเงินออมดูสิ มีเรื่องดีรออยู่",
      "ความพยายามเล็ก ๆ รวมกันเป็นเรื่องใหญ่ได้นะ",
      "วันนี้สมควรยิ้มให้ตัวเองสักหน่อยแล้ว",
    ],
    streak: [
      "บันทึกต่อเนื่องเกินเจ็ดวันแล้ว… มีวินัยดีนี่",
      "ฉันไม่ได้แอบนับหรอกนะ แต่เห็นความพยายามอยู่",
      "ค่อย ๆ สร้างนิสัยแบบนี้ต่อไปก็พอ",
      "สมุดบัญชีไม่เหงาแล้วล่ะ มีเธอมาดูแลทุกวัน",
      "ทำดีแล้วนะ… ไม่ได้พูดซ้ำง่าย ๆ หรอก",
    ],
  },
  momo: {
    welcome: [
      "มาแล้ว ๆ! วันนี้มีเรื่องอะไรให้โมโมะช่วยดูบ้าง?",
      "เปิดสมุดกันเถอะ วันนี้เราจะเก่งขึ้นอีกนิด!",
      "เลือกชุดใหม่แล้วค่อยจดบัญชีก็ได้นะ แต่อย่าลืมจดล่ะ!",
      "ห้องนี้อบอุ่นขึ้นเลยเมื่อเธอกลับมา!",
      "บันทึกทีละนิด แล้วไปเล่นกับแมวกัน!",
    ],
    budget: [
      "งบมีไฟเตือนแล้ว! โมโมะจะอยู่เป็นเพื่อนตอนตรวจนะ",
      "มาดูหมวดที่เกินงบกัน ค่อย ๆ จัดการได้!",
      "พักช้อปแล้วทบทวนแผนกันนิดหนึ่งไหม?",
      "ไม่ต้องตกใจ เรามาอ่านตัวเลขทีละบรรทัด!",
      "ปรับแผนให้เข้ากับชีวิตจริงกันเถอะ!",
    ],
    saving: [
      "เป้าหมายสำเร็จแล้ว! ขอปรบมือให้เลย!",
      "เงินออมเติบโตแล้วนะ ฮีโร่ของโมโมะ!",
      "วันนี้มีข่าวดีในหน้าเงินออม ไปดูกัน!",
      "พยายามมาขนาดนี้ ภูมิใจได้เต็มที่เลย!",
      "ดาวดวงใหม่ของห้องนี้คือเธอนี่เอง!",
    ],
    streak: [
      "ว้าว! ต่อเนื่องเจ็ดวันขึ้นไปแล้ว!",
      "สมุดบัญชีต้องชอบเธอมากแน่ ๆ!",
      "วันนี้มาต่อสตรีกกันอีกวันเถอะ!",
      "ความสม่ำเสมอคือพลังเวทของเรา!",
      "เก่งขึ้นทุกวันเลย โมโมะเห็นนะ!",
    ],
  },
};
