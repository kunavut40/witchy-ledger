import WardrobeRoom from "./WardrobeRoom";
import { useEffect, useState } from "react";
import { db } from "../db";
import type { State } from "../domain";
import Companion from "./Companion";
import {
  parseFantasy,
  financialMood,
  lines,
  interact,
  type FantasyState,
} from "./model";
import { menuSound } from "./sound";
export function readFantasy(s: State) {
  return parseFantasy(s.settings.find((x) => x.id === "fantasy.state")?.value);
}
export async function updateFantasy(patch: Partial<FantasyState>) {
  await db.transaction("rw", db.settings, async () => {
    const old = parseFantasy((await db.settings.get("fantasy.state"))?.value);
    await db.settings.put({
      id: "fantasy.state",
      value: JSON.stringify({ ...old, ...patch }),
    });
  });
}
export function FantasySettings({ s }: { s: State }) {
  const f = readFantasy(s);
  return (
    <div className="fantasy-settings">
      <h3>โลกของยูอิ & โมโมะ</h3>
      <div className="type-tabs">
        <button
          className={!f.mode ? "selected" : ""}
          onClick={() => void updateFantasy({ mode: false })}
        >
          Classic Finance
        </button>
        <button
          className={f.mode ? "selected" : ""}
          onClick={() => {
            menuSound("select", f.muted);
            void updateFantasy({ mode: true });
          }}
        >
          Witchy Fantasy
        </button>
      </div>
      <label className="check">
        <input
          type="checkbox"
          checked={!f.muted}
          onChange={(e) => {
            void updateFantasy({ muted: !e.target.checked });
            if (e.target.checked) menuSound("equip");
          }}
        />{" "}
        เสียงเลือกเมนูและแต่งตัว
      </label>
      <p className="tiny muted">
        เสียงสังเคราะห์เบา ๆ ในเครื่อง เริ่มเล่นเมื่อกดเมนูเท่านั้น ไม่มีเสียงพูด
      </p>
    </div>
  );
}
export function FantasyRoom({ s }: { s: State; wardrobe?: boolean }) {
  return <WardrobeRoom s={s} />;
}
export function CompanionWidget({
  s,
  dashboard = true,
}: {
  s: State;
  dashboard?: boolean;
}) {
  const a = readFantasy(s),
    mood = financialMood(s);
  const latest = [...s.transactions]
    .filter((t) => t.kind === "income" || t.kind === "expense")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  const [eventRevision, setEventRevision] = useState(0);
  useEffect(() => {
    const on = () => {
      setEventRevision((n) => n + 1);
      void updateFantasy({ hidden: false });
    };
    document.addEventListener("witchy-companion-event", on);
    return () => document.removeEventListener("witchy-companion-event", on);
  }, []);
  const [text, setText] = useState(""),
    [count, setCount] = useState(0),
    [turn, setTurn] = useState(0),
    [fresh, setFresh] = useState(false);
  useEffect(() => {
    const age = latest ? Date.now() - Date.parse(latest.createdAt) : Infinity;
    const recent = latest && age >= -5000 && age < 60000;
    setFresh(Boolean(recent));
    const bank = lines[a.character][mood.event as keyof typeof lines.yui];
    setText(
      recent
        ? (latest.kind === "income"
            ? "รับรายได้เพิ่มแล้วนะ ✨ "
            : "จดรายจ่ายให้แล้วนะ ✨ ") +
            latest.title +
            " " +
            (latest.amount / 100).toLocaleString("th-TH") +
            " บาท"
        : bank[turn % bank.length],
    );
    setCount(0);
    const timer = setTimeout(() => setFresh(false), 12000);
    return () => clearTimeout(timer);
  }, [a.character, mood.event, turn, latest?.id, eventRevision]);
  useEffect(() => {
    if (count >= text.length) return;
    const id = setTimeout(() => setCount((n) => n + 1), 27);
    return () => clearTimeout(id);
  }, [count, text]);
  if ((!a.mode && !fresh) || (!dashboard && !fresh)) return null;
  if (a.hidden)
    return (
      <button
        className="summon-companion"
        onClick={() => void updateFantasy({ hidden: false })}
      >
        ✦ เรียก{a.character === "yui" ? "ยูอิ" : "โมโมะ"}
      </button>
    );
  return (
    <aside className="companion-widget" aria-label="ผู้ช่วยส่วนตัว">
      <button
        className="companion-hide"
        aria-label="ซ่อนผู้ช่วย"
        onClick={() => void updateFantasy({ hidden: true })}
      >
        ×
      </button>
      <Companion
        appearance={a}
        emotion={mood.emotion}
        talking={count < text.length}
        size={110}
      />
      <button
        className="dialogue-bubble"
        onClick={() => {
          menuSound("select", a.muted);
          setTurn((n) => n + 1);
          const next = interact(a);
          void updateFantasy({
            affinity: next.affinity,
            lastInteraction: next.lastInteraction,
          });
        }}
      >
        <b>{a.character === "yui" ? "ยูอิ" : "โมโมะ"} ✦</b>
        <span>
          {text.slice(0, count)}
          <i>▾</i>
        </span>
      </button>
    </aside>
  );
}
