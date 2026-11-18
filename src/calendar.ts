export function isoDay(year: number, month: number, day: number) {
  return [
    year,
    String(month + 1).padStart(2, "0"),
    String(day).padStart(2, "0"),
  ].join("-");
}
export function monthCells(year: number, month: number) {
  const offset = new Date(year, month, 1, 12).getDay();
  const count = new Date(year, month + 1, 0, 12).getDate();
  return Array.from({ length: Math.ceil((offset + count) / 7) * 7 }, (_, i) =>
    i < offset || i >= offset + count ? null : i - offset + 1,
  );
}
