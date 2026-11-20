import type { Period } from "./domain";
export const MONTHS = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];
export function monthPreset(
  periods: Period[],
  year: number,
  month: number,
): Period {
  const id = `month-${year}-${month + 1}`,
    prefix = `${year}-${String(month + 1).padStart(2, "0")}`;
  return (
    periods.find((p) => p.id === id) ||
    periods.find(
      (p) => p.start.startsWith(String(year)) && p.name.includes(MONTHS[month]),
    ) ||
    periods.find(
      (p) => p.kind === "calendar" && p.start.startsWith(prefix),
    ) || {
      id,
      name: MONTHS[month],
      start: prefix + "-01",
      end: prefix + "-" + new Date(year, month + 1, 0, 12).getDate(),
      kind: "calendar",
    }
  );
}
