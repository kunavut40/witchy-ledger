import type { State } from "../domain";
import { db } from "../db";
import { readFantasy, updateFantasy } from "./Fantasy";
import {
  affinityTier,
  affinityTitles,
  readRuntime,
  RUNTIME_KEY,
} from "./engine";
import { eventRegistry } from "./events";
export default function CompanionPreferences({ s }: { s: State }) {
  const f = readFantasy(s),
    get = (id: string) => s.settings.find((x) => x.id === id)?.value || "";
  const r = readRuntime(get(RUNTIME_KEY), f),
    m = r.characters[f.character],
    tier = affinityTier(m.affinity);
  const put = (id: string, value: string) =>
    void db.settings.put({ id, value });
  let dates: Record<string, string> = {};
  try {
    dates = JSON.parse(get("companion.debtDueDates") || "{}");
  } catch {
    /* optional settings */
  }
  return (
    <div className="companion-preferences">
      <p>
        ✦ ความสนิทกับ{f.character === "yui" ? "ยูอิ" : "โมโมะ"}:{" "}
        {affinityTitles[tier - 1]} · {m.affinity} วัน
      </p>
      <p className="tiny muted">
        เพิ่มได้วันละหนึ่งจากการเข้าแอพ คุย หรือบันทึก ไม่ขึ้นกับยอดใช้จ่าย
      </p>
      <details>
        <summary>
          ความทรงจำล่าสุดของ{f.character === "yui" ? "ยูอิ" : "โมโมะ"}
        </summary>
        {m.history.length ? (
          <ul>
            {m.history
              .slice(-5)
              .reverse()
              .map((h) => (
                <li key={h.key}>
                  {eventRegistry[h.event]?.title} ·{" "}
                  {new Date(h.at).toLocaleDateString("th-TH")}
                </li>
              ))}
          </ul>
        ) : (
          <p className="tiny muted">ยังไม่มีความทรงจำที่บันทึกไว้</p>
        )}
      </details>
      <label className="check">
        <input
          type="checkbox"
          checked={f.animations !== false}
          onChange={(e) => void updateFantasy({ animations: e.target.checked })}
        />{" "}
        อนิเมชั่นตัวละครและข้อความ
      </label>
      <label>
        วันเงินเดือนออก (ไม่บังคับ)
        <input
          aria-label="วันเงินเดือนออก"
          type="number"
          min="1"
          max="31"
          step="1"
          value={get("companion.salaryDay")}
          onChange={(e) => put("companion.salaryDay", e.target.value)}
          placeholder="ไม่ระบุ"
        />
      </label>
      <label className="check">
        <input
          type="checkbox"
          checked={get("companion.birthdayConsent") === "true"}
          onChange={(e) =>
            put("companion.birthdayConsent", String(e.target.checked))
          }
        />{" "}
        อนุญาตให้จำวันเกิดเพื่ออวยพรในเครื่อง
      </label>
      {get("companion.birthdayConsent") === "true" && (
        <label>
          วันเกิด (เก็บเฉพาะวันและเดือน)
          <input
            aria-label="วันเกิด"
            type="date"
            value={
              get("companion.birthday")
                ? "2000-" + get("companion.birthday")
                : ""
            }
            onChange={(e) => put("companion.birthday", e.target.value.slice(5))}
          />
        </label>
      )}
      {s.accounts
        .filter((a) => a.active && a.kind === "credit")
        .map((a) => (
          <label key={a.id}>
            วันครบกำหนด {a.name} (ไม่บังคับ)
            <input
              type="date"
              value={dates[a.id] || ""}
              onChange={(e) =>
                put(
                  "companion.debtDueDates",
                  JSON.stringify({ ...dates, [a.id]: e.target.value }),
                )
              }
            />
          </label>
        ))}
    </div>
  );
}
