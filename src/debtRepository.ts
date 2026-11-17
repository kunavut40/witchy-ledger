import { db, type LedgerDB } from "./db";
import {
  balance,
  isLiability,
  today,
  uid,
  validateTransaction,
  type Account,
  type Transaction,
} from "./domain";
export interface DebtPlanInput {
  id?: string;
  name: string;
  provider: string;
  kind: "credit" | "debt";
  outstanding: number;
  monthlyPayment: number;
}
export async function saveDebtPlan(
  input: DebtPlanInput,
  database: LedgerDB = db,
) {
  if (!input.name.trim()) throw Error("กรุณาระบุชื่อรายการผ่อนหรือบัตร");
  if (
    !Number.isSafeInteger(input.outstanding) ||
    input.outstanding < 0 ||
    !Number.isSafeInteger(input.monthlyPayment) ||
    input.monthlyPayment < 0
  )
    throw Error("ยอดเงินไม่ถูกต้อง");
  return database.transaction(
    "rw",
    database.accounts,
    database.transactions,
    async () => {
      const old = input.id ? await database.accounts.get(input.id) : undefined;
      if (input.id && (!old || !isLiability(old))) throw Error("ไม่พบรายการหนี้");
      const account: Account = {
        ...(old || {
          id: uid(),
          opening: input.outstanding,
          color: "#a494cb",
          icon: "crystal",
          active: true,
          currency: "THB" as const,
        }),
        name: input.name.trim(),
        kind: old?.kind || input.kind,
        monthlyPayment: input.monthlyPayment,
        debtProvider: input.provider.trim(),
      };
      if (old) {
        const previous = balance(
          old,
          await database.transactions.toArray(),
          today(),
        );
        const delta = input.outstanding - previous;
        if (delta)
          await database.transactions.add({
            id: uid(),
            kind: "adjustment",
            amount: delta,
            date: today(),
            time: "",
            accountId: old.id,
            toAccountId: "",
            categoryId: "",
            title: "ปรับยอดคงค้าง " + account.name,
            note:
              "ยอดเดิม " +
              (previous / 100).toFixed(2) +
              " บาท → ยอดใหม่ " +
              (input.outstanding / 100).toFixed(2) +
              " บาท",
            tags: "",
            recurring: false,
            createdAt: new Date().toISOString(),
          });
      }
      await database.accounts.put(account);
      return account.id;
    },
  );
}
export async function payDebt(
  input: {
    debtId: string;
    fromAccountId: string;
    amount: number;
    date: string;
    note: string;
  },
  database: LedgerDB = db,
) {
  return database.transaction(
    "rw",
    database.accounts,
    database.transactions,
    database.categories,
    async () => {
      const accounts = await database.accounts.toArray(),
        categories = await database.categories.toArray(),
        transactions = await database.transactions.toArray();
      const debt = accounts.find((a) => a.id === input.debtId),
        source = accounts.find((a) => a.id === input.fromAccountId);
      if (!debt || !isLiability(debt)) throw Error("ไม่พบรายการหนี้");
      if (!source || !source.active || isLiability(source))
        throw Error("กรุณาเลือกบัญชีเงินที่ใช้ชำระ");
      if (input.date > today()) throw Error("บันทึกการชำระได้ถึงวันนี้เท่านั้น");
      if (
        input.amount >
        Math.min(
          balance(debt, transactions, input.date),
          balance(debt, transactions, today()),
        )
      )
        throw Error("ยอดชำระต้องไม่เกินยอดคงค้าง");
      const t: Transaction = {
        id: uid(),
        kind: "transfer",
        amount: input.amount,
        date: input.date,
        time: "",
        accountId: source.id,
        toAccountId: debt.id,
        categoryId: "",
        title: "ชำระ " + debt.name,
        note: input.note,
        tags: "ผ่อนชำระ",
        recurring: false,
        createdAt: new Date().toISOString(),
      };
      validateTransaction(t, { accounts, categories } as Parameters<
        typeof validateTransaction
      >[1]);
      await database.transactions.add(t);
      return t.id;
    },
  );
}
