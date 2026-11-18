import { ensureCategoryCatalog } from "./categoryCatalog";
import Dexie, { type Table } from "dexie";
import {
  type State,
  type Transaction,
  validateTransaction,
  uid,
  today,
} from "./domain";
export const tables = [
  "accounts",
  "categories",
  "periods",
  "transactions",
  "budgets",
  "goals",
  "settings",
] as const;
export class LedgerDB extends Dexie {
  accounts!: Table<State["accounts"][number]>;
  categories!: Table<State["categories"][number]>;
  periods!: Table<State["periods"][number]>;
  transactions!: Table<Transaction>;
  budgets!: Table<State["budgets"][number]>;
  goals!: Table<State["goals"][number]>;
  settings!: Table<State["settings"][number]>;
  constructor(name = "witchy-ledger") {
    super(name);
    this.version(1).stores({
      accounts: "id,kind,active",
      categories: "id,parentId,kind",
      periods: "id,start,end",
      transactions: "id,date,accountId,categoryId,kind",
      budgets: "id,periodId,categoryId",
      goals: "id,accountId",
      settings: "id",
      liabilities: "id,accountId",
      creditCardStatements: "id,accountId,dueDate",
      scheduledTransactions: "id,nextDate",
      backupMetadata: "id,createdAt",
      liabilityPayments: "id,liabilityId",
      importHistory: "id,createdAt",
    });
  }
}
export const db = new LedgerDB();
export async function readState(database = db): Promise<State> {
  const rows = await Promise.all(
    tables.map((t) => database.table(t).toArray()),
  );
  return Object.fromEntries(
    tables.map((t, i) => [t, rows[i]]),
  ) as unknown as State;
}
export async function saveTransaction(t: Transaction, database = db) {
  await database.transaction(
    "rw",
    database.transactions,
    database.accounts,
    database.categories,
    async () => {
      validateTransaction(t, await readTransactionState(database));
      await database.transactions.put(t);
    },
  );
}
async function readTransactionState(d: LedgerDB) {
  return {
    accounts: await d.accounts.toArray(),
    categories: await d.categories.toArray(),
  } as State;
}
export async function initialize() {
  await db.transaction(
    "rw",
    tables.map((t) => db.table(t)),
    async () => {
      if (await db.settings.get("initialized")) return;
      const s = initialState();
      for (const name of tables) await db.table(name).bulkPut(s[name]);
    },
  );
  await ensureCategoryCatalog(db);
}

