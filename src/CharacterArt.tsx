import { createContext, useContext, type CSSProperties } from "react";
import type { FantasyState } from "./fantasy/model";
export const CharacterAppearanceContext = createContext<Partial<FantasyState>>(
  {},
);
export const bodyIndices = [0, 7, 1, 10, 24, 18, 8, 13];
export const hairIndices = [0, 3, 5, 4, 11];
export default function CharacterArt({
  character = "yui",
  size = 100,
  emotion = "idle",
  talking = false,
  mouthFrame = 0,
  appearance,
}: {
  character?: string;
  size?: number;
  emotion?: string;
  talking?: boolean;
  mouthFrame?: number;
  outfit?: number;
  appearance?: Partial<FantasyState>;
}) {
  const inherited = useContext(CharacterAppearanceContext),
    a = appearance || inherited;
  const body =
    bodyIndices.indexOf(a.outfit ?? 0) >= 0
      ? bodyIndices.indexOf(a.outfit ?? 0)
      : 2;
  const head = Math.max(0, hairIndices.indexOf(a.hair ?? 0));
  const accessory = (name: string, idx: number) => (
    <i
      key={name}
      className={"rig-accessory rig-" + name}
      style={
        {
          "--accessory-x": ((idx % 4) * 100) / 3 + "%",
          "--accessory-y": idx < 4 ? "0%" : "100%",
        } as CSSProperties
      }
    />
  );
  return (
    <span
      role="img"
      aria-label={character === "momo" ? "โมโมะ" : "ยูอิ"}
      className={
        "character-art modular-character " +
        (character === "momo" ? "art-momo" : "art-yui") +
        " art-" +
        emotion +
        (talking ? " art-talking" : "")
      }
      data-body={body}
      data-hair={head}
      data-motion={a.animations === false ? "off" : "on"}
      data-mouth={talking ? mouthFrame % 3 : 0}
      style={
        {
          width: size,
          height: size,
          "--body-x": ((body % 4) * 100) / 3 + "%",
          "--body-y": body < 4 ? "0%" : "100%",
          "--pose-x": (body * 100) / 7 + "%",
          "--head-x": head * 25 + "%",
          "--head-dx":
            character === "momo"
              ? head === 3
                ? "3.5%"
                : head === 1
                  ? "1%"
                  : "0%"
              : "0%",
          "--head-dy":
            character === "momo"
              ? head === 4
                ? "3.6%"
                : "3.2%"
              : head === 4
                ? "4.1%"
                : "3.8%",
          "--head-y": character === "momo" ? "100%" : "0%",
        } as CSSProperties
      }
    >
      <span className="rig-stage">
        <i className="rig-body" />
        <span className="rig-head-group">
          <i className="rig-head" />
          <svg
            className="rig-face-animation"
            viewBox="0 0 512 512"
            aria-hidden="true"
            focusable="false"
          >
            <g className="rig-blink">
              <path
                className="eyelid-skin"
                d={
                  character === "momo"
                    ? "M207 151L237 148L239 172L209 173Z M259 150L292 149L292 173L259 173Z"
                    : "M217 144L245 147L246 169L218 166Z M267 145L297 140L299 165L268 170Z"
                }
              />
              <path
                className="eyelid-line"
                d={
                  character === "momo"
                    ? "M211 164L235 166 M263 165L288 163"
                    : "M220 160L242 162 M271 161L294 157"
                }
              />
            </g>
            <g
              className="rig-mouth"
              transform={
                character === "momo"
                  ? "translate(246 189)"
                  : "translate(256 185)"
              }
            >
              <ellipse className="mouth-skin" rx="11" ry="10" />
              <path className="mouth-frame mouth-0" d="M-5 0L0 2L5 0" />
              <path className="mouth-frame mouth-1" d="M-5 -2L5 -2L4 4L-3 4Z" />
              <path
                className="mouth-frame mouth-2"
                d="M-5 -5L4 -5L7 -1L5 6L-3 7L-6 2Z"
              />
            </g>
            <g className="rig-blush" fill="#ef8f9d">
              <ellipse cx="217" cy="179" rx="12" ry="5" />
              <ellipse cx="293" cy="178" rx="11" ry="5" />
            </g>
            <g
              className="rig-puffed-cheeks"
              fill="#ffe1d0"
              stroke="#e9ad9f"
              strokeWidth="1.5"
            >
              <ellipse cx="216" cy="179" rx="8" ry="7" />
              <ellipse cx="296" cy="178" rx="8" ry="7" />
            </g>
            <g
              className="rig-emotion-mark"
              fill="none"
              strokeWidth="3"
              strokeLinecap="round"
            >
              {emotion === "annoyed" && (
                <path stroke="#c57180" d="M318 113v9m5 5h9m-14 5v8m-5-13h-9" />
              )}
              {emotion === "worried" && (
                <path
                  stroke="#8fc1df"
                  fill="#d7eff8"
                  d="M315 136q-11 15 0 15q11 0 0-15Z"
                />
              )}
              {emotion === "surprised" && (
                <path stroke="#e5bc73" d="M320 114v13m0 7v1m12-17 6-8" />
              )}
              {emotion === "happy" && (
                <path
                  stroke="#d78fad"
                  fill="#f1c3d5"
                  d="M317 116c-9-12-18 2 0 13c18-11 9-25 0-13Z"
                />
              )}
              {emotion === "proud" && (
                <path
                  stroke="#e1b663"
                  fill="#fff0b3"
                  d="M320 109l3 9 9 3-9 3-3 9-3-9-9-3 9-3Z"
                />
              )}
              {emotion === "sleepy" && (
                <path
                  stroke="#a397bb"
                  d="M312 117h12l-12 12h12m5-23h8l-8 8h8"
                />
              )}
            </g>
          </svg>
          {a.hat && accessory("hat", 2)}
          {a.glasses && accessory("glasses", 3)}
          {a.accessory === "skull" && accessory("clip", 0)}
          {a.accessory === "ribbon" && accessory("clip", 1)}
          {a.accessory === "pins" && accessory("clip", 5)}
          {a.catEars && accessory("ears", 4)}
          {a.earrings && accessory("earrings", 6)}
        </span>
        {a.hand === "camera" && accessory("camera", 7)}
      </span>
    </span>
  );
}
