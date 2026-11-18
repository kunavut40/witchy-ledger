import { useEffect, useRef, useState } from "react";
import type { State } from "./domain";
import Pixel from "./Pixel";
import { db } from "./db";
import { menuSound } from "./fantasy/sound";
export type QuickChoice = { id: string; prices: number[] };
export type QuickPreferences = {
  income: QuickChoice[];
  expense: QuickChoice[];
  account: string;
};
export function readRadial(s: State): QuickPreferences {
  let raw: Partial<QuickPreferences> = {};
  try {
    raw =
      JSON.parse(
        s.settings.find((x) => x.id === "radial.preferences")?.value || "{}",
      ) || {};
  } catch {}
  const slots = (kind: "income" | "expense") =>
    Array.from({ length: 3 }, (_, i) => {
      const defaults =
        kind === "income"
          ? ["income-0", "income-3", "income-5"]
          : ["food-1", "travel-0", "other"];
      const candidates = s.categories.filter(
        (c) => !c.archived && c.kind === kind,
      );
      const saved = Array.isArray(raw[kind]) ? raw[kind]![i] : undefined;
      const id =
        candidates.find((c) => c.id === saved?.id)?.id ||
        candidates.find((c) => c.id === defaults[i])?.id ||
        candidates[i]?.id ||
        "";
      const fallback = i === 0 ? [20, 25] : i === 1 ? [120, 500] : [];
      return {
        id,
        prices: Array.isArray(saved?.prices)
          ? saved.prices
              .filter((n) => Number.isFinite(n) && n > 0 && n <= 1000000)
              .slice(0, 2)
          : kind === "expense"
            ? fallback
            : [],
      };
    });
  return {
    income: slots("income"),
    expense: slots("expense"),
    account:
      s.accounts.find((a) => a.active && a.id === raw.account)?.id ||
      s.accounts.find((a) => a.active && a.kind === "bank")?.id ||
      s.accounts.find((a) => a.active)?.id ||
      "",
  };
}
export default function RadialEntry({
  s,
  close,
  choose,
  muted,
}: {
  s: State;
  close: () => void;
  choose: (
    kind: "income" | "expense",
    category: string,
    account: string,
    amount?: number,
  ) => void;
  muted: boolean;
}) {
  const [kind, setKind] = useState<"income" | "expense" | null>(null),
    [slot, setSlot] = useState<number | null>(null),
    [settings, setSettings] = useState(false),
    [leaving, setLeaving] = useState(false),
    [error, setError] = useState("");
  const [prefs, setPrefs] = useState(() => readRadial(s));
  const hold = useRef<ReturnType<typeof setTimeout> | undefined>(undefined),
    held = useRef(false),
    exit = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(
    () => () => {
      clearTimeout(hold.current);
      clearTimeout(exit.current);
    },
    [],
  );
  function dismiss() {
    setLeaving(true);
    exit.current = setTimeout(close, 180);
  }
  function select(k: "income" | "expense") {
    setKind(k);
    setSlot(null);
  }
  function pick(k: "income" | "expense", i: number) {
    const item = prefs[k][i];
    if (!item.id) {
      setError("เลือกหมวดในตั้งค่าก่อน");
      return;
    }
    if (k === "expense" && item.prices.length) {
      setSlot(i);
    } else choose(k, item.id, prefs.account);
  }
  const selected = kind && slot !== null ? prefs[kind][slot] : null;
  return (
    <div
      className={"radial-scrim " + (leaving ? "leaving" : "")}
      role="dialog"
      aria-modal="true"
      aria-label="เมนูบันทึกวงกลม"
    >
      <button className="radial-heading" onClick={() => setSettings(!settings)}>
        ✧{" "}
        {settings
          ? "ตั้งค่าวงกลม"
          : selected
            ? "เลือกราคาเพื่อบันทึก"
            : "เลือกหมวด แล้วระบุจำนวนเงิน"}{" "}
        ⚙
      </button>
      {settings ? (
        <section className="radial-settings card">
          <h3>หมวดและราคาที่ใช้บ่อย</h3>
          <label>
            บัญชีสำหรับบันทึกด่วน
            <select
              value={prefs.account}
              onChange={(e) => setPrefs({ ...prefs, account: e.target.value })}
            >
              {s.accounts
                .filter((a) => a.active)
                .map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
            </select>
          </label>
          {(["income", "expense"] as const).map((k) => (
            <div key={k}>
              <h4>{k === "income" ? "รายรับ" : "รายจ่าย"}</h4>
              {prefs[k].map((item, i) => (
                <div className="quick-setting-row" key={i}>
                  <select
                    aria-label={k + " หมวด " + (i + 1)}
                    value={item.id}
                    onChange={(e) =>
                      setPrefs({
                        ...prefs,
                        [k]: prefs[k].map((v, j) =>
                          j === i ? { ...v, id: e.target.value } : v,
                        ),
                      })
                    }
                  >
                    <option value="">เลือกหมวด</option>
                    {s.categories
                      .filter((c) => !c.archived && c.kind === k)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                  {k === "expense" &&
                    [0, 1].map((n) => (
                      <input
                        key={n}
                        aria-label={"ราคา " + (n + 1) + " หมวด " + (i + 1)}
                        type="number"
                        min="0"
                        max="1000000"
                        step="0.01"
                        value={item.prices[n] ?? ""}
                        onChange={(e) => {
                          const prices = [...item.prices];
                          prices[n] = Number(e.target.value);
                          setPrefs({
                            ...prefs,
                            [k]: prefs[k].map((v, j) =>
                              i === j ? { ...v, prices } : v,
                            ),
                          });
                        }}
                      />
                    ))}
                </div>
              ))}
            </div>
          ))}
          <button
            className="primary"
            onClick={async () => {
              try {
                await db.settings.put({
                  id: "radial.preferences",
                  value: JSON.stringify(prefs),
                });
                setSettings(false);
                setKind(null);
                setSlot(null);
                setError("");
              } catch {
                setError("บันทึกตั้งค่าไม่สำเร็จ");
              }
            }}
          >
            บันทึกตั้งค่า
          </button>
        </section>
      ) : (
        <section className={"radial-stage " + (kind || "")}>
          <svg
            viewBox="0 0 340 370"
            className="radial-lines"
            aria-hidden="true"
          >
            <path d="M170 300 Q35 285 55 155 M170 300 V110 M170 300 Q305 285 285 155" />
          </svg>
          {kind &&
            prefs[kind].map((item, i) => {
              const c = s.categories.find((c) => c.id === item.id);
              return (
                <button
                  key={i}
                  data-slot={i}
                  className={"radial-orb satellite satellite-" + i}
                  onClick={() =>
                    selected
                      ? choose(
                          kind,
                          selected.id,
                          prefs.account,
                          i < 2 ? selected.prices[i] : undefined,
                        )
                      : pick(kind, i)
                  }
                >
                  {selected ? (
                    i < 2 ? (
                      <strong>{selected.prices[i]}</strong>
                    ) : (
                      <strong>✎</strong>
                    )
                  ) : (
                    <Pixel name={c?.icon || "book"} size={38} />
                  )}
                  <span>
                    {selected ? (i < 2 ? "บาท" : "ระบุ") : c?.name || "เลือกหมวด"}
                  </span>
                </button>
              );
            })}
          <button
            className="radial-orb radial-main"
            onClick={() => (kind ? setSlot(null) : select("expense"))}
          >
            {selected ? (
              <Pixel
                name={
                  s.categories.find((c) => c.id === selected.id)?.icon || "tea"
                }
                size={42}
              />
            ) : (
              <strong>{kind === "income" ? "↓" : "↑"}</strong>
            )}
            <span>
              {selected
                ? s.categories.find((c) => c.id === selected.id)?.name
                : kind === "income"
                  ? "รายรับ"
                  : "รายจ่าย"}
            </span>
          </button>
          {(["income", "expense"] as const).map((k) => (
            <button
              key={k}
              className={"radial-orb kind-" + k + (kind === k ? " active" : "")}
              onPointerDown={() => {
                held.current = false;
                hold.current = setTimeout(() => {
                  held.current = true;
                  select(k);
                  menuSound("character", muted);
                }, 300);
              }}
              onPointerUp={() => clearTimeout(hold.current)}
              onPointerCancel={() => clearTimeout(hold.current)}
              onClick={() => {
                if (!held.current) select(k);
              }}
            >
              {k === "income" ? "↓ รายรับ" : "↑ รายจ่าย"}
            </button>
          ))}
          {selected && (
            <p className="radial-account">
              ชำระจาก{" "}
              {s.accounts.find((a) => a.id === prefs.account)?.name ||
                "กรุณาเลือกบัญชี"}
            </p>
          )}
        </section>
      )}
      {error && <p role="alert">{error}</p>}
      <button className="radial-close" aria-label="ปิดเมนูบันทึก" onClick={dismiss}>
        ×
      </button>
    </div>
  );
}
