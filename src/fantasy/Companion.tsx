import CharacterArt from "../CharacterArt";
import type { FantasyState, Emotion } from "./model";
export default function Companion({
  appearance: a,
  emotion = "idle",
  talking = false,
  mouthFrame = 0,
  size = 160,
}: {
  appearance: FantasyState;
  emotion?: Emotion;
  talking?: boolean;
  mouthFrame?: number;
  size?: number;
}) {
  return (
    <span
      style={
        {
          "--eye-position":
            a.eyeColor === "black"
              ? "0%"
              : a.eyeColor === "violet"
                ? "50%"
                : "100%",
        } as React.CSSProperties
      }
    >
      <CharacterArt
        character={a.character}
        size={size}
        emotion={emotion}
        talking={talking}
        mouthFrame={mouthFrame}
        appearance={a}
      />
    </span>
  );
}
