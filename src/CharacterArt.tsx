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
  appearance,
}: {
  character?: string;
  size?: number;
  emotion?: string;
  talking?: boolean;
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
      style={
        {
          width: size,
          height: size,
          "--body-x": ((body % 4) * 100) / 3 + "%",
          "--body-y": body < 4 ? "0%" : "100%",
          "--head-x": head * 25 + "%",
          "--head-dx": head === 3 ? "3.5%" : head === 1 ? "1%" : "0%",
          "--head-dy": head === 4 ? "2.4%" : "2%",
          "--head-y": character === "momo" ? "100%" : "0%",
        } as CSSProperties
      }
    >
      <span className="rig-stage">
        <i className="rig-body" />
        <span className="rig-head-group">
          <i className="rig-head" />
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