export function initialState(): State {
  const date = today();
  const month = date.slice(0, 7);
  const last = new Date(Date.UTC(+date.slice(0, 4), +date.slice(5, 7), 0))
    .toISOString()
    .slice(0, 10);
  const categories: State["categories"] = [];
  const groups: [string, string, string, string[]][] = [
    [
      "income",
      "รายรับ",
      "book",
      ["เงินเดือน", "OT", "เงินตกเบิก", "เบี้ยเลี้ยง", "รายได้เสริม", "รายรับอื่น"],
    ],
    ["food", "อาหารและเครื่องดื่ม", "tea", ["ข้าว", "กาแฟ", "ขนม", "เครื่องดื่ม"]],
    ["home", "บ้าน", "house", ["ค่าไฟ", "ค่าน้ำ", "อินเทอร์เน็ต", "ของใช้ในบ้าน"]],
    ["travel", "เดินทาง", "broom", ["น้ำมัน", "ค่ารถ", "ซ่อมบำรุง"]],
    ["life", "ไลฟ์สไตล์", "crystal", ["ช้อปปิ้ง", "เกม", "บันเทิง", "ท่องเที่ยว"]],
    ["other", "ค่าใช้จ่ายอื่น", "potion", []],
  ];
  groups.forEach(([id, name, icon, children], i) => {
    const base = {
      kind: id === "income" ? ("income" as const) : ("expense" as const),
      icon,
      color: ["#73af9d", "#c9a0bc", "#a494cb", "#d4b47e", "#90b6cb", "#b0a9bd"][
        i
      ],
      archived: false,
    };
    categories.push({ ...base, id, name, parentId: "", order: i });
    children.forEach((name, j) =>
      categories.push({
        ...base,
        id: `${id}-${j}`,
        name,
        parentId: id,
        order: j,
      }),
    );
  });
  return {
    accounts: [
      {
        id: "cash",
        name: "กระเป๋าเงินสด",
        kind: "cash",
        opening: 0,
        color: "#d4b47e",
        icon: "coin",
        active: true,
        currency: "THB",
      },
      {
        id: "bank",
        name: "บัญชีธนาคาร",
        kind: "bank",
        opening: 0,
        color: "#a494cb",
        icon: "book",
        active: true,
        currency: "THB",
      },
    ],
    categories,
    periods: [
      {
        id: uid(),
        name:
          "รอบ " +
          new Intl.DateTimeFormat("th-TH", {
            month: "long",
            year: "numeric",
          }).format(new Date(date + "T12:00:00")),
        start: month + "-01",
        end: last,
        kind: "calendar",
      },
    ],
    transactions: [],
    budgets: [],
    goals: [],
    settings: [{ id: "initialized", value: "true" }],
  };
}
export function backupData(s: State) {
  return JSON.stringify(
    {
      app: "witchy-ledger",
      version: 1,
      createdAt: new Date().toISOString(),
      data: s,
    },
    null,
    2,
  );
}
export function parseBackup(text: string): State {
  const b = JSON.parse(text);
  if (b.app !== "witchy-ledger" || b.version !== 1 || !b.data)
    throw Error("ไฟล์สำรองไม่ถูกต้องหรือเวอร์ชันไม่รองรับ");
  const s = b.data as State;
  for (const name of tables) {
    if (!Array.isArray(s[name])) throw Error("ข้อมูลไม่ครบ: " + name);
    const ids = new Set();
    for (const row of s[name]) {
      if (typeof row.id !== "string" || ids.has(row.id))
        throw Error("ID ซ้ำหรือไม่ถูกต้อง");
      ids.add(row.id);
    }
  }
  for (const a of s.accounts)
    if (
      !a.name ||
      !["cash", "bank", "wallet", "saving", "credit", "debt", "other"].includes(
        a.kind,
      ) ||
      !Number.isSafeInteger(a.opening) ||
      a.opening < 0 ||
      a.currency !== "THB" ||
      (a.monthlyPayment !== undefined &&
        (!Number.isSafeInteger(a.monthlyPayment) || a.monthlyPayment < 0)) ||
      (a.debtProvider !== undefined && typeof a.debtProvider !== "string")
    )
      throw Error("ข้อมูลบัญชีไม่ถูกต้อง");
  for (const c of s.categories) {
    if (
      !c.name ||
      !["income", "expense"].includes(c.kind) ||
      typeof c.parentId !== "string"
    )
      throw Error("หมวดหมู่ไม่ถูกต้อง");
    let parent = c;
    const seen = new Set([c.id]);
    while (parent.parentId) {
      const found = s.categories.find((x) => x.id === parent.parentId);
      if (!found || seen.has(found.id) || found.kind !== c.kind)
        throw Error("ลำดับหมวดหมู่ไม่ถูกต้อง");
      seen.add(found.id);
      parent = found;
    }
  }
  if (!s.periods.length) throw Error("ต้องมีอย่างน้อยหนึ่งรอบ");
  for (const p of s.periods)
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(p.start) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(p.end) ||
      p.start > p.end ||
      !Number.isFinite(Date.parse(p.start)) ||
      !Number.isFinite(Date.parse(p.end))
    )
      throw Error("รอบบัญชีไม่ถูกต้อง");
  for (const t of s.transactions) validateTransaction(t, s);
  for (const b of s.budgets)
    if (
      !s.periods.some((p) => p.id === b.periodId) ||
      !s.categories.some((c) => c.id === b.categoryId) ||
      !Number.isSafeInteger(b.amount) ||
      b.amount <= 0
    )
      throw Error("งบประมาณไม่ถูกต้อง");
  for (const g of s.goals)
    if (
      !s.accounts.some((a) => a.id === g.accountId && a.kind === "saving") ||
      !Number.isSafeInteger(g.target) ||
      g.target <= 0
    )
      throw Error("เป้าหมายไม่ถูกต้อง");
  if (!s.settings.some((x) => x.id === "initialized"))
    throw Error("ไม่มีข้อมูลตั้งค่าเริ่มต้น");
  return s;
}
export async function restore(s: State, database = db) {
  await database.transaction(
    "rw",
    tables.map((t) => database.table(t)),
    async () => {
      for (const name of tables) {
        await database.table(name).clear();
        await database.table(name).bulkPut(s[name]);
      }
    },
  );
}
export async function loadDemo() {
  await db.transaction(
    "rw",
    tables.map((t) => db.table(t)),
    async () => {
      if ((await db.transactions.count()) > 0)
        throw Error("เพิ่มข้อมูลตัวอย่างได้เมื่อยังไม่มีรายการเท่านั้น");
      const s = await readState();
      const p = s.periods[0];
      const now = new Date().toISOString();
      const rows: [string, number, string, string, string][] = [
        ["income", 24560, "income-0", "bank", "เงินเดือนประจำรอบ"],
        ["expense", 65, "food-1", "cash", "ลาเต้ยามเช้า"],
        ["expense", 60, "food-0", "cash", "ข้าวมื้อกลางวัน"],
        ["expense", 800, "travel-0", "bank", "เติมน้ำมัน"],
        ["expense", 920, "home-0", "bank", "ค่าไฟบ้าน"],
        ["expense", 320, "life-0", "bank", "หนังสือเล่มใหม่"],
        ["expense", 130, "food-2", "cash", "ขนมสำหรับวันพักผ่อน"],
      ];
      await db.accounts.update("cash", { opening: 200000 });
      await db.accounts.update("bank", { opening: 1000000 });
      await db.transactions.bulkAdd(
        rows.map(([kind, amount, categoryId, accountId, title], i) => ({
          id: uid(),
          kind: kind as Transaction["kind"],
          amount: amount * 100,
          categoryId,
          accountId,
          title,
          date:
            p.start.slice(0, 8) +
            String(Math.min(+p.start.slice(8) + i, +p.end.slice(8))).padStart(
              2,
              "0",
            ),
          time: "",
          toAccountId: "",
          note: "ข้อมูลตัวอย่าง",
          tags: "",
          recurring: false,
          createdAt: now,
        })),
      );
      await db.budgets.bulkPut([
        { id: uid(), periodId: p.id, categoryId: "food", amount: 400000 },
        { id: uid(), periodId: p.id, categoryId: "travel", amount: 200000 },
        { id: uid(), periodId: p.id, categoryId: "home", amount: 300000 },
      ]);
      await db.settings.put({ id: "demo", value: "true" });
    },
  );
}
