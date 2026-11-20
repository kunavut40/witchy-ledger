import {useOverlay,overlayHost} from "./ui/SharedBackdrop";
import { useExitMotion } from "./motion";
import { testUnlocked } from "./testing";
import { useEffect, useState, type FormEvent } from "react";
import { X, Check } from "lucide-react";
import { db } from "./db";
import type { State } from "./domain";
import { heroes, Hero, RankFrame } from "./Heroes";
import { progression } from "./progression";
import { ProgressPanel } from "./Adventure";
import { palettes, eyeColors } from "./Palette";
import { parseFantasy } from "./fantasy/model";
export const characters = [
  { id: "yui", name: "ยูอิ" },
  { id: "momo", name: "โมโมะ" },
];
export function Character({
  id,
  size = 48,
  rankIndex = 0,
}: {
  id: string;
  size?: number;
  rankIndex?: number;
}) {
  return (
    <RankFrame size={size} rankIndex={rankIndex}>
      <Hero id={id} size={size} />
    </RankFrame>
  );
}
export function getProfile(settings: State["settings"]) {
  const value = (key: string) => settings.find((x) => x.id === key)?.value;
  return {
    nickname: value("profile.nickname") || "Nevermore",
    avatar: value("profile.avatar") || "yui",
  };
}
export default function Profile({
  settings,
  transactions,
  close: closeImmediately,
  act,
}: {
  settings: State["settings"];
  transactions: State["transactions"];
  close: () => void;
  act: (fn: () => Promise<unknown>, message?: string) => Promise<boolean>;
}) {
  useOverlay(true);
  const motion = useExitMotion(
    closeImmediately,
    parseFantasy(settings.find((x) => x.id === "fantasy.state")?.value).muted,
  );
  const close = motion.dismiss;
  useEffect(() => {
    document.addEventListener("witchy-profile-close", close);
    return () => document.removeEventListener("witchy-profile-close", close);
  }, [close]);
  const current = getProfile(settings),
    p = progression(transactions);
  const [avatar, setAvatar] = useState(
      current.avatar === "momo" ? "momo" : "yui",
    ),
    [nickname, setNickname] = useState(current.nickname),
    [title, setTitle] = useState(
      settings.find((x) => x.id === "profile.title")?.value || heroes[0].title,
    ),
    [palette, setPalette] = useState(
      settings.find((x) => x.id === "appearance.palette")?.value || "lavender",
    ),
    [tab, setTab] = useState("character"),
    [busy, setBusy] = useState(false);
  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const ok = await act(async () => {
      if (!nickname.trim()) throw Error("กรุณาระบุชื่อ");
      await db.transaction("rw", db.settings, async () => {
        const f = parseFantasy((await db.settings.get("fantasy.state"))?.value);
        await db.settings.bulkPut([
          { id: "profile.nickname", value: nickname.trim() },
          { id: "profile.avatar", value: avatar },
          { id: "profile.title", value: title },
          { id: "appearance.palette", value: palette },
          {
            id: "fantasy.state",
            value: JSON.stringify({ ...f, character: avatar }),
          },
        ]);
      });
    });
    setBusy(false);
    if (ok) close();
  }
  return (
    <div
      className={
        "modal-overlay motion-surface " +
        (motion.leaving ? "motion-leaving" : "")
      }
    >
      <section
        className="modal adventure-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-title"
      >
        <header>
          <div>
            <span className="eyebrow">YOUR LITTLE MAGIC</span>
            <h2 id="profile-title">ตัวละคร ชื่อ และฉายา</h2>
          </div>
          <button className="icon-button" aria-label="ปิดโปรไฟล์" onClick={close}>
            <X />
          </button>
        </header>
        <div className="adventure-tabs">
          {[
            ["character", "ตัวละคร & ชื่อ"],
            ["progress", "เลเวล & แรงก์"],
            ["palette", "สีพาสเทล"],
          ].map(([id, name]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={id === tab ? "selected" : ""}
            >
              {name}
            </button>
          ))}
        </div>
        <form id="profile-form" onSubmit={save}>
          {tab === "character" && (
            <>
              <div className="hero-profile-preview">
                <Character id={avatar} size={120} rankIndex={p.rankIndex} />
                <div>
                  <h2>{nickname}</h2>
                  <p>{title}</p>
                  <small>
                    {p.rank.name} · LV. {p.level}
                  </small>
                </div>
              </div>
              <div className="character-options">
                {characters.map((c) => (
                  <button
                    type="button"
                    key={c.id}
                    className={avatar === c.id ? "selected" : ""}
                    onClick={() => setAvatar(c.id)}
                  >
                    <Character id={c.id} size={90} />
                    {c.name}
                  </button>
                ))}
              </div>
              <label>
                ชื่อที่เลือก
                <select
                  value={
                    heroes.some((h) => h.name === nickname) ? nickname : ""
                  }
                  onChange={(e) =>
                    e.target.value && setNickname(e.target.value)
                  }
                >
                  <option value="">กำหนดชื่อเอง</option>
                  {heroes.map((h) => (
                    <option key={h.id}>{h.name}</option>
                  ))}
                </select>
              </label>
              <label>
                ชื่อเล่น
                <input
                  required
                  maxLength={40}
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                />
              </label>
              <label>
                ฉายา
                <select
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                >
                  {!heroes.some((h) => h.title === title) && (
                    <option>{title}</option>
                  )}
                  {heroes.map((h) => (
                    <option key={h.id}>{h.title}</option>
                  ))}
                </select>
              </label>
              <p className="info-note">
                ชื่อและฉายาเลือกแยกกันได้ ภาพตัวละครใช้เฉพาะยูอิ/โมโมะ ชุด ทรงผม
                และเครื่องประดับเปลี่ยนได้ในห้องแต่งตัว
              </p>
            </>
          )}
          {tab === "progress" && (
            <ProgressPanel
              transactions={transactions}
              avatar={avatar}
              unlocked={testUnlocked({ settings } as State)}
              previewRank={(index) =>
                void act(
                  () =>
                    db.settings.put({
                      id: "profile.testRank",
                      value: String(index),
                    }),
                  "เลือกกรอบสำหรับทดสอบแล้ว",
                )
              }
            />
          )}
          {tab === "palette" && (
            <div className="palette-grid">
              {palettes.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  className={palette === c.id ? "selected" : ""}
                  onClick={() => setPalette(c.id)}
                >
                  <i style={{ background: c.color }} />
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </form>
        <footer>
          <button className="soft-button" onClick={close}>
            ยกเลิก
          </button>
          <button className="primary" form="profile-form" disabled={busy}>
            <Check size={16} /> บันทึกการปรับแต่ง
          </button>
        </footer>
      </section>
    </div>
  );
}
