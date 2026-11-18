import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { State } from "./domain";
import Pixel, { categoryIcon } from "./Pixel";
import { menuSound } from "./fantasy/sound";
import { readFantasy } from "./fantasy/Fantasy";
export default function EntryCategories({
  s,
  kind,
  main,
  sub,
  change,
}: {
  s: State;
  kind: string;
  main: string;
  sub: string;
  change: (m: string, c: string) => void;
}) {
  const [expanded, setExpanded] = useState(false),
    [orbit, setOrbit] = useState(false),
    [leaving, setLeaving] = useState(false),
    [hover, setHover] = useState(""),
    [page, setPage] = useState(0);
  const hold = useRef<ReturnType<typeof setTimeout> | undefined>(undefined),
    exit = useRef<ReturnType<typeof setTimeout> | undefined>(undefined),
    held = useRef(false),
    trigger = useRef<HTMLButtonElement>(null);
  const parent = s.categories.find((c) => c.id === main);
  const children = s.categories.filter(
    (c) =>
      c.parentId === main && (!c.archived || c.id === sub) && c.kind === kind,
  );
  const choices = children.slice(page * 5, page * 5 + 5);
  const sound = (type = "select") => menuSound(type, readFantasy(s).muted);
  useEffect(
    () => () => {
      clearTimeout(hold.current);
      clearTimeout(exit.current);
    },
    [],
  );
  function dismiss() {
    setLeaving(true);
    exit.current = setTimeout(() => {
      setOrbit(false);
      setLeaving(false);
      setHover("");
      trigger.current?.focus();
    }, 180);
  }
  useEffect(() => {
    if (!orbit) return;
    const back = (e: Event) => {
      e.preventDefault();
      dismiss();
    };
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopImmediatePropagation();
        dismiss();
      }
    };
    document.addEventListener("witchy-overlay-back", back);
    window.addEventListener("keydown", escape, true);
    return () => {
      document.removeEventListener("witchy-overlay-back", back);
      window.removeEventListener("keydown", escape, true);
    };
  }, [orbit]);
  function select(id: string) {
    if (id === "__back") {
      sound();
      dismiss();
      return;
    }
    if (id !== "__main" && !children.some((c) => c.id === id)) return;
    change(main, id === "__main" ? "" : id);
    sound("equip");
    dismiss();
  }
  function openOrbit() {
    if (!main) {
      setExpanded(true);
      return;
    }
    setPage(0);
    setOrbit(true);
    setLeaving(false);
    sound("character");
  }
  function release(e: React.PointerEvent) {
    clearTimeout(hold.current);
    if (!held.current) return;
    const id = document
      .elementFromPoint(e.clientX, e.clientY)
      ?.closest<HTMLElement>("[data-sub]")?.dataset.sub;
    if (id) select(id);
  }
  return (
    <div className="entry-categories">
      <label>✧ หมวดหลัก · กดค้างเพื่อเลือกหมวดย่อย</label>
      <button
        ref={trigger}
        type="button"
        className="entry-parent enchanted-control"
        onPointerDown={(e) => {
          held.current = false;
          e.currentTarget.setPointerCapture(e.pointerId);
          hold.current = setTimeout(() => {
            held.current = true;
            openOrbit();
          }, 320);
        }}
        onPointerMove={(e) => {
          if (!held.current || !orbit) return;
          const id =
            document
              .elementFromPoint(e.clientX, e.clientY)
              ?.closest<HTMLElement>("[data-sub]")?.dataset.sub || "";
          if (id !== hover) {
            setHover(id);
            if (id) sound();
          }
        }}
        onPointerUp={release}
        onPointerCancel={() => {
          clearTimeout(hold.current);
          if (orbit) dismiss();
        }}
        onClick={() => {
          if (held.current) {
            held.current = false;
            return;
          }
          setExpanded(!expanded);
          sound();
        }}
      >
        <Pixel name={categoryIcon(parent)} size={46} />
        <span>{parent?.name || "เลือกหมวดหลัก"}</span>
        <small>⇄</small>
      </button>
      {expanded && (
        <div className="entry-orbits main-orbits">
          {s.categories
            .filter(
              (c) =>
                !c.parentId &&
                c.kind === kind &&
                (!c.archived || c.id === main),
            )
            .map((c) => (
              <button
                key={c.id}
                type="button"
                aria-label={c.name}
                onClick={() => {
                  change(c.id, "");
                  setExpanded(false);
                  sound("character");
                }}
              >
                <Pixel name={categoryIcon(c)} size={58} />
                <span>{c.name}</span>
              </button>
            ))}
        </div>
      )}
      <label>✧ หมวดย่อย</label>
      <div className="entry-orbits">
        {children.map((c) => (
          <button
            type="button"
            key={c.id}
            aria-label={c.name}
            className={sub === c.id ? "selected" : ""}
            onClick={() => {
              change(main, c.id);
              sound();
            }}
          >
            <Pixel name={categoryIcon(c)} size={58} />
            <span>{c.name}</span>
          </button>
        ))}
        {main && (
          <button
            type="button"
            className={!sub ? "selected" : ""}
            onClick={() => {
              change(main, "");
              sound();
            }}
          >
            <Pixel name={categoryIcon(parent)} size={58} />
            <span>ใช้หมวดหลัก</span>
          </button>
        )}
      </div>
      {orbit &&
        createPortal(
          <div
            className={"category-orbit-overlay " + (leaving ? "leaving" : "")}
            role="dialog"
            aria-modal="true"
            aria-label="ลากเลือกหมวดย่อย"
          >
            <header>
              <b>✧ ลากไปยังหมวดย่อย แล้วปล่อยเพื่อเลือก</b>
              <button type="button" aria-label="ปิดวงหมวดย่อย" onClick={dismiss}>
                ×
              </button>
            </header>
            <div className="category-orbit-stage">
              <div className="category-orbit-center">
                <Pixel name={categoryIcon(parent)} size={62} />
                <span>{parent?.name}</span>
              </div>
              {[
                ...choices,
                {
                  id: "__back",
                  name: "ย้อนกลับ",
                  icon: parent?.icon || "book",
                },
              ].map((c, i, all) => {
                const angle =
                  c.id === "__back"
                    ? Math.PI / 2
                    : (-Math.PI * 7) / 6 +
                      (i * ((Math.PI * 4) / 3)) /
                        Math.max(1, choices.length - 1);
                return (
                  <button
                    key={c.id}
                    type="button"
                    data-sub={c.id}
                    aria-label={c.name}
                    className={
                      "category-orbit-choice " +
                      (hover === c.id ? "hovered" : "")
                    }
                    style={{
                      left: 50 + Math.cos(angle) * 33.53 + "%",
                      top: 50 + Math.sin(angle) * 33.53 + "%",
                    }}
                    onClick={() => select(c.id)}
                  >
                    {c.id === "__back" ? (
                      <b className="orbit-back-icon">↩</b>
                    ) : (
                      <Pixel name={categoryIcon(c)} size={58} />
                    )}
                    <span>{c.name}</span>
                  </button>
                );
              })}
            </div>
            {children.length > 5 && (
              <div className="orbit-pages">
                <button
                  type="button"
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                >
                  ‹
                </button>
                <span>
                  {page + 1}/{Math.ceil(children.length / 5)}
                </span>
                <button
                  type="button"
                  disabled={(page + 1) * 5 >= children.length}
                  onClick={() => setPage(page + 1)}
                >
                  ›
                </button>
              </div>
            )}
            <small>แตะวงเพื่อเลือกได้เช่นกัน</small>
          </div>,
          document.body,
        )}
    </div>
  );
}
