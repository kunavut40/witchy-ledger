export type AccountKind =
  "cash" | "bank" | "wallet" | "saving" | "credit" | "debt" | "other";
export interface Account {
  id: string;
  name: string;
  kind: AccountKind;
  opening: number;
  color: string;
  icon: string;
  active: boolean;
  currency: "THB";
  monthlyPayment?: number;
  debtProvider?: string;
}
export interface Category {
  id: string;
  name: string;
  kind: "income" | "expense";
  parentId: string;
  icon: string;
  color: string;
  archived: boolean;
  order: number;
}
export interface Period {
  id: string;
  name: string;
  start: string;
  end: string;
  kind: "salary" | "calendar" | "custom";
}
export interface Transaction {
  id: string;
  kind: "income" | "expense" | "transfer" | "adjustment";
  amount: number;
  date: string;
  time: string;
  accountId: string;
  toAccountId: string;
  categoryId: string;
  title: string;
  note: string;
  tags: string;
  recurring: boolean;
  createdAt: string;
  /** Explicit user-entered coffee quantities; absence means unknown. */
  coffee?: { cups: number; partnerCups: number | null };
  entrySource?: "quick" | "manual";
  incomeSource?: string;
}
export interface Budget {
  id: string;
  periodId: string;
  categoryId: string;
  amount: number;
}
export interface Goal {
  id: string;
  name: string;
  accountId: string;
  target: number;
}
export interface State {
  accounts: Account[];
  categories: Category[];
  periods: Period[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  settings: { id: string; value: string }[];
}
export const uid = () => crypto.randomUUID();
export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
export const money = (n: number) =>
  new Intl.NumberFormat("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n / 100);
export const thaiDate = (iso: string, short = false) =>
  new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: short ? "short" : "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso + "T00:00:00Z"));
export function satang(value: string): number {
  if (!/^-?\d+(\.\d{1,2})?$/.test(value))
    throw Error("จำนวนเงินต้องมีทศนิยมไม่เกิน 2 ตำแหน่ง");
  const negative = value.startsWith("-");
  const [whole, fraction = ""] = value.replace("-", "").split(".");
  const result = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(result) || Math.abs(result) > 1e13)
    throw Error("จำนวนเงินมากเกินไป");
  return negative ? -result : result;
}
export const isLiability = (a: Account) => ["credit", "debt"].includes(a.kind);
export function balance(a: Account, tx: Transaction[], end = "9999-12-31") {
  let n = a.opening;
  for (const t of tx.filter((t) => t.date <= end)) {
    if (t.accountId === a.id) {
      if (t.kind === "income") n += isLiability(a) ? -t.amount : t.amount;
      if (t.kind === "expense") n += isLiability(a) ? t.amount : -t.amount;
      if (t.kind === "transfer") n -= t.amount;
      if (t.kind === "adjustment") n += t.amount;
    }
    if (t.kind === "transfer" && t.toAccountId === a.id)
      n += isLiability(a) ? -t.amount : t.amount;
  }
  return n;
}
export function summary(s: State, p: Period) {
  const tx = s.transactions.filter((t) => t.date >= p.start && t.date <= p.end);
  const income = tx
    .filter((t) => t.kind === "income")
    .reduce((a, t) => a + t.amount, 0);
  const expense = tx
    .filter((t) => t.kind === "expense")
    .reduce((a, t) => a + t.amount, 0);
  return {
    tx,
    income,
    expense,
    flow: income - expense,
    actual: s.accounts
      .filter((a) => !isLiability(a))
      .reduce((n, a) => n + balance(a, s.transactions, p.end), 0),
    debt: s.accounts
      .filter(isLiability)
      .reduce((n, a) => n + balance(a, s.transactions, p.end), 0),
  };
}
export function descendantIds(id: string, cats: Category[]): string[] {
  return [
    id,
    ...cats
      .filter((c) => c.parentId === id)
      .flatMap((c) => descendantIds(c.id, cats)),
  ];
}
export function categorySpend(id: string, tx: Transaction[], cats: Category[]) {
  const ids = descendantIds(id, cats);
  return tx
    .filter((t) => t.kind === "expense" && ids.includes(t.categoryId))
    .reduce((n, t) => n + t.amount, 0);
}
export function periodWarnings(p: Period, all: Period[]) {
  const others = all.filter((x) => x.id !== p.id);
  const out: string[] = [];
  if (others.some((x) => x.start <= p.end && x.end >= p.start))
    out.push("วันที่ซ้อนทับกับรอบอื่น");
  const before = others
    .filter((x) => x.end < p.start)
    .sort((a, b) => b.end.localeCompare(a.end))[0];
  if (before && addDays(before.end, 1) !== p.start)
    out.push("มีช่วงวันที่ว่างจากรอบก่อนหน้า");
  return out;
}
export function addDays(iso: string, n: number) {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
export function nextPeriod(p: Period): Period {
  const days =
    Math.round((Date.parse(p.end) - Date.parse(p.start)) / 86400000) + 1;
  const start = addDays(p.end, 1);
  return {
    ...p,
    id: uid(),
    name: p.name + " (รอบถัดไป)",
    start,
    end: addDays(start, days - 1),
  };
}
export function validateTransaction(t: Transaction, s: State) {
  if (
    t.incomeSource !== undefined &&
    (typeof t.incomeSource !== "string" || t.incomeSource.length > 80)
  )
    throw Error("แหล่งรายได้ต้องเป็นข้อความไม่เกิน 80 ตัวอักษร");
  if (
    t.coffee &&
    (!Number.isSafeInteger(t.coffee.cups) ||
      t.coffee.cups < 1 ||
      t.coffee.cups > 100 ||
      (t.coffee.partnerCups !== null &&
        (!Number.isSafeInteger(t.coffee.partnerCups) ||
          t.coffee.partnerCups < 0 ||
          t.coffee.partnerCups > t.coffee.cups)))
  )
    throw Error(
      "จำนวนกาแฟต้องเป็นจำนวนเต็ม 1–100 แก้ว และจำนวนของแฟนต้องไม่เกินจำนวนรวม",
    );
  if (!t.title.trim()) throw Error("กรุณาระบุชื่อรายการ");
  if (
    !Number.isSafeInteger(t.amount) ||
    t.amount === 0 ||
    (t.kind !== "adjustment" && t.amount < 0)
  )
    throw Error("กรุณาระบุจำนวนเงินมากกว่า 0");
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(t.date) ||
    Number.isNaN(Date.parse(t.date)) ||
    new Date(t.date + "T00:00:00Z").toISOString().slice(0, 10) !== t.date
  )
    throw Error("วันที่ไม่ถูกต้อง");
  const account = s.accounts.find((a) => a.id === t.accountId);
  if (!account) throw Error("ไม่พบบัญชี");
  if (t.kind === "transfer") {
    if (isLiability(account)) throw Error("กรุณาใช้บัญชีเงินสดหรือธนาคารเป็นบัญชีต้นทาง");
    if (
      t.toAccountId === t.accountId ||
      !s.accounts.some((a) => a.id === t.toAccountId)
    )
      throw Error("กรุณาเลือกบัญชีปลายทางที่ต่างกัน");
  }
  if (
    ["income", "expense"].includes(t.kind) &&
    !s.categories.some((c) => c.id === t.categoryId && c.kind === t.kind)
  )
    throw Error("กรุณาเลือกหมวดหมู่ให้ตรงกับประเภทรายการ");
}
