import { companionPerformance } from "./performance";
import { useEffect, useMemo, useRef, useState } from "react";
import type { State } from "../domain";
import Companion from "./Companion";
import { readFantasy, updateFantasy } from "./Fantasy";
import { readRuntime, RUNTIME_KEY } from "./engine";
import { syncCompanion, dismissDialogue } from "./runtime";
import { menuSound } from "./sound";
const session = crypto.randomUUID();
export default function CompanionWidget({
  s,
  dashboard = true,
  page = "dashboard",
}: {
  s: State;
  dashboard?: boolean;
  page?: string;
}) {
  const a = useMemo(() => readFantasy(s), [s]),
    runtime = useMemo(
      () => readRuntime(s.settings.find((x) => x.id === RUNTIME_KEY)?.value, a),
      [s, a],
    );
  const line = runtime.queue.find((x) => x.character === a.character);
  const expressionEmotion =
    line?.emotion || (a.character === "yui" ? "proud" : "happy");
  const idleText =
    a.character === "yui"
      ? "ไม่ได้รออยู่หรอกนะ… มีรายการให้ฉันจดหรือเปล่า?"
      : "พร้อมจดแล้ว! วันนี้มีเรื่องอะไรมาเล่าให้ฟังบ้าง?";
  const [count, setCount] = useState(0),
    [problem, setProblem] = useState(false),
    [reduced, setReduced] = useState(
      () => matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  const started = useRef(false),
    previousPage = useRef("");
  const safe = (work: Promise<unknown>) =>
    void work.then(
      () => setProblem(false),
      () => setProblem(true),
    );
  const signature = useMemo(
    () =>
      JSON.stringify([
        s.transactions,
        s.accounts,
        s.categories,
        s.periods,
        s.budgets,
        s.goals,
        a.character,
        a.outfit,
        a.hair,
        a.accessory,
        a.furniture,
      ]),
    [s, a],
  );
  useEffect(() => {
    if (!started.current) {
      started.current = true;
      safe(syncCompanion({ kind: "open", session }));
    } else safe(syncCompanion({ kind: "sync" }));
  }, [signature]);
  useEffect(() => {
    if (previousPage.current !== page) {
      previousPage.current = page;
      safe(syncCompanion({ kind: "page", page }));
    }
  }, [page]);
  useEffect(() => {
    const q = matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(q.matches);
    q.addEventListener("change", on);
    return () => q.removeEventListener("change", on);
  }, []);
  const letters = useMemo(() => Array.from(line?.text || ""), [line?.key]);
  const motion = a.animations !== false && !reduced;
  useEffect(() => {
    setCount(motion ? 0 : Array.from(line?.text || "").length);
  }, [line?.key, motion]);
  useEffect(() => {
    if (count >= letters.length || !line || a.hidden || !a.mode) return;
    const t = setTimeout(() => setCount((n) => n + 1), 27);
    return () => clearTimeout(t);
  }, [count, line?.key, a.hidden, a.mode, letters.length]);
  useEffect(() => {
    if (!line || a.hidden || !a.mode || count < letters.length) return;
    const t = setTimeout(() => safe(dismissDialogue(line.key)), 4500);
    return () => clearTimeout(t);
  }, [line?.key, count, letters.length, a.hidden, a.mode]);
  if (!a.mode) return null;
  if (a.hidden)
    return (
      <button
        className="summon-companion"
        onClick={() => {
          safe(updateFantasy({ hidden: false }));
          safe(syncCompanion({ kind: "interaction" }));
        }}
      >
        ✦ เรียก{a.character === "yui" ? "ยูอิ" : "โมโมะ"}
      </button>
    );
  if (!dashboard && !line) return null;
  return (
    <aside
      className="companion-widget"
      aria-label="ผู้ช่วยส่วนตัว"
      data-event={line?.event || "idle"}
      data-expression={
        companionPerformance(expressionEmotion, a.character).expression
      }
      data-pose={companionPerformance(expressionEmotion, a.character).pose}
      data-motion={motion ? "on" : "off"}
    >
      <button
        className="companion-hide"
        aria-label="ซ่อนผู้ช่วย"
        onClick={() => safe(updateFantasy({ hidden: true }))}
      >
        ×
      </button>
      <Companion
        appearance={a}
        emotion={expressionEmotion}
        talking={motion && count < letters.length}
        mouthFrame={count % 3}
        size={110}
      />
      <button
        className="dialogue-bubble"
        onClick={() => {
          menuSound("select", a.muted);
          if (line && count < letters.length) setCount(letters.length);
          else if (line) safe(dismissDialogue(line.key));
          else safe(syncCompanion({ kind: "interaction" }));
        }}
      >
        <b>{a.character === "yui" ? "ยูอิ" : "โมโมะ"} ✦</b>
        <span aria-hidden="true">
          {problem
            ? "บทพูดยังไม่พร้อม แตะเพื่อลองใหม่"
            : line
              ? letters.slice(0, count).join("")
              : idleText}
          <i>▾</i>
        </span>
        <span className="sr-only" aria-live="polite">
          {line?.text || idleText}
        </span>
      </button>
    </aside>
  );
}
