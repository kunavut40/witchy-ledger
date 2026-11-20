import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { type Period, thaiDate, periodWarnings } from "./domain";
import { db } from "./db";
import { askConfirm } from "./Confirm";
import { MONTHS, monthPreset } from "./monthPresets";
import { useExitMotion } from "./motion";
import { overlayHost, useOverlay } from "./ui/SharedBackdrop";
import { menuSound } from "./fantasy/sound";
function MonthTile({
  period,
  month,
  selected,
  choose,
  edit,
}: {
  period: Period;
  month: number;
  selected: boolean;
  choose: () => void;
  edit: () => void;
}) {
  const held = useRef(false),
    timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined),
    origin = useRef([0, 0]);
  const clear = () => clearTimeout(timer.current);
  useEffect(() => clear, []);
  return (
    <div className="month-tile" data-selected={selected}>
      <button
        type="button"
        aria-label={MONTHS[month]}
        aria-pressed={selected}
        onPointerDown={(e) => {
          held.current = false;
          origin.current = [e.clientX, e.clientY];
          timer.current = setTimeout(() => {
            held.current = true;
            edit();
          }, 420);
        }}
        onPointerMove={(e) => {
          if (
            Math.hypot(
              e.clientX - origin.current[0],
              e.clientY - origin.current[1],
            ) > 10
          )
            clear();
        }}
        onPointerUp={clear}
        onPointerCancel={clear}
        onContextMenu={(e) => e.preventDefault()}
        onClick={() => {
          if (held.current) {
            held.current = false;
            return;
          }
          choose();
        }}
      >
        <b>{MONTHS[month]}</b>
        <small>
          {thaiDate(period.start, true)}
          <br />— {thaiDate(period.end, true)}
        </small>
      </button>
      <button
        className="month-edit"
        aria-label={"แก้ไขพรีเซต " + MONTHS[month]}
        onClick={edit}
      >
        ✎
      </button>
    </div>
  );
}
export default function PeriodManager({
  periods,
  selected,
  select,
  edit,
  add,
  muted = false,
}: {
  periods: Period[];
  selected: Period;
  select: (id: string) => void;
  edit: (p: Period) => void;
  add: () => void;
  muted?: boolean;
}) {
  const [open, setOpen] = useState(false),
    [year, setYear] = useState(+selected.start.slice(0, 4)),
    [error, setError] = useState("");
  const pending = useRef(false);
  const { leaving, dismiss } = useExitMotion(() => setOpen(false), muted);
  useOverlay(open, 400);
  useEffect(() => {
    if (!open) return;
    const back = (e: Event) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      dismiss();
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") back(e);
    };
    document.addEventListener("witchy-overlay-back", back);
    window.addEventListener("keydown", key, true);
    return () => {
      document.removeEventListener("witchy-overlay-back", back);
      window.removeEventListener("keydown", key, true);
    };
  }, [open, dismiss]);
  const choose = async (p: Period) => {
    if (pending.current) return;
    pending.current = true;
    try {
      if (!periods.some((x) => x.id === p.id)) {
        const warnings = periodWarnings(p, periods);
        if (
          warnings.length &&
          !(await askConfirm(
            warnings.join("\n") + "\nต้องการสร้างรอบเดือนนี้หรือไม่?",
          ))
        )
          return;
        await db.periods.put(p);
      }
      select(p.id);
      menuSound("select", muted);
      dismiss();
    } catch {
      setError("เลือกรอบไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      pending.current = false;
    }
  };
  const editMonth = (p: Period) => {
    setOpen(false);
    edit(p);
  };
  const months = MONTHS.map((_, i) => monthPreset(periods, year, i));
  const other = periods.filter((p) => !months.some((m) => m.id === p.id));
  return (
    <>
      <div className="period-selection-summary">
        <button
          className="period-manager-trigger"
          aria-label="เลือกรอบบัญชี"
          aria-haspopup="dialog"
          onClick={() => {
            setYear(+selected.start.slice(0, 4));
            setOpen(true);
          }}
        >
          {selected.name} ▾
        </button>
        <span className="selected-period-range">
          {thaiDate(selected.start, true)} — {thaiDate(selected.end, true)}
        </span>
      </div>
      {open &&
        createPortal(
          <div
            className={
              "period-manager-overlay " + (leaving ? "motion-leaving" : "")
            }
            onClick={dismiss}
          >
            <section
              className="period-manager"
              role="dialog"
              aria-modal="true"
              aria-label="เลือกรอบบัญชี"
              onClick={(e) => e.stopPropagation()}
            >
              <header>
                <h2>✦ เลือกรอบเดือน</h2>
                <button aria-label="ปิดตัวเลือกรอบบัญชี" onClick={dismiss}>
                  ×
                </button>
              </header>
              <div className="month-year">
                <button aria-label="ปีก่อน" onClick={() => setYear((y) => y - 1)}>
                  ‹
                </button>
                <b>พ.ศ. {year + 543}</b>
                <button
                  aria-label="ปีถัดไป"
                  onClick={() => setYear((y) => y + 1)}
                >
                  ›
                </button>
              </div>
              <p className="month-help">
                แตะเพื่อเลือก · กดค้างหรือกด ✎ เพื่อแก้ช่วงวันที่
              </p>
              <div className="month-preset-grid">
                {months.map((p, i) => (
                  <MonthTile
                    key={year + "-" + i}
                    period={p}
                    month={i}
                    selected={p.id === selected.id}
                    choose={() => void choose(p)}
                    edit={() => editMonth(p)}
                  />
                ))}
              </div>
              {!!other.length && (
                <details>
                  <summary>รอบกำหนดเองและรอบอื่น ๆ ({other.length})</summary>
                  <div className="period-manager-list">
                    {other.map((p) => (
                      <article key={p.id}>
                        <button onClick={() => void choose(p)}>
                          <b>{p.name}</b>
                          <small>
                            {thaiDate(p.start, true)} — {thaiDate(p.end, true)}
                          </small>
                        </button>
                        <button
                          aria-label={"แก้ไข " + p.name}
                          onClick={() => editMonth(p)}
                        >
                          ✎
                        </button>
                      </article>
                    ))}
                  </div>
                </details>
              )}
              {error && <p role="alert">{error}</p>}
              <button
                className="manual-period-name"
                onClick={() => {
                  setOpen(false);
                  add();
                }}
              >
                ＋ ระบุรอบใหม่
              </button>
            </section>
          </div>,
          overlayHost(),
        )}
    </>
  );
}
