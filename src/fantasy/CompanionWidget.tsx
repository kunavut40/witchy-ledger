import { createPortal } from "react-dom";
import { overlayHost, useOverlay, useOverlayTop } from "../ui/SharedBackdrop";
import { dialoguePlayback } from "./dialoguePlayback";
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
  const [manual, setManual] = useState(false),
    [blocked, setBlocked] = useState(""),
    [foreground, setForeground] = useState(() => !document.hidden),
    [playback, setPlayback] = useState({ key: "", count: 0 }),
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
  const text = line?.text || idleText;
  const key = page + ":" + a.character + ":" + (line?.key || "manual");
  const visible =
    !!a.mode && !a.hidden && blocked !== key && (!!line || manual);
  const top = useOverlayTop();
  useOverlay(visible, 200);
  const active = visible && foreground && top.level <= 200;
  const letters = useMemo(() => Array.from(text), [text]);
  const count = playback.key === key ? playback.count : 0;
  const progress = useRef({ key: "", count: 0 });
  const motion = a.animations !== false && !reduced;
  const current = useRef({ key, lineKey: line?.key, visible });
  current.current = { key, lineKey: line?.key, visible };
  const close = () => {
    setBlocked(key);
    setManual(false);
    if (line) safe(dismissDialogue(line.key));
  };
  const closeRef = useRef(close);
  closeRef.current = close;
  useEffect(() => {
    const on = () => setForeground(!document.hidden);
    document.addEventListener("visibilitychange", on);
    return () => document.removeEventListener("visibilitychange", on);
  }, []);
  const presentation = useRef({
    page,
    character: a.character,
    lineKey: line?.key,
    visible,
  });
  useEffect(() => {
    const previous = presentation.current;
    if (previous.page !== page || previous.character !== a.character) {
      setManual(false);
      if (previous.visible && previous.lineKey)
        void dismissDialogue(previous.lineKey);
    }
    presentation.current = {
      page,
      character: a.character,
      lineKey: line?.key,
      visible,
    };
  });
  useEffect(
    () => () => {
      const shown = current.current;
      if (shown.visible && shown.lineKey) void dismissDialogue(shown.lineKey);
    },
    [],
  );
  const [skipRevision, setSkipRevision] = useState(0);
  useEffect(() => {
    if (!active) return;
    return dialoguePlayback(
      letters.length,
      progress.current.key === key ? progress.current.count : 0,
      motion,
      (n) => {
        progress.current = { key, count: n };
        setPlayback({ key, count: n });
      },
      () => closeRef.current(),
    );
  }, [active, key, letters.length, motion, skipRevision]);
  const skip = () => {
    menuSound("select", a.muted);
    if (count < letters.length) {
      progress.current = { key, count: letters.length };
      setPlayback({ key, count: letters.length });
      // Restart this line's playback owner with its completed progress.
      setSkipRevision((n) => n + 1);
    } else close();
  };
  if (!a.mode) return null;
  if (!visible)
    return dashboard || a.hidden ? (
      <button
        className="summon-companion"
        onClick={() => {
          progress.current = { key: "", count: 0 };
          setPlayback({ key: "", count: 0 });
          setBlocked("");
          setManual(true);
          if (a.hidden) safe(updateFantasy({ hidden: false }));
          safe(syncCompanion({ kind: "interaction" }));
        }}
      >
        ✦ เรียก{a.character === "yui" ? "ยูอิ" : "โมโมะ"}
      </button>
    ) : null;
  return createPortal(
    <div className="companion-dialogue-layer">
      <aside
        className="companion-widget"
        aria-label="ผู้ช่วยส่วนตัว"
        data-event={line?.event || "interaction"}
        data-expression={
          companionPerformance(expressionEmotion, a.character).expression
        }
        data-pose={companionPerformance(expressionEmotion, a.character).pose}
        data-speaking={active && count < letters.length}
        data-motion={motion && active ? "on" : "off"}
      >
        <Companion
          appearance={a}
          emotion={expressionEmotion}
          talking={motion && active && count < letters.length}
          mouthFrame={count % 3}
          size={136}
        />
        <button
          className="dialogue-bubble"
          onClick={skip}
          aria-label="อ่านบทพูด หรือข้ามข้อความ"
        >
          <b className="dialogue-nameplate">
            {a.character === "yui" ? "ยูอิ" : "โมโมะ"} ✦
          </b>
          <span aria-hidden="true">
            {problem
              ? "บทพูดยังไม่พร้อม แตะเพื่อลองใหม่"
              : letters.slice(0, count).join("")}
            <i>▾</i>
          </span>
          <span className="sr-only" aria-live="polite">
            {text}
          </span>
        </button>
        <button
          className="companion-hide"
          aria-label="ปิดบทสนทนา"
          onClick={() => {
            menuSound("back", a.muted);
            close();
          }}
        >
          ×
        </button>
      </aside>
    </div>,
    overlayHost(),
  );
}
