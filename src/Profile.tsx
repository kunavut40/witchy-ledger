import { useState, type FormEvent } from "react";
import { X, Check, Shuffle } from "lucide-react";
import { db } from "./db";
import type { State } from "./domain";
import { heroes, Hero, RankFrame } from "./Heroes";
import { progression } from "./progression";
import { themes, ProgressPanel, ThemePreview } from "./Adventure";
export const characters = heroes;
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
    avatar: value("profile.avatar") || "nevermore",
  };
}
export default function Profile({
  settings,
  transactions,
  close,
  act,
}: {
  settings: State["settings"];
  transactions: State["transactions"];
  close: () => void;
  act: (fn: () => Promise<unknown>, message?: string) => Promise<boolean>;
}) {
  const current = getProfile(settings),
    p = progression(transactions);
  const [avatar, setAvatar] = useState(
      heroes.some((h) => h.id === current.avatar)
        ? current.avatar
        : "nevermore",
    ),
    [nickname, setNickname] = useState(current.nickname),
    [title, setTitle] = useState(
      settings.find((x) => x.id === "profile.title")?.value ||
        heroes.find((h) => h.id === current.avatar)?.title ||
        heroes[0].title,
    ),
    [theme, setTheme] = useState(
      settings.find((x) => x.id === "appearance.theme")?.value || "academy",
    ),
    [tab, setTab] = useState("heroes"),
    [busy, setBusy] = useState(false);
  async function save(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    const ok = await act(async () => {
      if (!nickname.trim()) throw Error("กรุณาระบุชื่อเล่น");
      await db.settings.bulkPut([
        { id: "profile.nickname", value: nickname.trim() },
        { id: "profile.avatar", value: avatar },
        { id: "profile.title", value: title },
        { id: "appearance.theme", value: theme },
      ]);
    }, "บันทึกฮีโร่ ฉายา และธีมแล้ว");
    setBusy(false);
    if (ok) close();
  }
  function choose(id: string) {
    const h = heroes.find((h) => h.id === id)!;
    setAvatar(id);
    setTitle(h.title);
  }
  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => e.target === e.currentTarget && !busy && close()}
    >
      <section
        className="modal adventure-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-title"
      >
        <header>
          <div>
            <span className="eyebrow">THE COVEN OF ANCIENTS</span>
            <h2 id="profile-title">ฮีโร่และเส้นทางแห่งเวทมนตร์</h2>
          </div>
          <button className="icon-button" onClick={close} aria-label="ปิดโปรไฟล์">
            <X />
          </button>
        </header>
        <div className="adventure-tabs" role="tablist" aria-label="จัดการโปรไฟล์">
          {[
            ["heroes", "ฮีโร่ & ฉายา"],
            ["progress", "เลเวล & แรงก์"],
            ["themes", "ฉากเวทมนตร์"],
          ].map(([id, name]) => (
            <button
              role="tab"
              aria-selected={tab === id}
              key={id}
              className={tab === id ? "selected" : ""}
              onClick={() => setTab(id)}
            >
              {name}
            </button>
          ))}
        </div>
        <form id="profile-form" onSubmit={save}>
          {tab === "heroes" && (
            <>
              <div className="hero-profile-preview">
                <Character id={avatar} size={122} rankIndex={p.rankIndex} />
                <div>
                  <span className="eyebrow">
                    {p.rank.name.toUpperCase()} · LEVEL {p.level}
                  </span>
                  <h2>{nickname}</h2>
                  <p>{title}</p>
                  <small>{heroes.find((h) => h.id === avatar)?.name}</small>
                </div>
              </div>
              <div className="form-grid">
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
              </div>
              <div className="spread">
                <label>เลือกฮีโร่ · 20 ตัว</label>
                <button
                  type="button"
                  className="soft-button"
                  onClick={() =>
                    choose(heroes[Math.floor(Math.random() * heroes.length)].id)
                  }
                >
                  <Shuffle size={14} /> สุ่มฮีโร่
                </button>
              </div>
              <div className="hero-picker">
                {heroes.map((h) => (
                  <button
                    type="button"
                    key={h.id}
                    className={avatar === h.id ? "selected" : ""}
                    aria-label={h.name}
                    aria-pressed={avatar === h.id}
                    onClick={() => choose(h.id)}
                  >
                    <Hero id={h.id} size={76} />
                    <b>{h.name}</b>
                    <small>{h.title}</small>
                  </button>
                ))}
              </div>
              <p className="tiny muted">
                แฟนอาร์ตที่วาดใหม่ แรงบันดาลใจจากฮีโร่ DotA ในโลกพิกเซลแม่มด ·
                แสงและการขยับทำงานในเครื่อง
              </p>
            </>
          )}
          {tab === "progress" && (
            <ProgressPanel transactions={transactions} avatar={avatar} />
          )}
          {tab === "themes" && (
            <>
              <h3>เลือกสถานที่พักใจของฮีโร่</h3>
              <div className="theme-picker">
                {themes.map((t) => (
                  <button
                    type="button"
                    className={theme === t.id ? "selected" : ""}
                    key={t.id}
                    aria-pressed={theme === t.id}
                    onClick={() => setTheme(t.id)}
                  >
                    <ThemePreview id={t.id} />
                    <span>
                      <b>{t.name}</b>
                      <small>{t.description}</small>
                    </span>
                    {theme === t.id && <Check size={17} />}
                  </button>
                ))}
              </div>
              <p className="info-note">
                กดบันทึกเพื่อใช้ธีมกับแอป ภาพฉากถูกเก็บไว้กับแอปและเปิดแบบออฟไลน์ได้
              </p>
            </>
          )}
        </form>
        <footer>
          <button className="soft-button" onClick={close}>
            ยกเลิก
          </button>
          <button className="primary" form="profile-form" disabled={busy}>
            <Check size={17} /> บันทึกการปรับแต่ง
          </button>
        </footer>
      </section>
    </div>
  );
}
