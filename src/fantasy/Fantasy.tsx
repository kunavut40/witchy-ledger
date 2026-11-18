import { eyeColors } from "../Palette";
import { useEffect, useState } from "react";
import { db } from "../db";
import { progression } from "../progression";
import type { State } from "../domain";
import Companion from "./Companion";
import {
  parseFantasy,
  defaults,
  hairstyles,
  outfits,
  outfitLevel,
  furniture,
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
export function FantasyRoom({
  s,
  wardrobe = false,
}: {
  s: State;
  wardrobe?: boolean;
}) {
  const a = readFantasy(s),
    level = progression(s.transactions).level;
  const [tab, setTab] = useState("outfit"),
    [note, setNote] = useState("");
  const save = (patch: Partial<FantasyState>, kind = "equip") => {
    menuSound(kind, a.muted);
    void updateFantasy(patch).catch(() => setNote("บันทึกไม่สำเร็จ กรุณาลองอีกครั้ง"));
  };
  return (
    <div className="fantasy-room-page">
      <FantasySettings s={s} />
      <div className={"attic-scene place-" + (a.place || "attic")}>
        <div className="attic-label">
          MAGICAL ATTIC BEDROOM{" "}
          <small>
            {a.character === "yui" ? "ห้องของยูอิ" : "ห้องของโมโมะ"} · LV. {level}
          </small>
        </div>
        <div className="room-companion">
          <Companion appearance={a} size={180} />
        </div>
        <div className="furniture-slots">
          {furniture
            .filter((f) => a.furniture.includes(f.id) && level >= f.level)
            .map((f) => (
              <span key={f.id} title={f.name}>
                {
                  (
                    {
                      bed: "🛏",
                      clock: "🕰",
                      cat: "🐈‍⬛",
                      crystal: "🔮",
                      plant: "🌿",
                      books: "📚",
                      lantern: "🏮",
                      mirror: "🪞",
                    } as Record<string, string>
                  )[f.id]
                }
              </span>
            ))}
        </div>
      </div>
      <section className="card wardrobe-panel">
        <div className="spread">
          <h3>{wardrobe ? "ตู้เสื้อผ้า" : "ห้องพักและของตกแต่ง"}</h3>
          <span className="tag">ความสนิท {a.affinity}</span>
        </div>
        <div className="type-tabs">
          <button
            className={a.character === "yui" ? "selected" : ""}
            onClick={() =>
              save(
                {
                  character: "yui",
                  hair: 0,
                  hairColor: "#24202a",
                  accessory: "ribbon",
                },
                "character",
              )
            }
          >
            ยูอิ · จริงจังแต่ห่วงใย
          </button>
          <button
            className={a.character === "momo" ? "selected" : ""}
            onClick={() =>
              save(
                {
                  character: "momo",
                  hair: 5,
                  hairColor: "#d48dad",
                  accessory: "skull",
                },
                "character",
              )
            }
          >
            โมโมะ · คู่หูขี้เล่น
          </button>
        </div>
        <div className="eye-choices">
          <label>สีตา</label>
          {eyeColors.map((e) => (
            <button
              key={e.id}
              aria-pressed={(a.eyeColor || "pink") === e.id}
              style={{ background: e.color }}
              onClick={() => save({ eyeColor: e.id })}
              aria-label={"สีตา" + e.name}
            />
          ))}
          <label>
            สถานที่
            <select
              value={a.place || "attic"}
              onChange={(e) => save({ place: e.target.value })}
            >
              <option value="attic">ห้องแต่งตัว</option>
              <option value="bridge">สะพานสวนจันทรา</option>
              <option value="library">ห้องสมุด</option>
            </select>
          </label>
        </div>
        <p className="info-note wardrobe-audit">
          ตอนนี้เปลี่ยนตัวละคร สีตา และฉากได้ ส่วนชุด ผม หมวก แว่น กิ๊บ ผ้าคลุม
          และของถือมือกำลังเตรียมภาพเพิ่มเติม จึงยังเลือกไม่ได้ ค่าที่เคยเลือกไว้ยังเก็บอยู่
          ของแต่งห้องปรับได้เฉพาะชิ้นที่เลือกเพิ่ม ส่วนเฟอร์นิเจอร์ที่อยู่ในภาพฉากยังคงเดิม
        </p>
        <div className="wardrobe-tabs">
          {[
            ["outfit", "ชุด"],
            ["hair", "ทรงผม"],
            ["accessory", "เครื่องประดับ"],
            ["room", "แต่งห้อง"],
            ["favorites", "ชุดโปรด"],
          ].map(([id, label]) => (
            <button
              className={tab === id ? "selected" : ""}
              key={id}
              onClick={() => {
                setTab(id);
                menuSound("select", a.muted);
              }}
            >
              {label}
            </button>
          ))}
        </div>
        {tab === "outfit" && (
          <div className="wardrobe-grid">
            {outfits.map((name, i) => {
              const locked = true;
              return (
                <button
                  disabled={locked}
                  aria-pressed={a.outfit === i}
                  className={a.outfit === i ? "selected" : ""}
                  key={i}
                  onClick={() => save({ outfit: i })}
                >
                  <Companion appearance={{ ...a, outfit: i }} size={65} />
                  <b>{name}</b>
                  <small>
                    {locked
                      ? "รอภาพแยกชั้น · LV. " + outfitLevel(i)
                      : a.outfit === i
                        ? "ภาพชุดยังไม่พร้อม"
                        : "ภาพชุดยังไม่พร้อม"}
                  </small>
                </button>
              );
            })}
          </div>
        )}
        {tab === "hair" && (
          <>
            <label>
              สีผม{" "}
              <input
                type="color"
                disabled
                value={a.hairColor}
                onChange={(e) => save({ hairColor: e.target.value })}
              />
            </label>
            <div className="wardrobe-grid">
              {hairstyles.map((name, i) => (
                <button
                  key={i}
                  disabled={true}
                  className={a.hair === i ? "selected" : ""}
                  onClick={() => save({ hair: i })}
                >
                  <Companion appearance={{ ...a, hair: i }} size={65} />
                  <b>{name}</b>
                  <small>
                    {i > 4 && level < 3 ? "🔒 LV. 3" : "รอภาพแยกชั้น"}
                  </small>
                </button>
              ))}
            </div>
          </>
        )}
        {tab === "accessory" && (
          <div className="accessory-controls">
            <label className="check">
              <input
                type="checkbox"
                disabled
                checked={a.hat}
                onChange={(e) => save({ hat: e.target.checked })}
              />{" "}
              หมวกแม่มด
            </label>
            <label className="check">
              <input
                type="checkbox"
                disabled
                checked={a.glasses}
                onChange={(e) => save({ glasses: e.target.checked })}
              />{" "}
              แว่นตา
            </label>
            <label className="check">
              <input
                type="checkbox"
                disabled
                checked={a.cape}
                onChange={(e) => save({ cape: e.target.checked })}
              />{" "}
              ผ้าคลุม
            </label>
            <label>
              กิ๊บ
              <select
                disabled
                value={a.accessory}
                onChange={(e) => save({ accessory: e.target.value })}
              >
                <option value="ribbon">ริบบิ้น</option>
                <option value="skull">หัวกะโหลก</option>
              </select>
            </label>
            <label>
              ของถือมือ
              <select
                disabled
                value={a.hand}
                onChange={(e) => save({ hand: e.target.value })}
              >
                <option value="none">ไม่ถือ</option>
                <option value="book">คัมภีร์</option>
                <option value="staff">คทา</option>
                <option value="bag">กระเป๋า</option>
              </select>
            </label>
          </div>
        )}
        {tab === "room" && (
          <div className="wardrobe-grid">
            {furniture.map((f) => (
              <button
                key={f.id}
                disabled={level < f.level}
                className={a.furniture.includes(f.id) ? "selected" : ""}
                onClick={() =>
                  save({
                    furniture: a.furniture.includes(f.id)
                      ? a.furniture.filter((id) => id !== f.id)
                      : [...a.furniture, f.id],
                  })
                }
              >
                <span className="furniture-symbol">
                  {f.id === "cat" ? "🐈‍⬛" : f.id === "crystal" ? "🔮" : "✦"}
                </span>
                <b>{f.name}</b>
                <small>
                  {level < f.level
                    ? "🔒 LV. " + f.level
                    : a.furniture.includes(f.id)
                      ? "วางแล้ว · กดเพื่อเก็บ"
                      : "วางในช่องที่กำหนด"}
                </small>
              </button>
            ))}
          </div>
        )}
        {tab === "favorites" && (
          <>
            <button
              className="soft-button"
              disabled={true}
              onClick={() =>
                save({
                  favorites: [
                    ...a.favorites,
                    {
                      name: "ชุดโปรด " + (a.favorites.length + 1),
                      hair: a.hair,
                      hairColor: a.hairColor,
                      outfit: a.outfit,
                      hat: a.hat,
                      glasses: a.glasses,
                      accessory: a.accessory,
                      cape: a.cape,
                      hand: a.hand,
                    },
                  ],
                })
              }
            >
              + บันทึกชุดปัจจุบัน
            </button>
            {a.favorites.map((f, i) => (
              <button
                className="soft-button"
                disabled
                key={i}
                onClick={() => save(f)}
              >
                {f.name}
              </button>
            ))}
          </>
        )}
        <div className="card-footer">
          <button
            className="soft-button"
            disabled
            onClick={() => {
              const unlocked = outfits
                .map((_, i) => i)
                .filter((i) => outfitLevel(i) <= level);
              save({
                outfit: unlocked[Math.floor(Math.random() * unlocked.length)],
                hair: Math.floor(Math.random() * (level >= 3 ? 12 : 5)),
                hat: Math.random() > 0.5,
                glasses: Math.random() > 0.5,
              });
            }}
          >
            สุ่มจากของที่ปลดล็อก
          </button>
          <span className="tiny muted">บันทึกอัตโนมัติในเครื่อง</span>
        </div>
        {note && <p role="alert">{note}</p>}
        <p className="info-note">
          ภาพตัวละครชุดนี้เป็นภาพวาดใหม่
          ส่วนระบบเปลี่ยนชุดและทรงผมยังรอภาพแยกชั้นที่ตรงกับแต่ละรายการ
          ชุดบางแบบยังใช้โครงภาพร่วมกัน รายการปลดล็อกอ้างอิงเลเวลเดิม ไม่มีการแก้ยอดเงินจริง
        </p>
      </section>
    </div>
  );
}
export function CompanionWidget({ s }: { s: State }) {
  const a = readFantasy(s),
    mood = financialMood(s);
  const [text, setText] = useState(""),
    [count, setCount] = useState(0),
    [turn, setTurn] = useState(0);
  useEffect(() => {
    const bank = lines[a.character][mood.event as keyof typeof lines.yui];
    setText(bank[turn % bank.length]);
    setCount(0);
  }, [a.character, mood.event, turn]);
  useEffect(() => {
    if (count >= text.length) return;
    const id = setTimeout(() => setCount((n) => n + 1), 27);
    return () => clearTimeout(id);
  }, [count, text]);
  if (!a.mode) return null;
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
        size={88}
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
