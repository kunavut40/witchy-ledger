import type { State, Period } from "./domain";
import { summary, money } from "./domain";
import Pixel from "./Pixel";
export default function MobileHome({
  s,
  period,
  open,
}: {
  s: State;
  period: Period;
  open: () => void;
}) {
  const totals = summary(s, period);
  const recent = [...totals.tx]
    .sort((a, b) => (b.date + b.createdAt).localeCompare(a.date + a.createdAt))
    .slice(0, 2);
  const biggest = totals.tx
    .filter((t) => t.kind === "expense")
    .sort((a, b) => b.amount - a.amount)[0];
  const cards = [
    ["เงินคงเหลือ", totals.actual, "ยอดรวมบัญชี ณ สิ้นรอบ", "chest"],
    [
      "รายรับ",
      totals.income,
      totals.tx.filter((t) => t.kind === "income").length + " รายการในรอบ",
      "coin",
    ],
    [
      "รายจ่าย",
      totals.expense,
      biggest
        ? "สูงสุด " +
          (s.categories.find((c) => c.id === biggest.categoryId)?.name ||
            biggest.title)
        : "ยังไม่มีรายจ่าย",
      "tea",
    ],
    [
      "ยอดสุทธิ",
      totals.flow,
      totals.income
        ? "เหลือ " +
          Math.round((totals.flow / totals.income) * 100) +
          "% ของรายรับ"
        : "รายรับ − รายจ่าย",
      "book",
    ],
  ] as const;
  const daily = Array.from({ length: 7 }, (_, i) => {
    const day = new Date();
    day.setDate(day.getDate() - 6 + i);
    const key = [
      day.getFullYear(),
      String(day.getMonth() + 1).padStart(2, "0"),
      String(day.getDate()).padStart(2, "0"),
    ].join("-");
    return {
      label: day.toLocaleDateString("th", { weekday: "short" }),
      income: totals.tx
        .filter((t) => t.date === key && t.kind === "income")
        .reduce((n, t) => n + t.amount, 0),
      expense: totals.tx
        .filter((t) => t.date === key && t.kind === "expense")
        .reduce((n, t) => n + t.amount, 0),
    };
  });
  const max = Math.max(1, ...daily.flatMap((d) => [d.income, d.expense]));
  return (
    <section className="mobile-dashboard">
      <div className="spread">
        <h1>ภาพรวม</h1>
        <small>{period.name}</small>
      </div>
      <div className="mobile-stat-grid">
        {cards.map(([label, value, detail, icon], i) => (
          <article key={label} className={"mobile-stat stat-" + i}>
            <div className="spread">
              <small>{label}</small>
              <Pixel name={icon} size={22} />
            </div>
            <strong>฿{money(value)}</strong>
            <small>{detail}</small>
          </article>
        ))}
      </div>
      <article className="mobile-week">
        <div className="spread">
          <b>7 วันล่าสุด</b>
          <small>รายรับ · รายจ่าย</small>
        </div>
        <div className="week-bars">
          {daily.map((d, i) => (
            <div
              key={i}
              aria-label={
                d.label +
                " รายรับ " +
                money(d.income) +
                " รายจ่าย " +
                money(d.expense)
              }
            >
              <div>
                <i style={{ height: Math.max(2, (d.income / max) * 55) }} />
                <i style={{ height: Math.max(2, (d.expense / max) * 55) }} />
              </div>
              <small>{d.label}</small>
            </div>
          ))}
        </div>
      </article>
      <div className="spread">
        <b>รายการล่าสุด</b>
        <button className="text-button" onClick={open}>
          ดูทั้งหมด
        </button>
      </div>
      {recent.length ? (
        recent.map((t) => (
          <div className="mobile-recent" key={t.id}>
            <Pixel
              name={
                s.categories.find((c) => c.id === t.categoryId)?.icon || "coin"
              }
              size={28}
            />
            <span>{t.title}</span>
            <b>
              {t.kind === "income" ? "+" : "−"}
              {money(t.amount)}
            </b>
          </div>
        ))
      ) : (
        <p className="muted">เริ่มบันทึกวันนี้ด้วยปุ่ม ＋</p>
      )}
    </section>
  );
}
