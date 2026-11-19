import { useEffect, useState, type CSSProperties } from "react";
export const SCENE_TRANSITION_MS = 700;
export function sceneGust(direction: "in" | "out" = "in") {
  if (typeof window !== "undefined")
    window.dispatchEvent(new CustomEvent("witchy-gust", { detail: direction }));
}
export default function SceneTransition() {
  const [scene, setScene] = useState<{ key: number; direction: string } | null>(
    null,
  );
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let sequence = 0;
    const on = (e: Event) => {
      clearTimeout(timer);
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setScene(null);
        return;
      }
      setScene({
        key: ++sequence,
        direction: (e as CustomEvent).detail === "out" ? "out" : "in",
      });
      timer = setTimeout(() => setScene(null), SCENE_TRANSITION_MS);
    };
    window.addEventListener("witchy-gust", on);
    return () => {
      window.removeEventListener("witchy-gust", on);
      clearTimeout(timer);
    };
  }, []);
  return scene ? (
    <div
      key={scene.key}
      className={"scene-gust gust-" + scene.direction}
      aria-hidden="true"
      style={
        { "--scene-duration": SCENE_TRANSITION_MS + "ms" } as CSSProperties
      }
    >
      {[0, 1, 2, 3].map((i) => (
        <i
          key={i}
          className="gust-leaf"
          style={
            {
              top: 15 + i * 22 + "%",
              animationDelay: i * 0.028 + "s",
              "--leaf-size": [24, 32, 27, 22][i] + "px",
              "--leaf-angle": [-28, 18, -12, 32][i] + "deg",
            } as CSSProperties
          }
        />
      ))}
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="gust-wind"
          style={{ top: 24 + i * 26 + "%", animationDelay: i * 0.035 + "s" }}
        />
      ))}
    </div>
  ) : null;
}
