import {useExitMotion} from "./motion";
import {isSelectableDate} from "./calendarBounds";
import {useOverlay,overlayHost} from "./ui/SharedBackdrop";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { db } from "./db";
import { palettes } from "./Palette";
import type { State } from "./domain";
import { today } from "./domain";
import { isoDay, monthCells } from "./calendar";
import { menuSound } from "./fantasy/sound";
import { readFantasy } from "./fantasy/Fantasy";
export function CalendarThemes({ s }: { s: State }) {
  const theme =
    s.settings.find((x) => x.id === "appearance.calendar")?.value ||
    s.settings.find((x) => x.id === "appearance.palette")?.value ||
    "lavender";
  const [error, setError] = useState("");
  return (
    <label className="calendar-theme-setting">
      ธีมปฏิทิน
      <select
        aria-label="ธีมปฏิทิน"
        value={theme}
        onChange={(e) => {
          void db.settings
            .put({ id: "appearance.calendar", value: e.target.value })
            .catch(() => setError("บันทึกธีมไม่สำเร็จ"));
        }}
      >
        {palettes.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      {error && <small role="alert">{error}</small>}
    </label>
  );
}
export default function MagicDatePicker({
  name = "date",
  initial,
  s,
  value:controlled,onChange,min,max,label,allowClear=false,
}: {
  name?: string;
  initial: string;
  s: State;
  value?:string;onChange?:(date:string)=>void;min?:string;max?:string;label?:string;allowClear?:boolean;
}) {
  const [internal, setValue] = useState(initial),
    [open, setOpen] = useState(false),
    [pick, setPick] = useState(initial);
  const [view, setView] = useState(() => ({
    year: Number((initial||today()).slice(0, 4)),
    month: Number((initial||today()).slice(5, 7)) - 1,
  }));
  useOverlay(open,500);
  const value=controlled ?? internal;
  const trigger = useRef<HTMLButtonElement>(null),
    last = useRef({ date: "", time: 0 });
  const theme =
    s.settings.find((x) => x.id === "appearance.calendar")?.value ||
    s.settings.find((x) => x.id === "appearance.palette")?.value ||
    "lavender";
  const sound = () => menuSound("select", readFantasy(s).muted);
  const exitMotion=useExitMotion(()=>{setOpen(false);trigger.current?.focus()},readFantasy(s).muted);
  const close=exitMotion.dismiss;
  function confirm(date: string) {
    if(!isSelectableDate(date,min,max))return;
    setValue(date);onChange?.(date);
    sound();
    close();
  }
  useEffect(() => {
    if (!open) return;
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopImmediatePropagation();
        close();
      }
    };
    const back = (e: Event) => {
      e.preventDefault();
      close();
    };
    document.addEventListener("witchy-overlay-back", back);
    window.addEventListener("keydown", escape, true);
    return () => {
      window.removeEventListener("keydown", escape, true);
      document.removeEventListener("witchy-overlay-back", back);
    };
  }, [open]);
  function move(n: number) {
    const d = new Date(view.year, view.month + n, 1, 12);
    setView({ year: d.getFullYear(), month: d.getMonth() });
    sound();
  }
  return (
    <>
      <input type="hidden" name={name} value={value} />
      <button
        ref={trigger}
        type="button"
        className="magic-date-trigger"
        aria-label={label}
        onClick={() => {
          setPick(value||today());
          setView({
            year: Number((value||today()).slice(0, 4)),
            month: Number((value||today()).slice(5, 7)) - 1,
          });
          last.current = { date: "", time: 0 };
          setOpen(true);
          sound();
        }}
      >
        ☾{" "}
        {value?new Date(value + "T12:00").toLocaleDateString("th-TH", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }):"เลือกวันที่"}{" "}
        <span>✧</span>
      </button>
      {open &&
        createPortal(
          <div
            className={"magic-calendar-overlay motion-surface "+(exitMotion.leaving?"motion-leaving":"")}
            onPointerDown={(e) => {
              if (e.target === e.currentTarget) close();
            }}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-label="ปฏิทินเวทมนตร์"
              className="magic-calendar"
              data-calendar-theme={theme}
            >
              <header>
                <div>
                  <small>✧ บันทึกแห่งกาลเวลา ✧</small>
                  <h3>
                    {new Date(pick + "T12:00").toLocaleDateString("th-TH", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </h3>
                </div>
                <button type="button" aria-label="ปิดปฏิทิน" onClick={close}>
                  ×
                </button>
              </header>
              <div className="calendar-month">
                <button
                  type="button"
                  aria-label="เดือนก่อน"
                  onClick={() => move(-1)}
                >
                  ‹
                </button>
                <b>
                  {new Date(view.year, view.month, 1).toLocaleDateString(
                    "th-TH",
                    { month: "long" },
                  )}
                </b>
                <select
                  aria-label="ปีปฏิทิน"
                  value={view.year}
                  onChange={(e) =>
                    setView({ ...view, year: Number(e.target.value) })
                  }
                >
                  {Array.from({ length: 201 }, (_, i) => 1900 + i).map((y) => (
                    <option key={y} value={y}>
                      {y + 543}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  aria-label="เดือนถัดไป"
                  onClick={() => move(1)}
                >
                  ›
                </button>
              </div>
              <div className="calendar-days">
                {["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."].map((d) => (
                  <small key={d}>{d}</small>
                ))}
                {monthCells(view.year, view.month).map((d, i) =>
                  d === null ? (
                    <span key={"blank" + i} />
                  ) : (
                    <button
                      key={d}
                      type="button"
                      disabled={!isSelectableDate(isoDay(view.year,view.month,d),min,max)}
                      aria-label={isoDay(view.year, view.month, d)}
                      aria-pressed={pick === isoDay(view.year, view.month, d)}
                      aria-current={
                        today() === isoDay(view.year, view.month, d)
                          ? "date"
                          : undefined
                      }
                      onClick={() => {
                        const date = isoDay(view.year, view.month, d),
                          time = Date.now();
                        setPick(date);
                        sound();
                        if (
                          last.current.date === date &&
                          time - last.current.time < 450
                        )
                          confirm(date);
                        last.current = { date, time };
                      }}
                    >
                      {d}
                    </button>
                  ),
                )}
              </div>
              <p className="calendar-help">แตะสองครั้งที่วันเพื่อเลือกทันที</p>
              <CalendarThemes s={s} />
              {allowClear&&<button type="button" onClick={()=>{setValue("");onChange?.("");close()}}>ล้างวันที่</button>}
              <footer>
                <button
                  type="button"
                  onClick={() => {
                    setPick(today());
                    setView({
                      year: new Date().getFullYear(),
                      month: new Date().getMonth(),
                    });
                  }}
                >
                  วันนี้
                </button>
                <button type="button" onClick={close}>
                  ยกเลิก
                </button>
                <button
                  type="button"
                  className="primary"
                  disabled={!isSelectableDate(pick,min,max)}
                  onClick={() => confirm(pick)}
                >
                  เลือกวันที่
                </button>
              </footer>
            </section>
          </div>,
          overlayHost(),
        )}
    </>
  );
}
