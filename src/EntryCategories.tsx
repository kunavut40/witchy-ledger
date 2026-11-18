import { useState } from "react";
import type { State } from "./domain";
import Pixel from "./Pixel";
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
  const [expanded, setExpanded] = useState(false);
  const parent = s.categories.find((c) => c.id === main);
  const children = s.categories.filter(
    (c) =>
      c.parentId === main && (!c.archived || c.id === sub) && c.kind === kind,
  );
  return (
    <div className="entry-categories">
      <label>✧ หมวดหลัก</label>
      <button
        type="button"
        className="entry-parent"
        onClick={() => setExpanded(!expanded)}
      >
        <Pixel name={parent?.icon || "book"} size={30} />
        {parent?.name || "เลือกหมวดหลัก"} ⇄
      </button>
      {expanded && (
        <div className="entry-orbits">
          {s.categories
            .filter(
              (c) =>
                !c.parentId &&
                c.kind === kind &&
                (!c.archived || c.id === main),
            )
            .map((c) => (
              <button
                type="button"
                key={c.id}
                onClick={() => {
                  change(c.id, "");
                  setExpanded(false);
                }}
              >
                <Pixel name={c.icon} size={28} />
                {c.name}
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
            className={sub === c.id ? "selected" : ""}
            onClick={() => change(main, c.id)}
          >
            <Pixel name={c.icon} size={30} />
            {c.name}
          </button>
        ))}
        {main && (
          <button
            type="button"
            className={!sub ? "selected" : ""}
            onClick={() => change(main, "")}
          >
            <Pixel name={parent?.icon} size={28} />
            ใช้หมวดหลัก
          </button>
        )}
      </div>
    </div>
  );
}
