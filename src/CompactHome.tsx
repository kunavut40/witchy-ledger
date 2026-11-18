import {
  summary,
  money,
  categorySpend,
  type State,
  type Period,
} from "./domain";
import type { DetailKind } from "./details";
import Pixel from "./Pixel";
export default function CompactHome({
  s,
  p,
  detail,
  open,
}: {
  s: State;
  p: Period;
  detail: (k: DetailKind) => void;
  open: () => void;
}) {
  const z = summary(s, p);
  const kinds = ["actual", "income", "expense", "flow"] as const;
  const labels = ["เงินคงเหลือจริง", "รายรับรอบนี้", "รายจ่ายรอบนี้", "ยอดสุทธิของรอบ"];
  const icons = ["book", "coin", "potion", "rune"];
  const budgets = s.budgets.filter((b) => b.periodId === p.id).slice(0, 2);
  const recent = [...z.tx]
    .sort((a, b) => (b.date + b.createdAt).localeCompare(a.date + a.createdAt))
    .slice(0, 2);
  return (
    <section className="compact-home">
      <h1>✧ ภาพรวมการเงิน ✧</h1>
      <div className="compact-stats">
        {kinds.map((k, i) => (
          <button
            className={"compact-card compact-" + k}
            key={k}
            onClick={() => detail(k)}
          >
            <span>
              <Pixel name={icons[i]} size={28} />
              {labels[i]} ›
            </span>
            <strong>
              ฿{money(z[k === "actual" ? "actual" : k === "flow" ? "flow" : k])}
            </strong>
            <small>
              {k === "actual"
                ? "ยอดสะสมทุกบัญชี"
                : k === "flow"
                  ? "รายรับ − รายจ่าย"
                  : "เฉพาะรอบบัญชีที่เลือก"}
            </small>
          </button>
        ))}
      </div>
      <article className="compact-panel">
        <h3>✧ งบประมาณ</h3>
        {budgets.length ? (
          budgets.map((b) => {
            const used = categorySpend(b.categoryId, z.tx, s.categories),
              c = s.categories.find((c) => c.id === b.categoryId);
            return (
              <div className="compact-budget" key={b.id}>
                <Pixel name={c?.icon} size={28} />
                <div>
                  <span>
                    {c?.name}{" "}
                    <small>
                      ฿{money(used)} / {money(b.amount)}
                    </small>
                  </span>
                  <progress
                    value={Math.min(used, b.amount)}
                    max={b.amount || 1}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <p className="muted">ยังไม่ได้ตั้งงบในรอบนี้</p>
        )}
      </article>
      <article className="compact-panel">
        <div className="spread">
          <h3>✧ รายการล่าสุด</h3>
          <button onClick={open}>ดูทั้งหมด ›</button>
        </div>
        {recent.map((t) => (
          <div className="compact-recent" key={t.id}>
            <Pixel
              name={
                s.categories.find((c) => c.id === t.categoryId)?.icon || "coin"
              }
              size={28}
            />
            <span>{t.title}</span>
            <b>
              {t.kind === "income" ? "+" : t.kind === "expense" ? "−" : ""}฿
              {money(t.amount)}
            </b>
          </div>
        ))}
        {!recent.length && <p className="muted">เริ่มบันทึกด้วยปุ่ม +</p>}
      </article>
      <button className="text-button" onClick={() => detail("period")}>
        สรุปรอบนี้ ›
      </button>
    </section>
  );
}
