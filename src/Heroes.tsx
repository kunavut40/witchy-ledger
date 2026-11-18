import CharacterArt from "./CharacterArt";
import type { CSSProperties, ReactNode } from "react";
import { ranks } from "./progression";
export const heroes = [
  [
    "nevermore",
    "Nevermore",
    "เจ้าแห่งเงาวิญญาณ",
    "#8953af",
    "#2a203e",
    "#f0a364",
    "horn",
  ],
  [
    "invoker",
    "Kael • Invoker",
    "ผู้ทอเวทสามธาตุ",
    "#be8b57",
    "#ead1af",
    "#e2a4ff",
    "crown",
  ],
  [
    "juggernaut",
    "Yurnero",
    "คมดาบใต้หน้ากาก",
    "#b65b55",
    "#efdfb7",
    "#ffbc6e",
    "mask",
  ],
  [
    "phantom",
    "Mortred",
    "เงาจันทร์สังหาร",
    "#687eaf",
    "#bad0d1",
    "#a7f6ed",
    "hood",
  ],
  [
    "antimage",
    "Magina",
    "ผู้ล่าเวทมนตร์",
    "#b274b5",
    "#d8a78a",
    "#e0a9ff",
    "blade",
  ],
  ["crystal", "Rylai", "ราชินีเหมันต์", "#82bce0", "#f5d6c6", "#a7f7ff", "crown"],
  ["lina", "Lina", "เปลวเพลิงพิฆาต", "#c66a4c", "#f0c1a3", "#ffe295", "flame"],
  ["drow", "Traxex", "ศรน้ำแข็งรัตติกาล", "#7895b7", "#afc4df", "#a9e9ff", "hood"],
  ["skeleton", "Leoric", "ราชันกระดูก", "#78977a", "#e0d6ae", "#a9ef8a", "skull"],
  [
    "lich",
    "Kel’Thuzad",
    "ผู้ผนึกวิญญาณเยือกแข็ง",
    "#7088c6",
    "#aac8e1",
    "#9defff",
    "skull",
  ],
  [
    "axe",
    "Mogul Khan",
    "ขวานโลหิตคำราม",
    "#b2605b",
    "#c8836b",
    "#ffd580",
    "axe",
  ],
  ["sven", "Sven", "อัศวินดาบคราม", "#6784b0", "#b7c7dc", "#b8eaff", "helmet"],
  ["pudge", "Pudge", "ผู้เฝ้าตะขออาคม", "#92916c", "#c0b18a", "#bcf78b", "hook"],
  ["storm", "Raijin", "จอมพายุสายฟ้า", "#6b9fb8", "#b7e3eb", "#a7f8ff", "hat"],
  ["earth", "Raigor", "ผู้ปลุกปฐพี", "#a7825c", "#bb906c", "#ffde98", "beast"],
  ["queen", "Akasha", "ราชินีรัตติกาล", "#b06c89", "#d7aac2", "#fc9ab7", "horn"],
  [
    "spectre",
    "Mercurial",
    "วิญญาณข้ามมิติ",
    "#8a69bd",
    "#a99acb",
    "#ddaaff",
    "horn",
  ],
  [
    "terror",
    "Terrorblade",
    "ปีกเงาอสูร",
    "#6b8e9d",
    "#92adb4",
    "#99f1d3",
    "horn",
  ],
  ["furion", "Furion", "ผู้พิทักษ์พฤกษา", "#7e9b75", "#d9b48a", "#c4f2a0", "antler"],
  [
    "mirana",
    "Mirana",
    "พรานดาวจันทรา",
    "#9b8bba",
    "#e6bfad",
    "#d7c6ff",
    "tiara",
  ],
].map(([id, name, title, color, skin, glow, form]) => ({
  id,
  name,
  title,
  color,
  skin,
  glow,
  form,
}));
export function RankFrame({
  rankIndex = 0,
  size = 60,
  children,
}: {
  rankIndex?: number;
  size?: number;
  children: ReactNode;
}) {
  const r = ranks[rankIndex] || ranks[0];
  return (
    <span
      className={"rank-frame rank-" + rankIndex}
      style={{ "--rank": r.color, width: size, height: size } as CSSProperties}
    >
      <span className="rank-portrait">{children}</span>
      <svg
        className="rank-ornament"
        viewBox="0 0 64 64"
        shapeRendering="crispEdges"
        aria-hidden="true"
      >
        <path
          d="M16 16 L23 10 H41 L48 16 V42 L42 51 L32 57 L22 51 L16 42Z"
          fill="none"
          stroke="#bc9856"
          strokeWidth="3"
        />
        {[0, 1].map((side) => (
          <g key={side} transform={side ? "translate(64 0) scale(-1 1)" : ""}>
            <path
              d="M21 54L12 44L8 28L12 15"
              fill="none"
              stroke="#786548"
              strokeWidth="2"
            />
            {[0, 1, 2, 3, 4].map((i) => (
              <path
                key={i}
                d={`M${12 + i * 1.5} ${20 + i * 7} l-8 -7 v7 l7 6 l5 -6 v-6Z`}
                fill={i % 2 ? "#dce3c3" : r.color}
                stroke="#85724e"
                strokeWidth="1"
              />
            ))}
          </g>
        ))}
        <path
          d="M22 12L20 4L28 8L32 1L36 8L44 4L42 12Z"
          fill="#e6c47c"
          stroke="#94764a"
        />
        <path
          d="M29 7L32 4L35 7L32 11Z M28 54L32 50L36 54L32 60Z"
          fill="#c2a1db"
          stroke="#94764a"
        />
      </svg>
    </span>
  );
}
export function Hero({ id, size = 64 }: { id: string; size?: number }) {
  return (
    <span className="portrait-crop" style={{ width: size, height: size }}>
      <CharacterArt
        character={id === "momo" ? "momo" : "yui"}
        size={size * 1.4}
      />
    </span>
  );
}
