import { useState } from "react";
import type { State } from "../domain";
import { db } from "../db";
import { progression } from "../progression";
import { testUnlocked } from "../testing";
import { bodyIndices, hairIndices } from "../CharacterArt";
import Companion from "./Companion";
import { readFantasy, updateFantasy, FantasySettings } from "./Fantasy";
import { menuSound } from "./sound";
import type { FantasyState } from "./model";
import { readRuntime, RUNTIME_KEY, affinityTier } from "./engine";
const looks = [
  "เสื้อขาวพื้นฐาน",
  "สเวตเตอร์นักเรียน",
  "นักเรียนเวทมนตร์",
  "ชุดนอนกระต่าย",
  "จอมเวทต่อสู้",
  "แม่มดโกธิก",
  "ชุดลำลอง",
  "กิโมโน",
];
const hairNames = ["ผมยาวตรง", "ทวินเทล", "บ๊อบกลาง", "ผมยาวพริ้ว", "มวยถัก"];
export default function WardrobeRoom({ s }: { s: State }) {
  const a = readFantasy(s),
    unlocked = testUnlocked(s),
    level = progression(s.transactions).level,
    runtime = readRuntime(
      s.settings.find((x) => x.id === RUNTIME_KEY)?.value,
      a,
    ),
    tier = affinityTier(runtime.characters[a.character].affinity),
    activeEmotion =
      runtime.queue.find((x) => x.character === a.character)?.emotion || "idle";
  const [tab, setTab] = useState("outfit"),
    [note, setNote] = useState("");
  async function save(patch: Partial<FantasyState>) {
    try {
      await updateFantasy(patch);
      setNote("บันทึกรูปลักษณ์แล้ว");
      menuSound("equip", a.muted);
    } catch {
      setNote("บันทึกไม่สำเร็จ กรุณาลองอีกครั้ง");
    }
  }
  return (
    <div className="academy-wardrobe">
      <FantasySettings s={s} />
      <label className="test-unlock">
        <input
          type="checkbox"
          checked={unlocked}
          onChange={(e) =>
            void db.settings.put({
              id: "test.unlockAll",
              value: String(e.target.checked),
            })
          }
        />
        ปลดล็อกทั้งหมดเพื่อทดสอบ · ไม่เปลี่ยนยอดเงินหรือ XP
      </label>
      <div className="wardrobe-layout">
        <section className="wardrobe-scene" aria-label="ห้องแต่งตัวเวทมนตร์">
          <i className="scene-window-light" />
          <i className="scene-lantern lantern-one" />
          <i className="scene-lantern lantern-two" />
          <i className="scene-hourglass" />
          <i className="scene-orb" />
          <i className="scene-crystals" />
          <div className="room-companion">
            <Companion appearance={a} size={210} emotion={activeEmotion} />
          </div>
          <span className="room-name">
            ✧ ห้องของ{a.character === "yui" ? "ยูอิ" : "โมโมะ"}
          </span>
        </section>
        <section className="card wardrobe-panel academy-panel">
          <div className="spread">
            <h2>✧ แต่งตัว{a.character === "yui" ? "ยูอิ" : "โมโมะ"}</h2>
            <small>{unlocked ? "ปลดล็อกเพื่อทดสอบ" : "LV. " + level}</small>
          </div>
          <div className="type-tabs">
            <button
              className={a.character === "yui" ? "selected" : ""}
              onClick={() => save({ character: "yui", hair: 0 })}
            >
              ยูอิ
            </button>
            <button
              className={a.character === "momo" ? "selected" : ""}
              onClick={() => save({ character: "momo", hair: 5 })}
            >
              โมโมะ
            </button>
          </div>
          <div className="adventure-tabs">
            {[
              ["outfit", "ชุด"],
              ["hair", "ทรงผม"],
              ["accessory", "เครื่องประดับ"],
              ["favorites", "ชุดโปรด"],
            ].map(([id, name]) => (
              <button
                key={id}
                className={tab === id ? "selected" : ""}
                onClick={() => setTab(id)}
              >
                {name}
              </button>
            ))}
          </div>
          {tab === "outfit" && (
            <div className="wardrobe-grid">
              {bodyIndices.map((id, i) => (
                <button
                  key={id}
                  disabled={
                    !unlocked &&
                    i > Math.floor(level / 2) &&
                    !(tier >= 2 && i === 3) &&
                    !(tier >= 4 && i === 5) &&
                    !(tier >= 5 && i === 7)
                  }
                  className={a.outfit === id ? "selected" : ""}
                  aria-pressed={a.outfit === id}
                  onClick={() => save({ outfit: id })}
                >
                  <Companion appearance={{ ...a, outfit: id }} size={100} />
                  <b>{looks[i]}</b>
                  <small>{a.outfit === id ? "สวมใส่อยู่" : "สวมใส่"}</small>
                </button>
              ))}
            </div>
          )}
          {tab === "hair" && (
            <div className="wardrobe-grid">
              {hairIndices.map((id, i) => (
                <button
                  key={id}
                  disabled={
                    !unlocked && i > Math.floor(level / 2) && i > tier - 1
                  }
                  className={a.hair === id ? "selected" : ""}
                  aria-pressed={a.hair === id}
                  onClick={() => save({ hair: id })}
                >
                  <Companion appearance={{ ...a, hair: id }} size={100} />
                  <b>{hairNames[i]}</b>
                </button>
              ))}
            </div>
          )}
          {tab === "accessory" && (
            <div className="accessory-grid">
              {[
                ["hat", "หมวกแม่มด", 2],
                ["glasses", "แว่นตา", 3],
                ["catEars", "ที่คาดผมหูแมว", 4],
                ["earrings", "ต่างหูดาว", 6],
              ].map(([key, label, index]) => (
                <button
                  key={key}
                  className={a[key as keyof FantasyState] ? "selected" : ""}
                  aria-pressed={Boolean(a[key as keyof FantasyState])}
                  onClick={() => save({ [key]: !a[key as keyof FantasyState] })}
                >
                  <i
                    className="accessory-preview"
                    style={{
                      backgroundPosition:
                        ((Number(index) % 4) * 100) / 3 +
                        "% " +
                        (Number(index) < 4 ? "0%" : "100%"),
                    }}
                  />
                  <span>{label}</span>
                </button>
              ))}
              {[
                ["skull", "กิ๊บหัวกะโหลก", 0],
                ["ribbon", "โบริบบิ้น", 1],
                ["pins", "กิ๊บไขว้", 5],
              ].map(([key, label, index]) => (
                <button
                  key={key}
                  className={a.accessory === key ? "selected" : ""}
                  aria-pressed={a.accessory === key}
                  onClick={() =>
                    save({
                      accessory: a.accessory === key ? "none" : String(key),
                    })
                  }
                >
                  <i
                    className="accessory-preview"
                    style={{
                      backgroundPosition:
                        ((Number(index) % 4) * 100) / 3 +
                        "% " +
                        (Number(index) < 4 ? "0%" : "100%"),
                    }}
                  />
                  <span>{label}</span>
                </button>
              ))}
              <button
                className={a.hand === "camera" ? "selected" : ""}
                aria-pressed={a.hand === "camera"}
                onClick={() =>
                  save({ hand: a.hand === "camera" ? "none" : "camera" })
                }
              >
                <i
                  className="accessory-preview"
                  style={{ backgroundPosition: "100% 100%" }}
                />
                <span>กล้องถ่ายรูป</span>
              </button>
            </div>
          )}
          {tab === "favorites" && (
            <div className="favorite-looks">
              <button
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
                        catEars: a.catEars,
                        earrings: a.earrings,
                      },
                    ],
                  })
                }
              >
                ＋ บันทึกชุดปัจจุบัน
              </button>
              {a.favorites.map((f, i) => (
                <button
                  key={i}
                  onClick={() =>
                    save({
                      ...f,
                      catEars: f.catEars ?? false,
                      earrings: f.earrings ?? false,
                    })
                  }
                >
                  {f.name}
                </button>
              ))}
            </div>
          )}
          <p className="wardrobe-status" role="status">
            {note}
          </p>
        </section>
      </div>
    </div>
  );
}
