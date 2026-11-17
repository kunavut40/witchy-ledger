import type { State } from "./domain";
import type { QuickConfig } from "./QuickSettings";
import { useEffect, useRef, useState } from "react";
import {
  Coffee,
  Fuel,
  Wallet,
  Briefcase,
  MoreHorizontal,
  ArrowDownLeft,
  ArrowUpRight,
  X,
} from "lucide-react";
import { menuSound } from "./fantasy/sound";
const shortcuts = {
  income: [
    ["income-0", "เงินเดือน", Briefcase],
    ["income-3", "เบี้ยเลี้ยง", Wallet],
    ["income-5", "อื่น ๆ", MoreHorizontal],
  ],
  expense: [
    ["food-1", "กาแฟ", Coffee],
    ["travel-0", "น้ำมัน", Fuel],
    ["other", "อื่น ๆ", MoreHorizontal],
  ],
} as const;
type Kind = keyof typeof shortcuts;
export default function QuickMenu({
  choose,
  close,
  muted = false,
  config,
  categories,
}: {
  config: QuickConfig;
  categories: State["categories"];
  choose: (k: Kind, id: string, amount?: number) => void;
  close: () => void;
  muted?: boolean;
}) {
  const [kind, setKind] = useState<Kind | null>(null);
  const [cat, setCat] = useState("");
  const [hover, setHover] = useState("");
  const [exiting, setExiting] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const held = useRef(false);
  const lastHover = useRef("");
  useEffect(
    () => () => {
      clearTimeout(timer.current);
      clearTimeout(exitTimer.current);
    },
    [],
  );
  function dismiss() {
    setExiting(true);
    exitTimer.current = setTimeout(close, 180);
  }
  function finish(k: Kind, id: string, amount?: number) {
    menuSound("equip", muted);
    choose(k, id, amount);
  }
  const prices =
    cat === "food-1" ? config.coffee : cat === "travel-0" ? config.fuel : [];
  return (
    <div
      className={"quick-add-scrim" + (exiting ? " exiting" : "")}
      onClick={dismiss}
    >
      <section
        className="quick-add-options upward"
        role="dialog"
        aria-modal="true"
        aria-label="เพิ่มรายการ กดค้างแล้วลากขึ้น"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="quick-hint">กดค้าง แล้วลากขึ้นเพื่อเลือก</p>
        {kind && (
          <div className="fan-row">
            {config[kind].map((id, index) => {
              const label = categories.find((c) => c.id === id)?.name || "อื่น ๆ";
              const Icon = shortcuts[kind][index][2];
              return (
                <button
                  key={id}
                  className={cat === id ? "hovered" : ""}
                  data-cat={id}
                  onClick={() => {
                    setCat(id);
                    if (
                      kind === "income" ||
                      !["food-1", "travel-0"].includes(id)
                    )
                      finish(kind, id);
                  }}
                >
                  <Icon />
                  {label}
                </button>
              );
            })}
          </div>
        )}
        {kind && prices.length > 0 && (
          <div className="fan-row price-row">
            {[...prices, 0].map((p) => (
              <button
                key={p}
                className={hover === "price-" + p ? "hovered" : ""}
                data-price={p}
                onClick={() => finish(kind, cat, p || undefined)}
              >
                {p || "ระบุ"}
              </button>
            ))}
          </div>
        )}
        {(["income", "expense"] as const).map((k) => (
          <button
            key={k}
            className={"quick-" + k + (kind === k ? " selected" : "")}
            onPointerDown={(e) => {
              menuSound("select", muted);
              e.currentTarget.setPointerCapture(e.pointerId);
              held.current = false;
              timer.current = setTimeout(() => {
                held.current = true;
                setKind(k);
                setCat("");
                menuSound("character", muted);
              }, 300);
            }}
            onPointerMove={(e) => {
              if (!held.current) return;
              const el = document
                .elementFromPoint(e.clientX, e.clientY)
                ?.closest<HTMLElement>("button");
              const id = el?.dataset.cat;
              const price = el?.dataset.price;
              const next = id || (price !== undefined ? "price-" + price : "");
              if (id) setCat(id);
              setHover(next);
              if (next && next !== lastHover.current)
                menuSound("select", muted);
              lastHover.current = next;
            }}
            onPointerCancel={() => {
              clearTimeout(timer.current);
              held.current = false;
              setHover("");
            }}
            onPointerUp={(e) => {
              clearTimeout(timer.current);
              if (!held.current) return;
              const el = document
                .elementFromPoint(e.clientX, e.clientY)
                ?.closest<HTMLElement>("button");
              if (el?.dataset.price !== undefined)
                finish(k, cat, Number(el.dataset.price) || undefined);
              else if (
                el?.dataset.cat &&
                (k === "income" ||
                  !["food-1", "travel-0"].includes(el.dataset.cat))
              )
                finish(k, el.dataset.cat);
            }}
            onClick={() => {
              if (!held.current) finish(k, "");
              held.current = false;
            }}
          >
            {k === "income" ? <ArrowDownLeft /> : <ArrowUpRight />}
            {k === "income" ? "รายรับ" : "รายจ่าย"}
          </button>
        ))}
        <button className="quick-cancel" aria-label="ยกเลิก" onClick={dismiss}>
          <X />
        </button>
      </section>
    </div>
  );
}
