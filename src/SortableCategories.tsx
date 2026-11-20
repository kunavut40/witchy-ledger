import { useEffect, useRef, useState } from "react";
import type { Category } from "./domain";
import { moveItem, reorderCategories } from "./categoryOrder";
import Pixel, { categoryIcon } from "./Pixel";
import { menuSound } from "./fantasy/sound";
export default function SortableCategories({
  items,
  selected,
  onChoose,
  muted = false,
  extra,
}: {
  items: Category[];
  selected: string;
  onChoose: (c: Category) => void;
  muted?: boolean;
  extra?: React.ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null),
    timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined),
    gesture = useRef({
      source: "",
      target: "",
      held: false,
      moved: false,
      x: 0,
      y: 0,
      pointer: -1,
    });
  const [drag, setDrag] = useState(""),
    [preview, setPreview] = useState<string[] | null>(null),
    [error, setError] = useState("");
  const suppress = useRef(false);
  const ordered = items
    .slice()
    .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
  const shown = preview
    ? preview
        .map((id) => items.find((c) => c.id === id))
        .filter((c): c is Category => !!c)
    : ordered;
  const clear = () => {
    clearTimeout(timer.current);
    setDrag("");
    setPreview(null);
  };
  useEffect(() => () => clearTimeout(timer.current), []);
  const scrollSurface = () => {
    let p = root.current?.parentElement;
    while (p) {
      if (
        /auto|scroll/.test(getComputedStyle(p).overflowY) &&
        p.scrollHeight > p.clientHeight
      )
        return p;
      p = p.parentElement;
    }
    return document.scrollingElement;
  };
  const finish = (cancel = false) => {
    clearTimeout(timer.current);
    const g = gesture.current;
    suppress.current = g.held || g.moved;
    if (g.held && !cancel && g.source !== g.target)
      void reorderCategories(g.source, g.target).then(
        () => menuSound("equip", muted),
        () => setError("จัดลำดับไม่สำเร็จ กรุณาลองใหม่"),
      );
    gesture.current = { ...g, held: false, source: "", target: "" };
    clear();
  };
  useEffect(() => {
    const cancel = () => {
      if (document.hidden) finish(true);
    };
    document.addEventListener("visibilitychange", cancel);
    return () => document.removeEventListener("visibilitychange", cancel);
  }, []);
  return (
    <>
      <small className="sort-help">
        กดค้างแล้วลากเพื่อจัดเรียง · Alt + ลูกศร เพื่อย้ายด้วยคีย์บอร์ด
      </small>
      <div
        ref={root}
        className="entry-orbits sortable-categories"
        data-dragging={!!drag}
      >
        {shown.map((c) => (
          <button
            key={c.id}
            type="button"
            aria-label={c.name}
            aria-pressed={selected === c.id}
            data-sort-id={c.id}
            className={
              (selected === c.id ? "selected " : "") +
              (drag === c.id ? "sorting" : "")
            }
            onContextMenu={(e) => e.preventDefault()}
            onPointerDown={(e) => {
              if (e.button !== 0) return;
              clearTimeout(timer.current);
              suppress.current = false;
              gesture.current = {
                source: c.id,
                target: c.id,
                held: false,
                moved: false,
                x: e.clientX,
                y: e.clientY,
                pointer: e.pointerId,
              };
              e.currentTarget.setPointerCapture(e.pointerId);
              timer.current = setTimeout(() => {
                gesture.current.held = true;
                setDrag(c.id);
                setPreview(ordered.map((x) => x.id));
                menuSound("character", muted);
              }, 420);
            }}
            onPointerMove={(e) => {
              const g = gesture.current;
              if (g.source !== c.id || g.pointer !== e.pointerId) return;
              if (!g.held) {
                const dy = g.y - e.clientY;
                if (
                  Math.hypot(e.clientX - g.x, e.clientY - g.y) > 9 ||
                  g.moved
                ) {
                  clearTimeout(timer.current);
                  g.moved = true;
                  const surface = scrollSurface();
                  if (surface) surface.scrollTop += dy;
                  g.x = e.clientX;
                  g.y = e.clientY;
                }
                return;
              }
              e.preventDefault();
              const over = document
                .elementFromPoint(e.clientX, e.clientY)
                ?.closest<HTMLElement>("[data-sort-id]");
              if (
                over &&
                root.current?.contains(over) &&
                over.dataset.sortId &&
                over.dataset.sortId !== g.target
              ) {
                g.target = over.dataset.sortId;
                setPreview((old) => {
                  const ids = old || ordered.map((x) => x.id);
                  return moveItem(
                    ids,
                    ids.indexOf(g.source),
                    ids.indexOf(g.target),
                  );
                });
              }
            }}
            onPointerUp={() => finish()}
            onPointerCancel={() => finish(true)}
            onKeyDown={(e) => {
              if (
                !e.altKey ||
                !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(
                  e.key,
                )
              )
                return;
              e.preventDefault();
              const step =
                e.key === "ArrowUp"
                  ? -3
                  : e.key === "ArrowDown"
                    ? 3
                    : e.key === "ArrowLeft"
                      ? -1
                      : 1;
              const target =
                ordered[ordered.findIndex((x) => x.id === c.id) + step];
              if (target)
                void reorderCategories(c.id, target.id).catch(() =>
                  setError("จัดลำดับไม่สำเร็จ"),
                );
            }}
            onClick={() => {
              if (suppress.current) {
                suppress.current = false;
                return;
              }
              onChoose(c);
            }}
          >
            <Pixel name={categoryIcon(c)} size={58} />
            <span>{c.name}</span>
          </button>
        ))}
        {extra}
      </div>
      {error && <p role="alert">{error}</p>}
    </>
  );
}
