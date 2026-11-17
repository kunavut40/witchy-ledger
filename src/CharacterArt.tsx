export default function CharacterArt({
  character = "yui",
  size = 100,
  emotion = "idle",
  talking = false,
}: {
  character?: string;
  size?: number;
  emotion?: string;
  talking?: boolean;
}) {
  return (
    <span
      role="img"
      aria-label={character === "momo" ? "โมโมะ" : "ยูอิ"}
      className={
        "character-art " +
        (character === "momo" ? "art-momo" : "art-yui") +
        " art-" +
        emotion +
        (talking ? " art-talking" : "")
      }
      style={{ width: size, height: size * 1.35 }}
    />
  );
}
