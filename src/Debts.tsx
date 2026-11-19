import { useExitMotion } from "./motion";
import { readFantasy } from "./fantasy/Fantasy";
import { useEffect, useState, type FormEvent } from "react";
import { askConfirm } from "./Confirm";
import { Plus, Pencil, X, Check, History, ArrowDownLeft } from "lucide-react";
import {
  type State,
  type Account,
  balance,
  isLiability,
  money,
  today,
  thaiDate,
  satang,
} from "./domain";
import { saveDebtPlan, payDebt } from "./debtRepository";
import Pixel from "./Pixel";
type Editor = { mode: "plan" | "pay"; account?: Account } | null;
export default function Debts({
  s,
  act,
}: {
  s: State;
  act: (fn: () => Promise<unknown>, message?: string) => Promise<boolean>;
}) {
  const [editor, setEditor] = useState<Editor>(null),
    [history, setHistory] = useState("");
  const debts = s.accounts.filter(isLiability);
  return (
    <>
      <div className="section-intro">
        <p>แยกรายการผ่อนตามสินค้า บัตร หรือผู้ให้บริการ แล้วบันทึกยอดที่ชำระจริงในแต่ละเดือน</p>
        <button
          className="soft-button"
          onClick={() => setEditor({ mode: "plan" })}
        >
          <Plus size={16} /> เพิ่มรายการผ่อน / บัตร
        </button>
      </div>
      <div className="debt-overview card">
        <span className="pixel-box">
          <Pixel name="crystal" />
        </span>
        <div>
          <small>ยอดคงค้างทั้งหมดถึงวันนี้</small>
          <h2>
            ฿
            {money(
              debts.reduce(
                (n, a) => n + balance(a, s.transactions, today()),
                0,
              ),
            )}
          </h2>
        </div>
        <span className="tag">{debts.length} รายการ</span>
      </div>
      {!debts.length && (
        <section className="card empty">
          <Pixel name="crystal" size={64} />
          <h3>เริ่มติดตามรายการผ่อนของคุณ</h3>
          <p>
            เพิ่ม S25, SPayLater, TikTok Pay หรือบัตรเครดิตได้เอง
            <br />
            ใส่ยอดคงค้างปัจจุบันและยอดที่ต้องชำระต่อเดือน
          </p>
          <button
            className="primary"
            onClick={() => setEditor({ mode: "plan" })}
          >
            <Plus size={16} /> เพิ่มรายการแรก
          </button>
        </section>
      )}
      <div className="entity-grid">
        {debts.map((a) => {
          const outstanding = balance(a, s.transactions, today());
          const paid = s.transactions
            .filter(
              (t) =>
                t.kind === "transfer" &&
                t.toAccountId === a.id &&
                t.date <= today(),
            )
            .reduce((n, t) => n + t.amount, 0);
          const nextPayment = Math.min(
            Math.max(0, outstanding),
            a.monthlyPayment || Math.max(0, outstanding),
          );
          return (
            <section className="card debt-plan" key={a.id}>
              <div className="spread">
                <span className="pixel-box" style={{ color: a.color }}>
                  <Pixel name={a.icon} />
                </span>
                <span className="tag">
                  {outstanding <= 0
                    ? "ชำระครบแล้ว"
                    : a.kind === "credit"
                      ? "บัตรเครดิต"
                      : "กำลังผ่อน"}
                </span>
              </div>
              <div className="spread">
                <h3>{a.name}</h3>
                <button
                  className="icon-button"
                  aria-label={"แก้ไขรายการผ่อน " + a.name}
                  onClick={() => setEditor({ mode: "plan", account: a })}
                >
                  <Pencil size={15} />
                </button>
              </div>
              <small className="muted">
                {a.debtProvider || "หนี้สินส่วนตัว"} · ยอดคงค้าง
              </small>
              <h2>฿{money(outstanding)}</h2>
              <div className="debt-details">
                <div className="spread">
                  <span>ยอดผ่อนประจำเดือน</span>
                  <b>
                    {a.monthlyPayment
                      ? "฿" + money(a.monthlyPayment)
                      : "ยังไม่กำหนด"}
                  </b>
                </div>
                <div className="spread">
                  <span>ชำระสะสมที่บันทึก</span>
                  <b>฿{money(paid)}</b>
                </div>
                {outstanding > 0 && (
                  <div className="spread">
                    <span>ยอดแนะนำงวดถัดไป</span>
                    <b>฿{money(nextPayment)}</b>
                  </div>
                )}
              </div>
              <button
                className="primary pay-button"
                disabled={outstanding <= 0 || !a.active}
                onClick={() => setEditor({ mode: "pay", account: a })}
              >
                <ArrowDownLeft size={17} /> บันทึกการชำระ
              </button>
              <button
                className="text-button history-button"
                aria-expanded={history === a.id}
                onClick={() => setHistory(history === a.id ? "" : a.id)}
              >
                <History size={15} /> {history === a.id ? "ซ่อน" : "ดู"}ประวัติชำระ
              </button>
              {history === a.id && (
                <div className="debt-history">
                  {s.transactions
                    .filter(
                      (t) =>
                        t.date <= today() &&
                        ((t.kind === "transfer" && t.toAccountId === a.id) ||
                          (t.kind === "adjustment" && t.accountId === a.id)),
                    )
                    .sort(
                      (a, b) =>
                        b.date.localeCompare(a.date) ||
                        b.createdAt.localeCompare(a.createdAt),
                    )
                    .map((t) => (
                      <div key={t.id}>
                        <div>
                          <b>
                            {t.kind === "transfer" ? "ชำระหนี้" : "ปรับยอดคงค้าง"}
                          </b>
                          <small>
                            {thaiDate(t.date, true)}
                            {t.kind === "transfer"
                              ? " · " +
                                s.accounts.find((x) => x.id === t.accountId)
                                  ?.name
                              : ""}
                          </small>
                          {t.note && <small>{t.note}</small>}
                        </div>
                        <b
                          className={t.kind === "transfer" ? "income" : "muted"}
                        >
                          {t.kind === "transfer"
                            ? "-"
                            : t.amount > 0
                              ? "+"
                              : ""}
                          ฿{money(t.amount)}
                        </b>
                      </div>
                    ))}
                  {!s.transactions.some(
                    (t) =>
                      (t.kind === "transfer" && t.toAccountId === a.id) ||
                      (t.kind === "adjustment" && t.accountId === a.id),
                  ) && <p className="muted">ยังไม่มีประวัติชำระ</p>}
                  <p className="tiny muted">
                    แก้ไขหรือลบการชำระได้ที่หน้ารายการธุรกรรม ยอดคงค้างจะคำนวณใหม่
                  </p>
                </div>
              )}
            </section>
          );
        })}
      </div>
      <p className="info-note">
        ยอดตั้งต้นคือหนี้ที่มีอยู่แล้ว จึงไม่บันทึกเป็นรายจ่ายซ้ำ เมื่อบันทึกชำระ
        ระบบจะลดเงินในบัญชีที่เลือกและลดยอดหนี้ การผ่อนยังเป็นการบันทึกด้วยตนเอง ไม่ตัดยอดอัตโนมัติ
        และยังไม่แยกดอกเบี้ย/ค่าธรรมเนียม
      </p>
      {editor && (
        <DebtEditor
          key={editor.mode + (editor.account?.id || "new")}
          editor={editor}
          s={s}
          close={() => setEditor(null)}
          act={act}
        />
      )}
    </>
  );
}
function DebtEditor({
  editor,
  s,
  close: closeImmediately,
  act,
}: {
  editor: NonNullable<Editor>;
  s: State;
  close: () => void;
  act: (fn: () => Promise<unknown>, message?: string) => Promise<boolean>;
}) {
  const motion = useExitMotion(closeImmediately, readFantasy(s).muted);
  const close = motion.dismiss;
  const a = editor.account;
  const current = a ? balance(a, s.transactions, today()) : 0;
  const [amount, setAmount] = useState(
    editor.mode === "pay"
      ? (
          Math.min(
            Math.max(0, current),
            a?.monthlyPayment || Math.max(0, current),
          ) / 100
        ).toFixed(2)
      : (current / 100).toFixed(2),
  );
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const back = (event: Event) => {
      event.preventDefault();
      if (busy) return;
      void askConfirm("ยกเลิกการแก้ไขและย้อนกลับ? ข้อมูลที่ยังไม่บันทึกจะไม่ถูกเก็บ").then(
        (ok) => ok && close(),
      );
    };
    document.addEventListener("witchy-overlay-back", back);
    return () => document.removeEventListener("witchy-overlay-back", back);
  }, [busy, close]);
  const [date, setDate] = useState(today());
  const asOf = a ? balance(a, s.transactions, date) : 0;
  let entered = 0;
  try {
    entered = satang(amount);
  } catch {}
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    const f = new FormData(e.currentTarget);
    const str = (name: string) => String(f.get(name) || "").trim();
    const ok = await act(
      async () => {
        if (editor.mode === "plan")
          await saveDebtPlan({
            id: a?.id,
            name: str("name"),
            provider: str("provider"),
            kind: (a?.kind || str("kind")) as "credit" | "debt",
            outstanding: satang(amount),
            monthlyPayment: satang(str("monthly") || "0"),
          });
        else
          await payDebt({
            debtId: a!.id,
            fromAccountId: str("account"),
            amount: satang(amount),
            date,
            note: str("note"),
          });
      },
      editor.mode === "pay" ? "บันทึกชำระและตัดยอดคงค้างแล้ว" : "บันทึกรายการผ่อนแล้ว",
    );
    setBusy(false);
    if (ok) close();
  }
  return (
    <div
      className={
        "modal-overlay motion-surface " +
        (motion.leaving ? "motion-leaving" : "")
      }
      onMouseDown={(e) => e.target === e.currentTarget && !busy && close()}
    >
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="debt-title"
      >
        <header>
          <div>
            <span className="eyebrow">ONE LITTLE STEP AT A TIME</span>
            <h2 id="debt-title">
              {editor.mode === "pay"
                ? "บันทึกชำระ " + a?.name
                : a
                  ? "แก้ไขรายการผ่อน"
                  : "เพิ่มรายการผ่อน / บัตร"}
            </h2>
          </div>
          <button
            className="icon-button"
            onClick={close}
            aria-label="ปิดรายการผ่อน"
          >
            <X />
          </button>
        </header>
        <form id="debt-form" onSubmit={submit}>
          {editor.mode === "plan" ? (
            <>
              <label>
                ชื่อรายการ
                <input
                  autoFocus
                  name="name"
                  required
                  maxLength={100}
                  defaultValue={a?.name}
                  placeholder="เช่น ผ่อน S25"
                />
              </label>
              <label>
                ผู้ให้บริการ / บัตร
                <input
                  name="provider"
                  maxLength={100}
                  defaultValue={a?.debtProvider}
                  placeholder="เช่น SPayLater, TikTok Pay, บัตรเครดิต"
                />
              </label>
              {!a && (
                <label>
                  ประเภท
                  <select name="kind" defaultValue="debt">
                    <option value="debt">ผ่อนชำระ / PayLater / หนี้สิน</option>
                    <option value="credit">บัตรเครดิต</option>
                  </select>
                </label>
              )}
              <label>
                ยอดคงค้างปัจจุบัน (บาท)
                <input
                  required
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="7087.02"
                />
              </label>
              <label>
                ยอดผ่อนต่อเดือน (บาท)
                <input
                  name="monthly"
                  inputMode="decimal"
                  defaultValue={
                    a?.monthlyPayment ? (a.monthlyPayment / 100).toFixed(2) : ""
                  }
                  placeholder="1417.42"
                />
              </label>
              <p className="info-note">
                {a
                  ? "หากเปลี่ยนยอดคงค้าง ระบบจะเก็บรายการปรับยอดวันที่วันนี้ ประวัติการชำระเดิมยังอยู่"
                  : "ใส่เฉพาะยอดที่ยังค้าง ไม่ต้องใส่ราคาสินค้ารวม ยอดนี้เป็นฐานเริ่มติดตามหนี้"}
              </p>
            </>
          ) : (
            <>
              <div className="payment-preview">
                <small>คงค้าง ณ วันที่ชำระ</small>
                <h2>฿{money(asOf)}</h2>
              </div>
              <label>
                วันที่ชำระ
                <input
                  required
                  type="date"
                  max={today()}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </label>
              <label>
                จำนวนที่ชำระ (บาท)
                <input
                  autoFocus
                  required
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </label>
              <label>
                ชำระจากบัญชี
                <select
                  required
                  name="account"
                  defaultValue={
                    s.accounts.find((x) => x.active && x.kind === "bank")?.id ||
                    ""
                  }
                >
                  <option value="">เลือกบัญชีที่ใช้ชำระ</option>
                  {s.accounts
                    .filter((x) => x.active && !isLiability(x))
                    .map((x) => (
                      <option key={x.id} value={x.id}>
                        {x.name}
                      </option>
                    ))}
                </select>
              </label>
              <label>
                หมายเหตุ
                <textarea name="note" rows={2} placeholder="เช่น งวดเดือนนี้" />
              </label>
              <div className="payment-result spread">
                <span>คงเหลือหลังชำระ ณ วันนี้</span>
                <b>฿{money(current - entered)}</b>
              </div>
              {(entered > Math.min(current, asOf) || entered <= 0) && (
                <p className="warning">กรุณากรอกยอดมากกว่า 0 และไม่เกินยอดคงค้าง</p>
              )}
              <p className="info-note">
                ระบบบันทึกเป็นการโอนเพื่อชำระหนี้ ไม่เพิ่มรายจ่ายซ้ำ
              </p>
            </>
          )}
        </form>
        <footer>
          <button className="soft-button" onClick={close}>
            ยกเลิก
          </button>
          <button className="primary" disabled={busy} form="debt-form">
            <Check size={17} />
            {editor.mode === "pay" ? "ยืนยันบันทึกชำระ" : "บันทึกรายการผ่อน"}
          </button>
        </footer>
      </section>
    </div>
  );
}
