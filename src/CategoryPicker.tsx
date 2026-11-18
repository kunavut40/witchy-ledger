import { useEffect, useState } from "react";
import type { State } from "./domain";
import Pixel from "./Pixel";
export default function CategoryPicker({
  categories,
  kind,
  main,
  sub,
  onChange,
  onAdd,
}: {
  categories: State["categories"];
  kind: string;
  main: string;
  sub: string;
  onChange: (main: string, sub: string) => void;
  onAdd: () => void;
}) {
  const [stage, setStage] = useState<"main" | "sub" | null>(null);
  useEffect(() => {
    if (!stage) return;
    const back = (event: Event) => {
      event.preventDefault();
      setStage(null);
    };
    document.addEventListener("witchy-picker-back", back);
    return () => document.removeEventListener("witchy-picker-back", back);
  }, [stage]);
  const mainCategory = categories.find((c) => c.id === main);
  const subCategory = categories.find(
    (c) => c.id === sub && c.parentId === main,
  );
  const choices = categories.filter(
    (c) =>
      !c.archived &&
      c.kind === kind &&
      (stage === "main" ? !c.parentId : c.parentId === main),
  );
  return (
    <div className="category-selector">
      <div className="category-triggers">
        {[
          ["หมวดหลัก", mainCategory, "main"],
          ["หมวดย่อย", subCategory, "sub"],
        ].map(([label, c, step]) => (
          <div key={label as string}>
            <small>{label as string}</small>
            <button
              type="button"
              className="category-orb"
              onClick={() => setStage(step === "sub" && main ? "sub" : "main")}
            >
              <Pixel
                name={typeof c === "object" ? c?.icon : "book"}
                size={28}
              />
              <span>
                {typeof c === "object" ? c?.name || "เลือกหมวด" : "เลือกหมวด"}
              </span>
            </button>
          </div>
        ))}
      </div>
      {stage && (
        <div
          className="category-picker"
          role="dialog"
          aria-label={stage === "main" ? "เลือกหมวดหลัก" : "เลือกหมวดย่อย"}
        >
          <div className="spread">
            <b>
              {stage === "main"
                ? "เลือกหมวดหลัก"
                : mainCategory?.name + " · หมวดย่อย"}
            </b>
            <button
              type="button"
              aria-label="ปิดเลือกหมวด"
              onClick={() => setStage(null)}
            >
              ×
            </button>
          </div>
          <div className="category-orbits" key={stage + main}>
            {choices.map((c) => (
              <button
                className="category-orb"
                key={c.id}
                type="button"
                onClick={() => {
                  if (stage === "main") {
                    onChange(c.id, "");
                    setStage("sub");
                  } else {
                    onChange(main, c.id);
                    setStage(null);
                  }
                }}
              >
                <Pixel name={c.icon} size={32} />
                <span>{c.name}</span>
              </button>
            ))}
            {stage === "sub" && (
              <button
                type="button"
                className="category-orb"
                onClick={() => {
                  onChange(main, "");
                  setStage(null);
                }}
              >
                ✓<span>ใช้หมวดหลัก</span>
              </button>
            )}
            <button type="button" className="category-orb" onClick={onAdd}>
              ＋<span>เพิ่มหมวด</span>
            </button>
          </div>
          {stage === "sub" && (
            <button type="button" onClick={() => setStage("main")}>
              กลับหมวดหลัก
            </button>
          )}
        </div>
      )}
      {!main && <small className="muted">เลือกหมวดก่อนบันทึก</small>}
    </div>
  );
}
