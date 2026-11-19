import dialogueBank from "./dialogueBank.json";
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
  | "surprised"
  | "sleepy"
  | "proud";
export type CompanionId = "yui" | "momo";
export interface FantasyState {
  animations?: boolean;
  characterLooks?: Partial<Record<CompanionId, Partial<FantasyState>>>;
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
  animations: true,
  mode: true,
  character: "yui",
  hair: 0,
  hairColor: "#24202a",
  outfit: 1,
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
          : defaults.outfit,
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
/** Compatibility adapter; edit dialogueBank.json, never this mapping. */
export const lines = {
  yui: {
    welcome: dialogueBank.E01.yui,
    budget: dialogueBank.E14.yui,
    saving: dialogueBank.E18.yui,
    streak: dialogueBank.E06.yui,
  },
  momo: {
    welcome: dialogueBank.E01.momo,
    budget: dialogueBank.E14.momo,
    saving: dialogueBank.E18.momo,
    streak: dialogueBank.E06.momo,
  },
};
