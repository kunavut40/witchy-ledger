import { weeklyTotals } from "./spending";
import {
  today,
  summary,
  money,
  categorySpend,
  type State,
  type Period,
} from "./domain";
import type { DetailKind } from "./details";
import Pixel, { categoryIcon } from "./Pixel";
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
  const icons = ["ui-book", "ui-allowance", "ui-wallet", "ui-balance"];
  const anchor =
    p.end < today() ? p.end : p.start > today() ? p.start : today();
  const week = weeklyTotals(z.tx, anchor);
  const highest = Math.max(
    100,
    ...week.flatMap((d) => [d.income / 100, d.expense / 100]),
  );
  const power = 10 ** Math.floor(Math.log10(highest / 4));
  const tick = Math.ceil(highest / 4 / power) * power;
  const ceiling = tick * 4;
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
      <button
        className="compact-panel weekly-card"
        onClick={() => detail("period")}
        aria-label="ดูรายรับรายจ่ายรายสัปดาห์"
      >
        <div className="spread">
          <h3>รายรับ–รายจ่ายรายสัปดาห์</h3>
          <span className="week-legend">
            <i />
            รายรับ <i />
            รายจ่าย
          </span>
        </div>
        <svg
          viewBox="0 0 330 90"
          role="img"
          aria-label="กราฟแท่งรายรับและรายจ่าย วันจันทร์ถึงอาทิตย์"
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i}>
              <line
                x1="38"
                x2="326"
                y1={8 + i * 15}
                y2={8 + i * 15}
                stroke="#eae3ef"
              />
              <text
                x="33"
                y={11 + i * 15}
                textAnchor="end"
                fill="#9c8ca7"
                fontSize="8"
              >
                {(ceiling - i * tick).toLocaleString("th-TH")}
              </text>
            </g>
          ))}
          {week.map((d, i) => (
            <g key={d.date}>
              <title>
                {d.date +
                  " รายรับ " +
                  money(d.income) +
                  " รายจ่าย " +
                  money(d.expense)}
              </title>
              <rect
                x={43 + i * 40}
                y={68 - (d.income / 100 / ceiling) * 60}
                width="13"
                height={(d.income / 100 / ceiling) * 60}
                rx="2"
                fill="#add9c4"
              />
              <rect
                x={58 + i * 40}
                y={68 - (d.expense / 100 / ceiling) * 60}
                width="13"
                height={(d.expense / 100 / ceiling) * 60}
                rx="2"
                fill="#efbed1"
              />
              <text
                x={57 + i * 40}
                y="83"
                textAnchor="middle"
                fill="#8d789b"
                fontSize="8"
              >
                {d.label}
              </text>
            </g>
          ))}
        </svg>
      </button>
      <article className="compact-panel">
        <h3>✧ งบประมาณ</h3>
        {budgets.length ? (
          budgets.map((b) => {
            const used = categorySpend(b.categoryId, z.tx, s.categories),
              c = s.categories.find((c) => c.id === b.categoryId);
            return (
              <div className="compact-budget" key={b.id}>
                <Pixel name={categoryIcon(c)} size={28} />
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
    </section>
  );
}
