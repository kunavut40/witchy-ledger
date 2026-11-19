import bank from "./dialogueBank.json";
import type { Emotion } from "./model";
export type EventId = keyof typeof bank;
export type EventScope = "day" | "period" | "once" | "repeat";
export interface EventDefinition {
  id: EventId;
  title: string;
  trigger: string;
  condition: string;
  priority: number;
  cooldown: number;
  scope: EventScope;
  emotion: Emotion;
  animation: Emotion;
}
// Conditions are implemented in engine.ts; authoring text never executes code.
const rows: [EventId, string, number, EventScope, Emotion][] = [
  ["E01", "open: local hour 05–10", 10, "day", "idle"],
  ["E02", "open: local hour 11–17", 10, "day", "idle"],
  ["E03", "open: local hour 18–04", 10, "day", "sleepy"],
  ["E04", "new current-day expense", 20, "repeat", "idle"],
  ["E05", "new current-day income", 20, "repeat", "happy"],
  ["E06", "earned streak crosses 7", 91, "once", "proud"],
  ["E07", "earned streak crosses 30", 92, "once", "surprised"],
  ["E08", "open: last recorded date 3–6 days ago", 15, "day", "worried"],
  ["E09", "new income category explicitly named salary", 85, "repeat", "happy"],
  [
    "E10",
    "first explicitly labelled side-income category",
    70,
    "once",
    "surprised",
  ],
  [
    "E11",
    "at least 2 explicitly entered distinct income sources",
    60,
    "period",
    "proud",
  ],
  ["E12", "closed period has positive actual funds", 50, "period", "proud"],
  [
    "E13",
    "non-overlapping configured budgets at 80–100%",
    74,
    "period",
    "worried",
  ],
  [
    "E14",
    "non-overlapping configured budgets exceed 100%",
    75,
    "period",
    "worried",
  ],
  ["E15", "food exceeds prior whole-period food", 45, "period", "worried"],
  ["E16", "travel exceeds prior whole-period travel", 45, "period", "worried"],
  ["E17", "new transfer into saving account", 60, "repeat", "happy"],
  ["E18", "saving goal reached for first time", 95, "once", "proud"],
  ["E19", "saving balance crosses 100000 satang", 90, "once", "happy"],
  ["E20", "saving balance crosses 1000000 satang", 91, "once", "proud"],
  [
    "E21",
    "explicit credit due date within 3 days and actual debt >0",
    80,
    "day",
    "worried",
  ],
  ["E22", "new transfer paying a credit account", 60, "repeat", "happy"],
  ["E23", "new transfer paying a debt account", 60, "repeat", "proud"],
  ["E24", "new payment leaves debt account at zero", 94, "once", "surprised"],
  ["E25", "real progression level exceeds high water", 92, "once", "happy"],
  ["E26", "real progression rank exceeds high water", 96, "once", "proud"],
  ["E27", "earned wardrobe availability increases", 93, "once", "embarrassed"],
  [
    "E28",
    "real level crosses existing furniture threshold",
    90,
    "once",
    "happy",
  ],
  ["E29", "per-character affinity tier increases", 88, "once", "embarrassed"],
  ["E30", "open: previously opened at least 14 days ago", 25, "day", "happy"],
  [
    "E31",
    "known daily coffee quantity =1 with no unknown quantities",
    65,
    "day",
    "idle",
  ],
  [
    "E32",
    "known daily coffee quantity >=3, no explicit partner cups",
    67,
    "day",
    "surprised",
  ],
  ["E33", "coffee-specific budget at 80–100%", 73, "period", "worried"],
  [
    "E34",
    "closed period has a record on every local date",
    93,
    "once",
    "proud",
  ],
  ["E35", "open: last recorded date >=7 days ago", 16, "day", "worried"],
  [
    "E36",
    "current income exceeds previous whole-period income >0",
    50,
    "period",
    "happy",
  ],
  ["E37", "actual active asset funds <0", 76, "day", "worried"],
  [
    "E38",
    "expense >3x prior median, prior sample >=5, minimum 1000 THB",
    55,
    "day",
    "surprised",
  ],
  ["E39", "explicit salary day within 3 days", 30, "day", "idle"],
  ["E40", "observed current period changes", 40, "period", "idle"],
  ["E41", "new transaction entrySource=quick", 21, "repeat", "happy"],
  ["E42", "outfit changed", 35, "repeat", "embarrassed"],
  ["E43", "hair changed", 35, "repeat", "embarrassed"],
  ["E44", "room entered", 25, "repeat", "idle"],
  ["E45", "wardrobe entered", 25, "repeat", "idle"],
  ["E46", "character selected for first time", 100, "once", "surprised"],
  ["E47", "skull clip newly equipped", 36, "repeat", "happy"],
  ["E48", "birthday MM-DD matches, explicit consent=true", 89, "day", "happy"],
  [
    "E49",
    "existing progression has 30 or 100 distinct recorded days",
    94,
    "once",
    "proud",
  ],
  [
    "E50",
    "explicit passive category/tag income >=100000 satang in period",
    60,
    "period",
    "proud",
  ],
  [
    "E51",
    "real next rank one level away and current level at least 80% complete",
    48,
    "period",
    "proud",
  ],
  [
    "C01",
    "coffee expense without stronger grounded coffee event",
    64,
    "repeat",
    "idle",
  ],
  [
    "C02",
    "known daily coffee quantity =2, no unknown quantities",
    66,
    "day",
    "annoyed",
  ],
  [
    "C03",
    "known daily quantity >=3, explicit partnerCups>=1",
    68,
    "day",
    "embarrassed",
  ],
  ["C04", "coffee-specific budget exceeded", 77, "period", "worried"],
  [
    "C05",
    "two closed comparable periods; latest coffee spend decreased",
    55,
    "period",
    "happy",
  ],
];
export const eventRegistry = Object.fromEntries(
  rows.map(([id, condition, priority, scope, emotion]) => [
    id,
    {
      id,
      title: bank[id].title,
      trigger: condition.split(":")[0],
      condition,
      priority,
      scope,
      emotion,
      animation: emotion,
      cooldown:
        scope === "repeat"
          ? ["E42", "E43", "E47"].includes(id)
            ? 15000
            : 4000
          : 60000,
    },
  ]),
) as Record<EventId, EventDefinition>;
export { bank as dialogueBank };
