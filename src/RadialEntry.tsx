import { useOverlay, overlayHost } from "./ui/SharedBackdrop";
import { useExitMotion } from "./motion";
import { useEffect, useRef, useState } from "react";
import type { State } from "./domain";
import Pixel, { iconLabels, icons, categoryIcon } from "./Pixel";
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
      return {
        id:
          candidates.find((c) => c.id === saved?.id)?.id ||
          candidates.find((c) => c.id === defaults[i])?.id ||
          candidates[i]?.id ||
          "",
        prices:
          i === 2 || kind === "income"
            ? []
            : Array.isArray(saved?.prices)
              ? saved.prices
                  .filter((n) => Number.isFinite(n) && n > 0 && n <= 1000000)
                  .slice(0, 2)
              : i === 0
                ? [20, 25]
                : [120, 500],
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
type Kind = "income" | "expense";
export default function RadialEntry({
  s,
  close,
  choose,
  muted,
}: {
  s: State;
  close: () => void;
  choose: (
    kind: Kind,
    category: string,
    account: string,
    amount?: number,
  ) => void;
  muted: boolean;
}) {
  useOverlay(true);
  const [kind, setKind] = useState<Kind | null>(null);
  const [slot, setSlot] = useState<number | null>(null);
  const [settings, setSettings] = useState(false);
  const { leaving, dismiss: dismissMotion } = useExitMotion(close, muted);
  const [error, setError] = useState("");
  const [prefs, setPrefs] = useState(() => readRadial(s));
  const [iconEdits, setIconEdits] = useState<Record<string, string>>({});
  const [hover, setHover] = useState("");
  const hold = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const exit = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const dwell = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const origin = useRef({ x: 0, y: 0, key: "", moved: false });
  const pressed = useRef(false),
    suppressed = useRef(false),
    committing = useRef(false);
  const gestureKind = useRef<Kind | null>(null),
    hovered = useRef("");
  const selected = kind !== null && slot !== null ? prefs[kind][slot] : null;
  useEffect(
    () => () => {
      clearTimeout(hold.current);
      clearTimeout(exit.current);
      clearTimeout(dwell.current);
    },
    [],
  );
  function dismiss() {
    clearTimeout(hold.current);
    clearTimeout(dwell.current);
    dismissMotion();
  }
  useEffect(() => {
    const back = (e: Event) => {
      e.preventDefault();
      dismiss();
    };
    document.addEventListener("witchy-radial-back", back);
    return () => document.removeEventListener("witchy-radial-back", back);
  }, [muted]);
  function select(k: Kind) {
    setKind(k);
    setSlot(null);
    setHover("");
    menuSound("character", muted);
  }
  function finish(k: Kind, item: QuickChoice, amount?: number) {
    if (committing.current) return;
    if (!item.id) {
      setError("เลือกหมวดในตั้งค่าก่อน");
      return;
    }
    if (!s.accounts.some((a) => a.active && a.id === prefs.account)) {
      setError("เลือกบัญชีที่ตั้งค่าก่อนบันทึก");
      return;
    }
    committing.current = true;
    menuSound("equip", muted);
    choose(k, item.id, prefs.account, amount);
    // The parent guards saving. Allow a retry if it reports a failure and keeps this menu open.
    exit.current = setTimeout(() => {
      committing.current = false;
    }, 800);
  }
  function pick(k: Kind, i: number) {
    const item = prefs[k][i];
    if (!item.id) {
      setError("เลือกหมวดในตั้งค่าก่อน");
      return;
    }
    menuSound("select", muted);
    if (k === "expense" && i < 2 && item.prices.length) {
      setSlot(i);
      setHover("");
    } else finish(k, item);
  }
  function begin(
    e: React.PointerEvent<HTMLButtonElement>,
    action: () => void,
    k: Kind,
  ) {
    clearTimeout(hold.current);
    clearTimeout(dwell.current);
    origin.current = {
      x: e.clientX,
      y: e.clientY,
      key: e.currentTarget.dataset.choice || "",
      moved: false,
    };
    pressed.current = true;
    suppressed.current = false;
    gestureKind.current = k;
    e.currentTarget.setPointerCapture(e.pointerId);
    menuSound("select", muted);
    hold.current = setTimeout(() => {
      suppressed.current = true;
      action();
    }, 300);
  }
  function move(e: React.PointerEvent) {
    if (!pressed.current) return;
    if (
      Math.hypot(e.clientX - origin.current.x, e.clientY - origin.current.y) >
      10
    )
      origin.current.moved = true;
    const el = document
      .elementFromPoint(e.clientX, e.clientY)
      ?.closest<HTMLElement>("[data-choice]");
    const key = el?.dataset.choice || "";
    if (key === hovered.current) return;
    hovered.current = key;
    setHover(key);
    clearTimeout(dwell.current);
    if (key) menuSound("select", muted);
    if (key.startsWith("cat:") && gestureKind.current) {
      const k = gestureKind.current,
        index = Number(key.split(":")[1]);
      dwell.current = setTimeout(() => {
        suppressed.current = true;
        if (k === "expense" && index < 2 && prefs[k][index].prices.length)
          setSlot(index);
      }, 240);
    }
  }
  function end(e: React.PointerEvent) {
    clearTimeout(hold.current);
    clearTimeout(dwell.current);
    if (!pressed.current) return;
    pressed.current = false;
    const key =
      document
        .elementFromPoint(e.clientX, e.clientY)
        ?.closest<HTMLElement>("[data-choice]")?.dataset.choice || "";
    if (!key || !gestureKind.current) return;
    suppressed.current = true;
    if (
      origin.current.key.startsWith("cat:") &&
      key.startsWith("price:") &&
      !origin.current.moved
    )
      return;
    if (key.startsWith("cat:"))
      pick(gestureKind.current, Number(key.split(":")[1]));
    else if (key.startsWith("price:") && selected)
      finish(
        gestureKind.current,
        selected,
        key === "price:manual" ? undefined : Number(key.split(":")[1]),
      );
  }
  function cancel() {
    pressed.current = false;
    suppressed.current = true;
    clearTimeout(hold.current);
    clearTimeout(dwell.current);
    setHover("");
  }
  function tap(action: () => void) {
    if (!suppressed.current) action();
    suppressed.current = false;
  }
  async function save() {
    if (
      prefs.expense
        .slice(0, 2)
        .some(
          (item) =>
            item.prices.length !== 2 ||
            item.prices.some(
              (n) => !Number.isInteger(n) || n <= 0 || n > 1000000,
            ),
        )
    ) {
      setError("กรุณาระบุราคาพรีเซต 2 ค่า เป็นจำนวนเต็ม 1–1,000,000 บาท");
      return;
    }
    try {
      await db.transaction("rw", db.settings, db.categories, async () => {
        await db.settings.put({
          id: "radial.preferences",
          value: JSON.stringify(prefs),
        });
        for (const [id, icon] of Object.entries(iconEdits))
          if (icons.includes(icon)) await db.categories.update(id, { icon });
      });
      setSettings(false);
      setKind(null);
      setSlot(null);
      setError("");
      setIconEdits({});
      menuSound("equip", muted);
    } catch {
      setError("บันทึกตั้งค่าไม่สำเร็จ");
    }
  }
  return (
    <div
      className={"radial-scrim " + (leaving ? "leaving" : "")}
      role="dialog"
      aria-modal="true"
      aria-label="เมนูบันทึกวงกลม"
    >
      <button
        className="radial-heading"
        onClick={() => {
          setSettings(!settings);
          menuSound("select", muted);
        }}
        aria-label="ตั้งค่าหมวดและราคาพรีเซต"
      >
        {selected ? (
          <>
            <Pixel
              name={categoryIcon(
                s.categories.find((c) => c.id === selected.id),
              )}
              size={42}
            />
            <span>
              <b>
                {s.categories.find((c) => c.id === selected.id)?.name} · ชำระจาก
                {s.accounts.find((a) => a.id === prefs.account)?.name}
              </b>
              <small>เลือกราคาเพื่อบันทึก</small>
            </span>
          </>
        ) : (
          <>
            ✧{" "}
            {settings
              ? "ตั้งค่าวงกลม"
              : kind
                ? "เลือกรายการที่ใช้บ่อย"
                : "เลือกหมวด แล้วระบุจำนวนเงิน"}{" "}
            ✧
          </>
        )}
        <span>⚙</span>
      </button>
      {settings ? (
        <section className="radial-settings card">
          <h3>หมวด ไอคอน และราคาที่ใช้บ่อย</h3>
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
          {!selected &&
            (["income", "expense"] as const).map((k) => (
              <div key={k}>
                <h4>{k === "income" ? "รายรับ" : "รายจ่าย"}</h4>
                {prefs[k].map((item, i) => {
                  const c = s.categories.find((c) => c.id === item.id);
                  return (
                    <div className="quick-setting-block" key={i}>
                      <div className="quick-setting-row">
                        <select
                          aria-label={k + " หมวด " + (i + 1)}
                          value={item.id}
                          onChange={(e) =>
                            setPrefs({
                              ...prefs,
                              [k]: prefs[k].map((v, j) =>
                                i === j ? { ...v, id: e.target.value } : v,
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
                          i < 2 &&
                          [0, 1].map((n) => (
                            <input
                              key={n}
                              aria-label={
                                "ราคา " + (n + 1) + " หมวด " + (i + 1)
                              }
                              type="number"
                              min="1"
                              max="1000000"
                              step="1"
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
                      <label className="quick-icon-choice">
                        <Pixel
                          name={iconEdits[item.id] || categoryIcon(c)}
                          size={32}
                        />
                        <select
                          aria-label={"ไอคอน " + (c?.name || i)}
                          value={iconEdits[item.id] || categoryIcon(c)}
                          onChange={(e) =>
                            setIconEdits({
                              ...iconEdits,
                              [item.id]: e.target.value,
                            })
                          }
                        >
                          {icons.map((icon) => (
                            <option key={icon} value={icon}>
                              {iconLabels[icon] || icon}
                            </option>
                          ))}
                        </select>
                      </label>
                      {i === 2 && <small>อื่น ๆ เปิดหน้ากรอกจำนวนเงินเอง</small>}
                    </div>
                  );
                })}
              </div>
            ))}
          <button className="primary" onClick={save}>
            บันทึกตั้งค่า
          </button>
        </section>
      ) : (
        <section
          key={String(kind) + String(slot)}
          className={
            "radial-stage " +
            (kind || "idle") +
            (selected ? " price-stage" : "")
          }
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={cancel}
        >
          {kind && (
            <svg
              viewBox="0 0 340 380"
              className="radial-lines"
              aria-hidden="true"
            >
              <path d="M170 290 Q45 270 55 125 M170 290 V80 M170 290 Q295 270 285 125" />
            </svg>
          )}
          {kind &&
            [0, 1, 2].map((i) => {
              const item = prefs[kind][i],
                c = s.categories.find((c) => c.id === item.id);
              const price = selected?.prices[i];
              const key = selected
                ? i < 2 && price !== undefined
                  ? "price:" + price
                  : "price:manual"
                : "cat:" + i;
              return (
                <button
                  key={(selected ? "price" : "category") + i}
                  data-choice={key}
                  className={
                    "radial-orb satellite satellite-" +
                    i +
                    (hover === key ? " hovered" : "") +
                    (selected
                      ? i < 2
                        ? " price-preset"
                        : " price-manual"
                      : "")
                  }
                  onPointerDown={(e) => {
                    if (!selected) begin(e, () => pick(kind, i), kind);
                    else {
                      suppressed.current = false;
                      pressed.current = false;
                      menuSound("select", muted);
                    }
                  }}
                  onClick={() =>
                    tap(() =>
                      selected
                        ? finish(kind, selected, i < 2 ? price : undefined)
                        : pick(kind, i),
                    )
                  }
                >
                  {selected ? (
                    i < 2 && price !== undefined ? (
                      <strong>{price}</strong>
                    ) : (
                      <strong>✎</strong>
                    )
                  ) : (
                    <Pixel name={categoryIcon(c)} size={66} />
                  )}
                  <span>
                    {selected
                      ? i < 2 && price !== undefined
                        ? "บาท"
                        : "ระบุ"
                      : i === 2
                        ? "อื่น ๆ"
                        : c?.name || "เลือกหมวด"}
                  </span>
                </button>
              );
            })}
          {kind && (
            <button
              className={
                "radial-orb radial-main " +
                (selected ? "category-main" : "spinning-ring")
              }
              onPointerDown={(e) =>
                begin(
                  e,
                  () => {
                    if (selected) setSlot(null);
                  },
                  kind,
                )
              }
              onClick={() =>
                tap(() => {
                  setSlot(null);
                  menuSound("select", muted);
                })
              }
            >
              {selected ? (
                <Pixel
                  name={categoryIcon(
                    s.categories.find((c) => c.id === selected.id),
                  )}
                  size={58}
                />
              ) : (
                <Pixel
                  name={kind === "income" ? "ui-income" : "ui-expense"}
                  size={66}
                />
              )}
              <span>
                {selected
                  ? s.categories.find((c) => c.id === selected.id)?.name
                  : kind === "income"
                    ? "รายรับ"
                    : "รายจ่าย"}
              </span>
              <i className="orb-sparkle" aria-hidden="true">
                ✦
              </i>
            </button>
          )}
          {!selected &&
            (["income", "expense"] as const).map((k) => (
              <button
                key={k}
                className={
                  "radial-orb type-orb kind-" +
                  k +
                  (kind === k ? " active" : "") +
                  (kind ? " type-small" : " spinning-ring")
                }
                onPointerDown={(e) => begin(e, () => select(k), k)}
                onClick={() => tap(() => select(k))}
              >
                <Pixel
                  name={k === "income" ? "ui-income" : "ui-expense"}
                  size={60}
                />
                <span>{k === "income" ? "รายรับ" : "รายจ่าย"}</span>
              </button>
            ))}
          <p className="radial-account">
            {selected ? "ชำระจาก " : "บัญชี "}
            {s.accounts.find((a) => a.id === prefs.account)?.name ||
              "เลือกบัญชีในตั้งค่า"}
          </p>
        </section>
      )}
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
