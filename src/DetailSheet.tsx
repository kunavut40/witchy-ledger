import { useExitMotion } from "./motion";
import { readFantasy } from "./fantasy/Fantasy";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, ChevronRight, X } from "lucide-react";
import { detailData, detailTitles, type DetailKind } from "./details";
import { money, thaiDate, type State, type Period } from "./domain";
import Pixel from "./Pixel";
export default function DetailSheet({
  s,
  period: p,
  kind,
  close: closeImmediately,
}: {
  s: State;
  period: Period;
  kind: DetailKind;
  close: () => void;
}) {
  const [category, setCategory] = useState("");
  const closeMotion = useExitMotion(closeImmediately, readFantasy(s).muted);
  const backMotion = useExitMotion(() => setCategory(""), readFantasy(s).muted);
  const close = closeMotion.dismiss;
  const back = () => (category ? backMotion.dismiss() : close());
  const sheet = useRef<HTMLElement>(null);
  const d = detailData(s, p, kind, category);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const siblings = Array.from(sheet.current?.parentElement?.children || [])
      .filter(
        (element): element is HTMLElement =>
          element instanceof HTMLElement && element !== sheet.current,
      )
      .map((element) => ({ element, inert: element.inert }));
    siblings.forEach(({ element }) => (element.inert = true));
    sheet.current?.querySelector<HTMLButtonElement>("button")?.focus();
    return () => {
      siblings.forEach(({ element, inert }) => (element.inert = inert));
      previous?.focus();
    };
  }, []);
  useEffect(() => {
    document.addEventListener("witchy-detail-back", back);
    return () => document.removeEventListener("witchy-detail-back", back);
  }, [category, close]);
  return (
    <section
      ref={sheet}
      className={
        "detail-sheet motion-surface " +
        (closeMotion.leaving || backMotion.leaving ? "motion-leaving" : "")
      }
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const buttons = Array.from(
          sheet.current?.querySelectorAll<HTMLButtonElement>(
            "button:not(:disabled)",
          ) || [],
        );
        const first = buttons[0],
          last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-title"
    >
      <header>
        <button
          className="icon-button"
          aria-label="ย้อนกลับจากรายละเอียด"
          onClick={back}
        >
          <ArrowLeft />
        </button>
        <h2 id="detail-title">
          {category
            ? s.categories.find((c) => c.id === category)?.name
            : detailTitles[kind]}
        </h2>
        <button
          className="icon-button"
          aria-label="ปิดรายละเอียด"
          onClick={close}
        >
          <X />
        </button>
      </header>
      <div className="detail-body">
        <p className="muted">{p.name}</p>
        <p className="tiny muted">
          {thaiDate(p.start, true)} — {thaiDate(p.end, true)}
        </p>
        <article className="detail-total">
          <small>{category ? "ยอดรวมหมวดที่เลือก" : detailTitles[kind]}</small>
          <h1>฿{money(d.total)}</h1>
          <p>
            {kind === "actual"
              ? "ยอดสะสมทุกบัญชีเงินถึงวันสิ้นรอบ รวมยอดก่อนรอบนี้"
              : kind === "flow"
                ? "รายรับ − รายจ่ายเฉพาะรอบ ไม่รวมการโอนและปรับยอด"
                : "เฉพาะรายการในช่วงวันที่ที่เลือก"}
          </p>
        </article>
        {kind === "actual" ? (
          <div className="card">
            <h3>ยอดคงเหลือแยกบัญชี</h3>
            {d.accounts.map((a) => (
              <div className="detail-row" key={a.id}>
                <span className="pixel-box" style={{ color: a.color }}>
                  <Pixel name={a.icon} />
                </span>
                <span>
                  {a.name}
                  <small>{!a.active ? "พักใช้งาน · ยังนับยอด" : ""}</small>
                </span>
                <b>฿{money(a.amount)}</b>
              </div>
            ))}
            <p className="info-note">
              ยอดนี้ไม่หักหนี้บัตรเครดิตหรือสินเชื่อ หนี้แสดงแยกในหน้าหนี้สิน
            </p>
          </div>
        ) : (
          <>
            {kind === "flow" && (
              <div className="detail-flow">
                <div className="card income">
                  <small>รายรับ</small>
                  <h2>฿{money(d.income)}</h2>
                </div>
                <div className="card expense">
                  <small>รายจ่าย</small>
                  <h2>฿{money(d.expense)}</h2>
                </div>
              </div>
            )}
            {kind !== "flow" && !category && (
              <div className="card">
                <h3>สรุปตามหมวด</h3>
                <p className="muted tiny">
                  {d.transactions.length} รายการ
                  {d.groups[0] ? " · สูงสุด: " + d.groups[0].name : ""}
                </p>
                {d.groups.map((c) => (
                  <button
                    className="detail-row"
                    key={c.id}
                    onClick={() => setCategory(c.id)}
                  >
                    <span className="pixel-box" style={{ color: c.color }}>
                      <Pixel name={c.icon} />
                    </span>
                    <span>
                      {c.name}
                      <small>
                        {d.total ? Math.round((c.amount / d.total) * 100) : 0}%
                      </small>
                    </span>
                    <b>฿{money(c.amount)}</b>
                    <ChevronRight size={15} />
                  </button>
                ))}
                {!d.groups.length && <p className="empty">ยังไม่มีรายการในรอบนี้</p>}
              </div>
            )}
            <div className="card">
              <h3>{category ? "รายการในหมวดนี้" : "รายการที่เกี่ยวข้อง"}</h3>
              {d.transactions.map((t) => (
                <div className="detail-row" key={t.id}>
                  <span>
                    {t.title}
                    <small>
                      {thaiDate(t.date, true)} ·{" "}
                      {s.accounts.find((a) => a.id === t.accountId)?.name}
                      {t.note ? " · " + t.note : ""}
                    </small>
                  </span>
                  <b className={t.kind === "income" ? "income" : "expense"}>
                    {t.kind === "income" ? "+" : "−"}฿{money(t.amount)}
                  </b>
                </div>
              ))}
              {!d.transactions.length && (
                <p className="empty">ไม่มีรายการตามเงื่อนไขนี้</p>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
