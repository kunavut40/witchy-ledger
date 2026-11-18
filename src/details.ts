import {
  summary,
  balance,
  isLiability,
  categorySpend,
  descendantIds,
  type State,
  type Period,
} from "./domain";
export type DetailKind = "actual" | "income" | "expense" | "flow" | "period";
export const detailTitles: Record<DetailKind, string> = {
  actual: "เงินคงเหลือจริงสะสม",
  income: "รายรับรอบนี้",
  expense: "รายจ่ายรอบนี้",
  flow: "ยอดสุทธิของรอบ",
  period: "สรุปรายจ่ายรอบนี้",
};
export function detailData(
  s: State,
  p: Period,
  kind: DetailKind,
  categoryId = "",
) {
  const z = summary(s, p);
  const type = kind === "income" ? "income" : "expense";
  const transactions = z.tx
    .filter((t) =>
      kind === "flow"
        ? t.kind === "income" || t.kind === "expense"
        : t.kind === type,
    )
    .filter(
      (t) =>
        !categoryId ||
        descendantIds(categoryId, s.categories).includes(t.categoryId),
    )
    .sort(
      (a, b) =>
        b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt),
    );
  const groups = s.categories
    .filter((c) => !c.parentId && c.kind === type)
    .map((c) => ({
      id: c.id,
      name: c.name,
      color: c.color,
      icon: c.icon,
      amount:
        type === "expense"
          ? categorySpend(c.id, z.tx, s.categories)
          : z.tx
              .filter(
                (t) =>
                  t.kind === "income" &&
                  descendantIds(c.id, s.categories).includes(t.categoryId),
              )
              .reduce((n, t) => n + t.amount, 0),
    }))
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);
  return {
    ...z,
    transactions,
    groups,
    accounts: s.accounts
      .filter((a) => !isLiability(a))
      .map((a) => ({ ...a, amount: balance(a, s.transactions, p.end) })),
    total:
      categoryId && kind !== "actual" && kind !== "flow"
        ? transactions.reduce((n, t) => n + t.amount, 0)
        : kind === "actual"
          ? z.actual
          : kind === "income"
            ? z.income
            : kind === "flow"
              ? z.flow
              : z.expense,
  };
}
