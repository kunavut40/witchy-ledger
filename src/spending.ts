import type { State } from "./domain";
export function weeklyTotals(
  transactions: State["transactions"],
  anchor: string,
) {
  const start = new Date(anchor + "T12:00:00");
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    const date = [
      day.getFullYear(),
      String(day.getMonth() + 1).padStart(2, "0"),
      String(day.getDate()).padStart(2, "0"),
    ].join("-");
    const entries = transactions.filter((t) => t.date === date);
    return {
      date,
      label: ["จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส.", "อา."][i],
      income: entries
        .filter((t) => t.kind === "income")
        .reduce((n, t) => n + t.amount, 0),
      expense: entries
        .filter((t) => t.kind === "expense")
        .reduce((n, t) => n + t.amount, 0),
    };
  });
}
