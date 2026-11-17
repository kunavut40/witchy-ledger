import type { FantasyState, Emotion } from "./model";
import { colors } from "./model";
export default function Companion({
  appearance: a,
  emotion = "idle",
  talking = false,
  size = 160,
}: {
  appearance: FantasyState;
  emotion?: Emotion;
  talking?: boolean;
  size?: number;
}) {
  const color = colors[a.outfit % colors.length];
  const short = a.hair === 5 || a.hair === 7;
  return (
    <svg
      className={
        "companion-sprite emotion-" + emotion + (talking ? " is-talking" : "")
      }
      width={size}
      height={size * 1.35}
      viewBox="0 0 64 86"
      shapeRendering="crispEdges"
      role="img"
      aria-label={a.character === "yui" ? "ยูอิ" : "โมโมะ"}
    >
      <g className="companion-idle">
        <path
          d={short ? "M14 13h36v25H14z" : "M12 14h40v49H12z"}
          fill={a.hairColor}
        />
        {(a.hair === 3 || a.hair === 9) && (
          <path d="M6 23h9v39H6z M50 23h9v39h-9z" fill={a.hairColor} />
        )}
        <path d="M24 63h6v18h-6z M35 63h6v18h-6z" fill="#292133" />
        <path d="M21 80h10v5H21z M34 80h11v5H34z" fill="#14121e" />
        {a.cape && (
          <path
            d="M19 39h27l10 37-15-6H23l-15 6z"
            fill="#37283f"
            stroke="#b28b4a"
            strokeWidth="1"
          />
        )}
        <path d="M22 40h20v19l6 12H16l6-12z" fill={color} />
        <path d="M24 41h16l-8 12z" fill="#e9d5bf" />
        <path d="M29 47h6v11h-6z M20 60h24v3H20z" fill="#c9a454" />
        <path d="M16 43h7v15h-7z M41 43h7v15h-7z" fill={color} />
        <path d="M16 57h7v5h-7z M41 57h7v5h-7z" fill="#e7b9ad" />
        <path d="M18 16h28v20h-4v5H22v-5h-4z" fill="#ebc3b1" />
        <path
          d="M17 13h30v9H17z M19 20h7v7h-7z M37 20h9v7h-9z"
          fill={a.hairColor}
        />
        <path
          d="M21 28h8v6h-8z M36 28h8v6h-8z"
          fill="#762e4b"
          className="companion-eyes"
        />
        <path d="M23 28h3v3h-3z M38 28h3v3h-3z" fill="#ffbbac" />
        <path
          d="M22 35h6v2h-6z M38 35h5v2h-5z"
          fill="#d88c9c"
          opacity={emotion === "embarrassed" ? 1 : 0.4}
        />
        <path className="companion-mouth" d="M30 36h5v2h-5z" fill="#9a5260" />
        {a.glasses && (
          <path
            d="M19 27h11v9H19z M34 27h11v9H34z M30 30h4"
            fill="none"
            stroke="#c1a878"
          />
        )}
        {a.accessory === "skull" || a.character === "momo" ? (
          <g>
            <path d="M43 12h10v8H43z M45 20h6v3h-6z" fill="#eadac9" />
            <path d="M45 14h2v3h-2z M49 14h2v3h-2z" fill="#302231" />
          </g>
        ) : (
          <path
            d="M12 16l-7-5v13l7-4 7 4V11z"
            fill="#a25c72"
            stroke="#dbb56c"
          />
        )}
        {a.hat && (
          <path d="M29 1h8l8 13h9v5H9v-5h9z" fill="#35263e" stroke="#c3a066" />
        )}
        {a.hand === "staff" ? (
          <path d="M49 41h3v37h-3z M46 33h9v10h-9z" fill="#bfa56b" />
        ) : a.hand === "book" ? (
          <path d="M43 48h13v17H43z M46 51h7v2h-7z" fill="#ad8b61" />
        ) : a.hand === "bag" ? (
          <path d="M43 55h13v14H43z" fill="#876978" />
        ) : null}
        {a.outfit === 10 && (
          <path d="M19 46h25v14H19z" fill="#a99cb8" opacity=".4" />
        )}
        {emotion === "annoyed" && (
          <path d="M21 25l8 3 M36 28l8-3" stroke="#402533" strokeWidth="2" />
        )}
        {emotion === "surprised" && <path d="M30 35h4v5h-4z" fill="#7d3e57" />}
      </g>
    </svg>
  );
}
