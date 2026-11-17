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
          d="M6 13V6h13V3h26v3h13v13h3v26h-3v13H45v3H19v-3H6V45H3V19h3z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        {rankIndex > 1 && (
          <path
            d="M3 20H0v22h3v7h6v-5H6V22h3v-7H3z M61 20h3v22h-3v7h-6v-5h3V22h-3v-7h6z"
            fill="currentColor"
          />
        )}
        {rankIndex > 3 && (
          <path
            d="M14 7l-5-5h10l3 5z M50 7l5-5H45l-3 5z M11 55l-6 7h12l5-7z M53 55l6 7H47l-5-7z"
            fill="currentColor"
          />
        )}
        <path d="M28 57h8v5h-8z M30 54h4v10h-4z" fill="currentColor" />
        {rankIndex > 5 && <path d="M25 4l7-4 7 4-7 7z" fill="#fff1b4" />}
      </svg>
    </span>
  );
}
export function Hero({ id, size = 64 }: { id: string; size?: number }) {
  const index = heroes.findIndex((h) => h.id === id);
  const h = heroes[index < 0 ? 0 : index];
  return (
    <svg
      className="hero-pixel"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      shapeRendering="crispEdges"
      role="img"
      aria-label={h.name}
      style={
        {
          "--hero-glow": h.glow,
          "--hero-color": h.color,
          animationDelay: `${Math.max(index, 0) * -0.17}s`,
        } as CSSProperties
      }
    >
      <defs>
        <linearGradient id={"bg-" + h.id} x2="1" y2="1">
          <stop stopColor={h.color} />
          <stop offset="1" stopColor="#151827" />
        </linearGradient>
      </defs>
      <path fill={"url(#bg-" + h.id + ")"} d="M0 0h64v64H0z" />
      <path d="M0 52l32-16 32 16-32 12z" fill="#141628" opacity=".5" />
      <g className="hero-idle">
        <path d="M12 43h38v5h6v16H6V48h6z" fill="#151827" />
        <path
          d="M10 43h16l6 9 7-9h14v10H43l-5 11H23l-5-11h-8z"
          fill={h.color}
        />
        <path d="M11 44h12v4H11z M43 44h9v4h-9z" fill={h.glow} opacity=".55" />
        <path d="M19 16h26v6h4v23h-5v6H20v-6h-5V23h4z" fill="#242436" />
        <path d="M21 22h22v22H21z M24 44h16v5H24z" fill={h.skin} />
        <path d="M39 23h4v20h-4z M34 45h6v4h-6z" fill="#30283e" opacity=".28" />
        <path d="M22 32h8v3h-8z M35 32h7v3h-7z" fill="#282439" />
        <path d="M25 41h13v3H25z" fill="#654b63" />
        {["horn", "antler"].includes(h.form) && (
          <>
            <path
              d="M18 24h-7V14H7V4h6v9h7v5h24v-5h7V4h6v10h-4v10h-7v5H18z"
              fill={h.color}
            />
            <path d="M12 7h3v9h7v4H12z M49 10h3v8h-7v-3h4z" fill={h.glow} />
          </>
        )}
        {["crown", "tiara"].includes(h.form) && (
          <>
            <path d="M17 24V10h5v7h6V8h7v9h6v-7h6v14z" fill={h.color} />
            <path d="M20 22h24v4H20z M29 14h7v7h-7z" fill="#ead08f" />
            <path d="M31 15h3v4h-3z" fill={h.glow} />
          </>
        )}
        {h.form === "hood" && (
          <>
            <path d="M12 38V18h5v-6h27v5h7v23h-7V24H20v14z" fill={h.color} />
            <path d="M16 21l17-8 14 8H22v6h-6z" fill={h.glow} opacity=".4" />
          </>
        )}
        {["helmet", "mask"].includes(h.form) && (
          <>
            <path
              d="M16 20h30v26h-8V30H27v16H16z"
              fill={h.form === "mask" ? "#e8d8b6" : h.color}
            />
            <path
              d="M30 16h5v27h-5z M18 22h26v4H18z"
              fill={h.form === "mask" ? "#ad5958" : "#adc6e0"}
            />
            <path d="M20 36h5v5h-5z M38 36h5v5h-5z" fill={h.color} />
          </>
        )}
        {h.form === "skull" && (
          <>
            <path d="M19 22h26v22h-5v7H25v-7h-6z" fill={h.skin} />
            <path
              d="M21 30h10v8H21z M35 30h8v8h-8z M30 39h5v5h-5z M28 47h2v4h-2z M35 47h2v4h-2z"
              fill="#25253c"
            />
          </>
        )}
        {h.form === "hat" && (
          <>
            <path
              d="M10 23h44v5H10z M16 13h32v10H16z M21 9h23v4H21z"
              fill={h.color}
            />
            <path d="M17 21h30v4H17z" fill="#d9bb8c" />
          </>
        )}
        {h.form === "beast" && (
          <>
            <path
              d="M14 21h9v23h-9z M41 21h9v23h-9z M18 43h27v10H18z"
              fill="#9a6a4f"
            />
            <path d="M24 36h17v10H24z" fill="#e4bb83" />
          </>
        )}
        {h.form === "blade" && (
          <path
            d="M19 17h26v11H19z M15 22h5v18h-5z M44 22h5v18h-5z"
            fill={h.color}
          />
        )}
        {h.form === "flame" && (
          <path
            d="M13 27V17h5V9h7V5h7v6h10v6h7v17h-6V23H22v9h-9z"
            fill="#df8253"
          />
        )}
        {["axe", "hook"].includes(h.form) && (
          <path
            d="M18 17h28v11H18z M20 40h6v10h-6z M38 40h6v10h-6z"
            fill={h.form === "axe" ? "#57364a" : "#79825d"}
          />
        )}
        <g className="hero-eyes" fill={h.glow}>
          <path d="M23 32h6v3h-6z M36 32h5v3h-5z" />
        </g>
        <g className="hero-weapon">
          <path d="M51 31h4v30h-4z" fill="#cbb28a" />
          <path
            d={
              ["axe", "hook", "beast"].includes(h.form)
                ? "M47 31h13v12H47z M55 28h5v6h-5z"
                : "M51 14h4v5h3v21h-3v5h-4v-5h-3V19h3z"
            }
            fill={h.glow}
          />
          <path d="M52 21h2v16h-2z" fill="#fff6cf" />
        </g>
        <path
          d="M8 10h3v3H8z M56 5h2v2h-2z M4 35h2v2H4z"
          fill={h.glow}
          opacity=".8"
        />
      </g>
    </svg>
  );
}
