import { addDays, today, type Transaction } from "./domain";
export const ranks = [
  { name: "Herald", title: "ผู้จุดประกาย", level: 1, color: "#8ca487" },
  { name: "Guardian", title: "ผู้พิทักษ์คัมภีร์", level: 3, color: "#b6ab8b" },
  { name: "Crusader", title: "อัศวินจันทรา", level: 5, color: "#73b6b1" },
  { name: "Archon", title: "จอมเวทแห่งป่า", level: 8, color: "#9dbb77" },
  { name: "Legend", title: "ตำนานเปลวมนตรา", level: 12, color: "#d0a267" },
  { name: "Ancient", title: "ผู้ครองเวทโบราณ", level: 17, color: "#b58cdb" },
  { name: "Divine", title: "เทพพิทักษ์ดารา", level: 23, color: "#8fc8ed" },
  { name: "Immortal", title: "ราชันนิรันดร์", level: 30, color: "#efb86e" },
];
export const levelFloor = (level: number) => 20 * (level - 1) ** 2;
export function progression(transactions: Transaction[], asOf = today()) {
  const dates = [
    ...new Set(
      transactions
        .filter(
          (t) =>
            t.kind !== "adjustment" &&
            !t.note.includes("ข้อมูลตัวอย่าง") &&
            /^\d{4}-\d{2}-\d{2}T/.test(t.createdAt) &&
            Number.isFinite(Date.parse(t.createdAt)),
        )
        .map((t) => {
          const d = new Date(t.createdAt);
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        })
        .filter((d) => d <= asOf),
    ),
  ].sort();
  let xp = 0,
    run = 0,
    best = 0;
  for (let i = 0; i < dates.length; i++) {
    run = i > 0 && addDays(dates[i - 1], 1) === dates[i] ? run + 1 : 1;
    best = Math.max(best, run);
    xp += 25 + Math.min(run - 1, 7) * 5;
  }
  const last = dates.at(-1);
  const streak = last === asOf || last === addDays(asOf, -1) ? run : 0;
  const level = Math.floor(Math.sqrt(xp / 20)) + 1;
  const rankIndex = ranks.reduce(
    (index, r, i) => (level >= r.level ? i : index),
    0,
  );
  return {
    xp,
    level,
    streak,
    best,
    days: dates.length,
    rankIndex,
    rank: ranks[rankIndex],
    next: ranks[rankIndex + 1],
    levelProgress:
      ((xp - levelFloor(level)) / (levelFloor(level + 1) - levelFloor(level))) *
      100,
    toNext: levelFloor(level + 1) - xp,
    todayDone: last === asOf,
  };
}
