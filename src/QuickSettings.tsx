import { useState } from "react";
import type { State } from "./domain";
import { db } from "./db";
export interface QuickConfig {
  income: string[];
  expense: string[];
  coffee: number[];
  fuel: number[];
  theme: string;
}
export const defaultQuick: QuickConfig = {
  income: ["income-0", "income-3", "income-5"],
  expense: ["food-1", "travel-0", "other"],
  coffee: [20, 25],
  fuel: [120, 500],
  theme: "classic",
};
export function readQuick(s: State): QuickConfig {
  try {
    return {
      ...defaultQuick,
      ...JSON.parse(
        s.settings.find((x) => x.id === "quick.config")?.value || "{}",
      ),
    };
  } catch {
    return defaultQuick;
  }
}
export default function QuickSettings({
  s,
  act,
}: {
  s: State;
  act: (fn: () => Promise<unknown>, message?: string) => Promise<boolean>;
}) {
  const [config, setConfig] = useState(() => readQuick(s));
  return (
    <section className="card">
      <h2>ธีมและเมนูบันทึกด่วน</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void act(
            () =>
              db.settings.put({
                id: "quick.config",
                value: JSON.stringify(config),
              }),
            "บันทึกการตั้งค่าแล้ว",
          );
        }}
      >
        <label>
          ธีม
          <select
            value={config.theme}
            onChange={(e) => setConfig({ ...config, theme: e.target.value })}
          >
            {["classic", "moon", "botanical", "starlight", "arcane"].map(
              (t) => (
                <option key={t}>{t}</option>
              ),
            )}
          </select>
        </label>
        {(["income", "expense"] as const).map((k) => (
          <fieldset key={k}>
            <legend>{k === "income" ? "วงรายรับ" : "วงรายจ่าย"}</legend>
            {config[k].map((id, i) => (
              <label key={i}>
                วงที่ {i + 1}
                <select
                  value={id}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      [k]: config[k].map((v, j) =>
                        i === j ? e.target.value : v,
                      ),
                    })
                  }
                >
                  {s.categories
                    .filter((c) => c.kind === k && !c.archived)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </label>
            ))}
          </fieldset>
        ))}
        {(["coffee", "fuel"] as const).map((k) => (
          <fieldset key={k}>
            <legend>{k === "coffee" ? "ราคากาแฟ" : "ราคาน้ำมัน"}</legend>
            {config[k].map((n, i) => (
              <input
                key={i}
                aria-label={
                  (k === "coffee" ? "กาแฟ" : "น้ำมัน") + " ราคา " + (i + 1)
                }
                type="number"
                min="1"
                step="1"
                required
                value={n}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    [k]: config[k].map((v, j) =>
                      i === j ? Number(e.target.value) : v,
                    ),
                  })
                }
              />
            ))}
          </fieldset>
        ))}
        <button className="primary" type="submit">
          บันทึกการตั้งค่า
        </button>
      </form>
    </section>
  );
}
