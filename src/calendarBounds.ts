export function isSelectableDate(value: string, min?: string, max?: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number),
    d = new Date(year, month - 1, day, 12);
  return (
    d.getFullYear() === year &&
    d.getMonth() === month - 1 &&
    d.getDate() === day &&
    (!min || value >= min) &&
    (!max || value <= max)
  );
}
