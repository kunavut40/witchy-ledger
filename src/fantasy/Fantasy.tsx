import WardrobeRoom from "./WardrobeRoom";
import CompanionPreferences from "./CompanionPreferences";
export { default as CompanionWidget } from "./CompanionWidget";
import { db } from "../db";
import type { State } from "../domain";

import { parseFantasy, type FantasyState } from "./model";
import { menuSound } from "./sound";
export function readFantasy(s: State) {
  return parseFantasy(s.settings.find((x) => x.id === "fantasy.state")?.value);
}
export async function updateFantasy(patch: Partial<FantasyState>) {
  await db.transaction("rw", db.settings, async () => {
    const old = parseFantasy((await db.settings.get("fantasy.state"))?.value);
    const keys = [
      "hair",
      "hairColor",
      "outfit",
      "hat",
      "glasses",
      "accessory",
      "cape",
      "hand",
      "catEars",
      "earrings",
    ] as const;
    const look = Object.fromEntries(keys.map((k) => [k, old[k]]));
    const switching = patch.character && patch.character !== old.character;
    const looks = { ...old.characterLooks, [old.character]: look };
    const restored = switching
      ? looks[patch.character!] || {
          hair: 0,
          outfit: 1,
          hat: false,
          glasses: false,
          accessory: patch.character === "momo" ? "skull" : "none",
          catEars: false,
          earrings: false,
          hand: "none",
          cape: false,
        }
      : {};
    await db.settings.put({
      id: "fantasy.state",
      value: JSON.stringify({
        ...old,
        ...patch,
        ...restored,
        characterLooks: looks,
      }),
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
      <CompanionPreferences s={s} />
      <p className="tiny muted">
        เสียงสังเคราะห์เบา ๆ ในเครื่อง เริ่มเล่นเมื่อกดเมนูเท่านั้น ไม่มีเสียงพูด
      </p>
    </div>
  );
}
export function FantasyRoom({ s }: { s: State; wardrobe?: boolean }) {
  return <WardrobeRoom s={s} />;
}
